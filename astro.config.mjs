import { defineConfig } from 'astro/config';
import { subscribe } from './server/index.ts';
import { knowledgeSearch } from './server/knowledge-search.ts';
import { researchData } from './src/lib/agent-knowledge.ts';

const subscriptionDevRoute = {
  name: 'intelligence-snacks-subscription-dev-route',
  hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use('/api/knowledge/v1/search', (request, response) => {
        const result = knowledgeSearch(new Request(new URL(request.url, 'http://localhost/api/knowledge/v1/search'), { method: request.method }), researchData());
        response.statusCode = result.status;
        result.headers.forEach((value, key) => response.setHeader(key, value));
        result.text().then(body => response.end(body));
      });
      server.middlewares.use('/api/subscribe', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.end(JSON.stringify({ error: 'Method not allowed.' }));
          return;
        }
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const headers = new Headers();
        for (const [key, value] of Object.entries(request.headers)) {
          if (typeof value === 'string') headers.set(key, value);
          else if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
        }
        const result = await subscribe(new Request('http://localhost/api/subscribe', {
          method: 'POST', headers, body: Buffer.concat(chunks), duplex: 'half',
        }));
        response.statusCode = result.status;
        result.headers.forEach((value, key) => response.setHeader(key, value));
        response.end(Buffer.from(await result.arrayBuffer()));
      });
    },
  },
};

export default defineConfig({
  site: 'https://intelligencesnacks.com',
  output: 'static',
  devToolbar: { enabled: false },
  redirects: {
    '/people/[id]': '/contributors/[id]',
  },
  server: {
    host: true,
    allowedHosts: ['slim-tea-rose.lara1.runwingman.com', 'fast-log-cube.lara.runwingman.com'],
    port: Number(process.env.PORT ?? 4321),
  },
  integrations: [subscriptionDevRoute],
  build: {
    format: 'directory',
  },
});
