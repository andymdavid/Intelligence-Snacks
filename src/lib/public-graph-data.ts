import raw from '../data/graph.json';
import { readPublishedSnacks, resolvePublishedSnack } from './published-manifest';
// Published files are the authority for URLs and public copy; editorial draft identities are retained only on exact matches.
let cached: any;
export function canonicalPublicGraph() {
  if (cached) return cached;
  const data = structuredClone(raw) as any;
  const manifest = readPublishedSnacks(process.cwd());
  const bySlug = new Map<string, any>();
  const candidates = data.candidates.flatMap((candidate: any) => {
    const published = resolvePublishedSnack(candidate, manifest);
    if (!published) return [];
    const item = { ...candidate, title: published.title, standfirst: published.standfirst, href: `/snacks/${published.slug}/` };
    bySlug.set(published.slug, item); return [item];
  });
  const episodeBySlug = new Map<string, any>(data.candidates.map((candidate: any) => [candidate.episodeHref, candidate]));
  for (const item of manifest) {
    if (bySlug.has(item.slug)) continue;
    const episode = episodeBySlug.get(`/episodes/${item.sourceEpisode}/`);
    if (!episode) continue;
    const candidate = { ...episode, candidateId: item.candidateId || `published:${item.slug}`, title: item.title, standfirst: item.standfirst, href: `/snacks/${item.slug}/` };
    candidates.push(candidate); bySlug.set(item.slug, candidate);
  }
  const ids = new Set(candidates.map((item: any) => item.candidateId));
  data.candidates = candidates;
  data.relationships = data.relationships.filter((edge: any) => edge.reviewState === 'approved' && ids.has(edge.sourceCandidateId) && ids.has(edge.targetCandidateId));
  data.knowledge.nodes = data.knowledge.nodes.filter((node: any) => node.reviewState === 'accepted');
  const nodeIds = new Set(data.knowledge.nodes.map((node: any) => node.id));
  data.knowledge.edges = data.knowledge.edges.filter((edge: any) => edge.reviewState === 'accepted' && nodeIds.has(edge.sourceNodeId) && nodeIds.has(edge.targetNodeId));
  data.knowledge.snackLinks = data.knowledge.snackLinks.filter((edge: any) => edge.reviewState === 'accepted' && nodeIds.has(edge.knowledgeNodeId) && ids.has(edge.candidateId));
  cached = data;
  return data;
}
