import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseTranscript } from '../../lib/transcript';
import type { APIRoute } from 'astro';
import { canonicalPublicGraph } from '../../lib/public-graph-data';
export const GET: APIRoute = () => {
  const data = canonicalPublicGraph();
  const episodeHref = new Map(data.candidates.map((item:any)=>[item.episodeId,item.episodeHref]));
  function evidenceFor(node:any) {
    const href = String(episodeHref.get(node.episodeId) || '');
    const slug = href.split('/').filter(Boolean).at(-1);
    const path = join(process.cwd(), 'src/content/transcripts', `${slug}.txt`);
    const turns = slug && existsSync(path) ? parseTranscript(readFileSync(path,'utf8')) : [];
    const normalise = (text:string) => text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    return node.evidence.map((evidence:any)=> {
      const excerpt = normalise(evidence.excerpt.replace(/^[^\n]+?\(\d[^)]*\)\s*/,''));
      const index = turns.findIndex(turn=>normalise(turn.text).includes(excerpt.slice(0,120)));
      return { ...evidence, sourceHref: index >= 0 ? `${href}#transcript-turn-${index}` : href, timestamp: index >= 0 ? turns[index]!.timestamp : null };
    });
  }
  return new Response(JSON.stringify(Object.fromEntries(data.knowledge.nodes.map((node: any) => [`knowledge:${node.id}`, { evidence: evidenceFor(node), sourceTranscriptRevisionId: node.sourceTranscriptRevisionId, reviewMethod: node.origin === 'pipeline' ? 'Automated extraction with transcript validation' : 'Editorial record' }]))), { headers: { 'content-type': 'application/json' } });
};
