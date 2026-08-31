import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

const site = 'https://intelligencesnacks.com';
const xml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]!);
const iso = (date?: Date) => date?.toISOString();

export const GET: APIRoute = async () => {
  const snacks = (await getCollection('snacks')).filter(({ data }) => data.status === 'published');
  const episodes = (await getCollection('episodes')).filter(({ data }) => data.status === 'published');
  const topics = await getCollection('topics');
  const people = await getCollection('people');
  const latest = [...snacks.map(({ data }) => data.updatedAt ?? data.publishedAt), ...episodes.map(({ data }) => data.updatedAt ?? data.originalPublishedAt)]
    .filter((date): date is Date => Boolean(date)).sort((a, b) => b.getTime() - a.getTime())[0];
  const urls: Array<{ path: string; lastmod?: string | undefined; image?: string | undefined; video?: { thumbnail: string; title: string; description: string; player: string } | undefined }> = [
    { path: '/', lastmod: iso(latest) },
    { path: '/about/' },
    { path: '/snacks/', lastmod: iso(latest) },
    { path: '/episodes/', lastmod: iso(latest) },
    { path: '/topics/', lastmod: iso(latest) },
    { path: '/graph/', lastmod: iso(latest) },
    { path: '/contributors/' },
    ...people.map((person) => ({ path: `/contributors/${person.id}/`, image: person.data.image ? new URL(person.data.image, site).href : undefined })),
    ...topics.map((topic) => ({ path: `/topics/${topic.id}/`, lastmod: iso(latest) })),
    ...episodes.map((episode) => {
      const youtubeId = episode.data.youtubeUrl ? new URL(episode.data.youtubeUrl).searchParams.get('v') : undefined;
      const thumbnail = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg` : undefined;
      return { path: `/episodes/${episode.id}/`, lastmod: iso(episode.data.updatedAt ?? episode.data.originalPublishedAt), image: thumbnail, video: youtubeId && thumbnail ? { thumbnail, title: episode.data.title, description: episode.data.summary, player: `https://www.youtube-nocookie.com/embed/${youtubeId}` } : undefined };
    }),
    ...snacks.map((snack) => ({ path: `/snacks/${snack.id}/`, lastmod: iso(snack.data.updatedAt ?? snack.data.publishedAt), image: new URL(`/social/snacks/${snack.id}.webp`, site).href })),
  ];

  const body = urls.map((entry) => `<url><loc>${xml(new URL(entry.path, site).href)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}${entry.image ? `<image:image><image:loc>${xml(entry.image)}</image:loc></image:image>` : ''}${entry.video ? `<video:video><video:thumbnail_loc>${xml(entry.video.thumbnail)}</video:thumbnail_loc><video:title>${xml(entry.video.title)}</video:title><video:description>${xml(entry.video.description)}</video:description><video:player_loc>${xml(entry.video.player)}</video:player_loc></video:video>` : ''}</url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${body}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
