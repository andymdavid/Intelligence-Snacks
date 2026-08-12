import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const snacks = (await getCollection('snacks'))
    .filter(({ data }) => data.status === 'published')
    .sort((a, b) => (b.data.publishedAt?.getTime() ?? 0) - (a.data.publishedAt?.getTime() ?? 0));

  return rss({
    title: 'Intelligence Snacks',
    description: 'Long conversations about AI, software and business, developed into useful ideas.',
    site: context.site!,
    customData: '<language>en-AU</language>',
    items: snacks.map((snack) => ({
      title: snack.data.title,
      description: snack.data.standfirst,
      pubDate: snack.data.publishedAt,
      link: `/snacks/${snack.id}/`,
      categories: snack.data.themes.map(({ id }) => id),
    })),
  });
};
