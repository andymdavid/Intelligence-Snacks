import rss from '@astrojs/rss';
import { snacksNewestEpisodeFirst } from '../lib/content';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const snacks = snacksNewestEpisodeFirst((await getCollection('snacks')).filter(({ data }) => data.status === 'published'), await getCollection('episodes'));

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
      categories: [snack.data.theme.id],
    })),
  });
};
