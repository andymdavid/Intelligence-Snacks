import { rankEntries } from '../public/agents/research.mjs';

type Corpus = { schemaVersion: string; contentRevision: string; observations: any[] };
export function knowledgeSearch(request: Request, corpus: Corpus) {
  const params = new URL(request.url).searchParams;
  const headers = { 'Access-Control-Allow-Origin': '*', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'public, max-age=300' };
  const fail = (error: string, status = 400) => Response.json({ error }, { status, headers });
  if (!['GET', 'HEAD'].includes(request.method)) return fail('Use GET or HEAD.', 405);
  const query = (params.get('q') || '').trim();
  const limit = Number(params.get('limit') ?? 5);
  const format = params.get('format') ?? 'json';
  if (!query || query.length > 300) return fail('q must contain 1–300 characters.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 10) return fail('limit must be an integer from 1 to 10.');
  if (!['json', 'text'].includes(format)) return fail('format must be json or text.');
  const episode = params.get('episode');
  const speaker = params.get('speaker')?.toLowerCase();
  const entries = corpus.observations.map(node => ({ ...node, summary: `${node.summary}\n${node.evidence.map((e: any) => e.excerpt).join('\n')}` }));
  // Compute corpus weights before filtering so filters cannot change relevance ordering.
  const ranked = rankEntries(entries, query, entries.length).filter(({ entry }: any) =>
    (!episode || String(entry.episode.number) === episode || entry.episode.id === episode) &&
    (!speaker || entry.evidence.some((e: any) => e.speaker?.toLowerCase() === speaker)));
  const results = ranked.slice(0, limit).map(({ entry, score }: any) => {
    const node = corpus.observations.find(node => node.id === entry.id)!;
    const evidence = rankEntries(node.evidence.map((e: any) => ({ ...e, title: '', summary: e.excerpt })), query, 2).map(({ entry }: any) => {
      const { summary, title, ...evidence } = entry;
      return { ...evidence, excerpt: evidence.excerpt.slice(0, 900), truncated: evidence.excerpt.length > 900 };
    });
    return { id: node.id, title: node.title, summary: node.summary, score, recordUrl: node.recordUrl, citationUrl: node.citationUrl, episode: node.episode, evidence, connectionCount: node.connections.length };
  });
  const body = { schemaVersion: corpus.schemaVersion, contentRevision: corpus.contentRevision, query, total: ranked.length, limit, method: 'Whole-word lexical search over observation titles, summaries and evidence. Scores indicate relevance, not truth. Fetch recordUrl for full evidence and typed connections; follow only relevant neighbourUrl links, initially one hop.', results };
  const output = format === 'text' ? [body.method, `Revision: ${body.contentRevision}`, `Query: ${query}`, `Matches: ${body.total}; returned: ${results.length}`, ...results.map((r: any) => `\n${r.title}\n${r.summary}\nRecord: ${r.recordUrl}\nCitation: ${r.citationUrl}\nEpisode: ${r.episode.number}\nConnections: ${r.connectionCount}\n${r.evidence.map((e: any) => `${e.speaker || e.attributionStatus}: ${e.excerpt}${e.truncated ? ' [truncated; fetch record]' : ''}\nSource: ${e.sourceUrl} (${e.locator})`).join('\n')}`)].join('\n') : JSON.stringify(body);
  return new Response(request.method === 'HEAD' ? null : output, { headers: { ...headers, 'Content-Type': format === 'text' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8' } });
}
