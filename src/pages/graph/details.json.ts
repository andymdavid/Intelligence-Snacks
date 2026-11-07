import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseTranscript,evidenceTurnIndex } from '../../lib/transcript';
import type { APIRoute } from 'astro';
import { canonicalPublicGraph } from '../../lib/public-graph-data';
export const GET: APIRoute = () => {
  const data = canonicalPublicGraph();
  const episodeHref = new Map(data.candidates.map((item:any)=>[item.episodeId,item.episodeHref]));
  const transcriptCache=new Map<string,ReturnType<typeof parseTranscript>>();
  function evidenceFor(node:any) {
    const href = String(episodeHref.get(node.episodeId) || '');
    const slug = href.split('/').filter(Boolean).at(-1);
    const path = join(process.cwd(), 'src/content/transcripts', `${slug}.txt`);
    let turns=transcriptCache.get(href);if(!turns){turns=slug&&existsSync(path)?parseTranscript(readFileSync(path,'utf8')):[];transcriptCache.set(href,turns);}
    return node.evidence.map((evidence:any)=> {
      const index=evidenceTurnIndex(turns,evidence);
      return { ...evidence, sourceHref: index >= 0 ? `${href}#transcript-turn-${index}` : href, timestamp: index >= 0 ? turns[index]!.timestamp : null };
    });
  }
  return new Response(JSON.stringify(Object.fromEntries(data.knowledge.nodes.map((node: any) => [`knowledge:${node.id}`, { evidence: evidenceFor(node), sourceTranscriptRevisionId: node.sourceTranscriptRevisionId, reviewMethod: node.origin === 'pipeline' ? 'Automated extraction with transcript validation' : 'Editorial record' }]))), { headers: { 'content-type': 'application/json' } });
};
