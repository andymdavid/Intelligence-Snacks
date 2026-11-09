import type { ExplorerNode } from "./graph-explorer-layout";
export type DiscoveryEdge = {
  sourceId: string;
  targetId: string;
  relationshipType: string;
};
export const structuralRelationships = new Set([
  "contains",
  "hosted-by",
  "features",
  "hosted",
  "contributed-to",
  "contributed",
  "develops",
  "publishes",
]);
const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
/** Literal relevance, not an inferred semantic relationship. All query tokens must match. */
export function rankArchive(
  nodes: ExplorerNode[],
  query: string,
): ExplorerNode[] {
  const phrase = normalise(query),
    words = phrase.split(/\s+/).filter(Boolean);
  if (!words.length) return [...nodes];
  return nodes
    .map((node) => {
      const title = normalise(node.title),
        summary = normalise(
          `${node.summary} ${node.kind} ${node.episodeNumber || ""}`,
        );
      const matches = (text: string, word: string) =>
        word.length < 3 ? text.split(" ").includes(word) : text.includes(word);
      if (!words.every((word) => matches(`${title} ${summary}`, word)))
        return { node, score: 0 };
      const allTitle = words.every((word) => matches(title, word));
      const score =
        title === phrase
          ? 10000
          : allTitle && title.startsWith(phrase)
            ? 8000
            : allTitle && title.includes(phrase)
              ? 6000
              : allTitle
                ? 5000
                : 1000 +
                  words.filter((word) => matches(title, word)).length * 100;
      return { node, score };
    })
    .filter((item) => item.score)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.node.title.localeCompare(b.node.title) ||
        a.node.id.localeCompare(b.node.id),
    )
    .map((item) => item.node);
}
/** A topic matches source episodes, not all claims within those episodes. Hubs join only through matching observations. */
export function topicVisibleIds(
  nodes: ExplorerNode[],
  edges: DiscoveryEdge[],
  episodeIds?: Set<string>,
): Set<string> {
  if (!episodeIds) return new Set(nodes.map((node) => node.id));
  const visible = new Set(
    nodes
      .filter((node) => episodeIds.has(node.episodeId))
      .map((node) => node.id),
  );
  const hubs = new Set(
    nodes.filter((node) => node.kind === "canonical").map((node) => node.id),
  );
  for (const edge of edges) {
    if (hubs.has(edge.sourceId) && visible.has(edge.targetId))
      visible.add(edge.sourceId);
    if (hubs.has(edge.targetId) && visible.has(edge.sourceId))
      visible.add(edge.targetId);
  }
  return visible;
}
export function connectionVisible(
  edge: DiscoveryEdge,
  visible: Set<string>,
  sourceLinks = false,
): boolean {
  return (
    visible.has(edge.sourceId) &&
    visible.has(edge.targetId) &&
    (sourceLinks || !structuralRelationships.has(edge.relationshipType))
  );
}
export function visibleConnections(
  edges: DiscoveryEdge[],
  visible: Set<string>,
  sourceLinks = false,
): DiscoveryEdge[] {
  return edges.filter((edge) => connectionVisible(edge, visible, sourceLinks));
}
