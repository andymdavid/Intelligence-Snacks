import { extname, join, normalize } from 'node:path';

const distDirectory = join(import.meta.dir, '..', 'dist');
const port = Number(process.env.PORT ?? 80);
const rateLimitWindowMs = 15 * 60 * 1000;
const rateLimitMax = 10;
const requestsByAddress = new Map<string, { count: number; resetAt: number }>();

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { 'Cache-Control': 'no-store' },
});

const getAddress = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  ?? request.headers.get('x-real-ip')
  ?? 'unknown';

const isRateLimited = (address: string) => {
  const now = Date.now();
  const current = requestsByAddress.get(address);
  if (!current || current.resetAt <= now) {
    requestsByAddress.set(address, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }
  current.count += 1;
  return current.count > rateLimitMax;
};

async function subscribe(request: Request) {
  if (isRateLimited(getAddress(request))) return json({ error: 'Too many attempts. Please try again shortly.' }, 429);

  let payload: { email?: unknown; website?: unknown; source?: unknown };
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  if (typeof payload.website === 'string' && payload.website.length > 0) return json({ success: true });

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }

  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!publicationId || !apiKey) {
    console.error('Beehiiv subscription service is not configured.');
    return json({ error: 'Subscriptions are temporarily unavailable.' }, 503);
  }

  const source = typeof payload.source === 'string' && payload.source.length <= 80
    ? payload.source
    : 'website';

  try {
    const response = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'intelligence-snacks',
        utm_medium: 'website',
        utm_content: source,
        referring_site: request.headers.get('referer') ?? 'direct',
      }),
    });

    const result = await response.json().catch(() => ({})) as { errors?: Array<{ message?: string }> };
    if (!response.ok) {
      if (response.status === 409) return json({ error: 'This email is already subscribed.' }, 409);
      const message = result.errors?.[0]?.message;
      return json({ error: message || 'Unable to subscribe right now. Please try again.' }, response.status === 400 ? 400 : 502);
    }

    return json({ success: true });
  } catch (error) {
    console.error('Beehiiv subscription request failed.', error);
    return json({ error: 'Unable to subscribe right now. Please try again.' }, 502);
  }
}

async function staticResponse(request: Request) {
  const url = new URL(request.url);
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '').replace(/^[/\\]+/, '');
  const candidates = extname(safePath)
    ? [safePath]
    : [join(safePath, 'index.html'), `${safePath}.html`];

  for (const candidate of candidates) {
    const file = Bun.file(join(distDirectory, candidate));
    if (await file.exists()) {
      const immutable = /\.(?:css|js|svg|png|jpe?g|webp|woff2?|otf)$/i.test(candidate);
      return new Response(request.method === 'HEAD' ? null : file, {
        headers: { 'Cache-Control': immutable ? 'public, max-age=2592000, immutable' : 'no-cache' },
      });
    }
  }

  return new Response('Not found', { status: 404 });
}

Bun.serve({
  port,
  hostname: '0.0.0.0',
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === '/healthz') return new Response('ok');
    if (pathname === '/api/subscribe') {
      if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
      return subscribe(request);
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    return staticResponse(request);
  },
});

console.log(`Intelligence Snacks listening on port ${port}`);
