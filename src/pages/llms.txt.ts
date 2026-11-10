import { getCollection } from 'astro:content';
import { pilotIdeas } from '../lib/agent-knowledge';
import type { APIRoute } from 'astro';

const site = 'https://intelligencesnacks.com';

export const GET: APIRoute = async () => {
  const snacks = (await getCollection('snacks')).filter(({ data }) => data.status === 'published');
  const episodes = (await getCollection('episodes')).filter(({ data }) => data.status === 'published');
  const topics = await getCollection('topics');
  const people = await getCollection('people');
  const lines = [
    '# Intelligence Snacks',
    '',
    '> Intelligence Snacks is a podcast and connected archive about AI, software, business, work and technological change, produced by Other Stuff.',
    '',
    'The website is the canonical source for published Intelligence Snacks. Each snack is developed from exactly one source podcast episode and may connect to other ideas through typed relationships. Cite the canonical snack or episode URL when referring to its material.',
    '',
    '## Core resources',
    '',
    `- [Home](${site}/)`, `- [About](${site}/about/)`, `- [Snacks archive](${site}/snacks/)`,
    `- [Podcast episodes](${site}/episodes/)`, `- [Topics](${site}/topics/)`, `- [Knowledge graph](${site}/graph/)`, `- [Contributors](${site}/contributors/)`,
    `- [RSS feed](${site}/rss.xml)`, `- [XML sitemap](${site}/sitemap.xml)`,
    '',
    '## Research interface and shared ideas',
    '',
    `- [Agent documentation](${site}/for-agents/): Public read-only v1 interface; download the index and search locally. No server-side search query endpoint.`,
    `- [Research index](${site}/api/knowledge/v1/index.json): Accepted themes and observations, stable record URLs and source citations.`,
    `- [Reference retrieval client](${site}/agents/research.mjs)`,
    `- [Shared-idea guides](${site}/ideas/)`,
    ...pilotIdeas().map(idea => `- [${idea.title}](${idea.pageUrl}): ${idea.summary} Plain text: ${site}/ideas/${idea.id}.md`),
    '',
    'Cite speakers and original episodes for source claims. Agent-editorial themes do not establish agreement or verified fact. Evidence locator transcript-turn means an exact resolved passage; locator episode has no resolved timestamp.',
    '',
    '## Published snacks',
    '',
    ...snacks.map((snack) => `- [${snack.data.title}](${site}/snacks/${snack.id}/): ${snack.data.standfirst}`),
    '',
    '## Podcast episodes',
    '',
    ...episodes.map((episode) => `- [Episode ${episode.data.number}: ${episode.data.title}](${site}/episodes/${episode.id}/): ${episode.data.summary}`),
    '',
    '## Topics',
    '',
    ...topics.map((topic) => `- [${topic.data.name}](${site}/topics/${topic.id}/): ${topic.data.description}`),
    '',
    '## Contributors',
    '',
    ...people.map((person) => `- [${person.data.name}](${site}/contributors/${person.id}/): ${person.data.shortBio}`),
    '',
    '## Attribution and provenance',
    '',
    '- Snack pages identify their source episode and conversational contributors.',
    '- Episode pages provide the source video, audio link, participant identities and transcript.',
    '- Related-idea links describe explicit conceptual relationships between snacks.',
    '- Intelligence Snacks is produced by [Other Stuff](https://otherstuff.ai/).',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
};
