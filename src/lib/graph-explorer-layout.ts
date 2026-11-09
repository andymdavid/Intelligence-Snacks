export type ExplorerNode = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  episodeId: string;
  episodeNumber?: number;
  href?: string;
  evidenceCount?: number;
  degree?: number;
  episodeCount?: number;
  reviewer?: string;
  reviewMethod?: string;
};
export type PositionedNode = ExplorerNode & {
  x: number;
  y: number;
  colour: string;
  radius: number;
};
const palette = [
  "#d87955",
  "#64899c",
  "#9c84b8",
  "#779668",
  "#b48a42",
  "#c3758e",
  "#568f8a",
];
const hash = (id: string) =>
  [...id].reduce(
    (value, char) => (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0,
    7,
  );
/** Source-episode neighbourhoods are navigation, not new semantic edges. Layout is stable across selection. */
export function positionArchive(nodes: ExplorerNode[]): PositionedNode[] {
  const episodes = nodes
    .filter((node) => node.kind === "episode")
    .sort(
      (a, b) =>
        (a.episodeNumber || 0) - (b.episodeNumber || 0) ||
        a.id.localeCompare(b.id),
    );
  const groups = new Map(
    episodes.map((episode, index) => {
      const angle = index * 2.399963229728653;
      const radius = 225 * Math.sqrt(index + 0.6);
      return [
        episode.episodeId,
        {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          colour: palette[index % palette.length]!,
          index,
        },
      ];
    }),
  );
  const memberGroups = new Map<string, ExplorerNode[]>();
  for (const node of nodes)
    if (node.kind !== "episode" && groups.has(node.episodeId)) {
      const list = memberGroups.get(node.episodeId) || [];
      list.push(node);
      memberGroups.set(node.episodeId, list);
    }
  const positions = new Map<string, { x: number; y: number }>();
  for (const [id, members] of memberGroups) {
    const group = groups.get(id)!;
    members.sort((a, b) => hash(a.id) - hash(b.id) || a.id.localeCompare(b.id));
    members.forEach((node, index) => {
      const angle = index * 2.399963229728653 + group.index;
      const r = 28 + Math.sqrt(index + 1) * 12;
      positions.set(node.id, {
        x: group.x + Math.cos(angle) * r,
        y: group.y + Math.sin(angle) * r,
      });
    });
  }
  const ungrouped = nodes
    .filter((node) => !groups.has(node.episodeId))
    .sort((a, b) => a.id.localeCompare(b.id));
  const hubs = nodes
    .filter((node) => node.kind === "canonical")
    .sort((a, b) => a.id.localeCompare(b.id));
  hubs.forEach((node, index) => {
    const angle =
      (index * 2 * Math.PI) / Math.max(1, hubs.length) - Math.PI / 2;
    positions.set(node.id, {
      x: Math.cos(angle) * 390,
      y: Math.sin(angle) * 390,
    });
  });
  return nodes.map((node) => {
    const group = groups.get(node.episodeId);
    const index = ungrouped.findIndex((other) => other.id === node.id);
    const angle = index * 2.399963229728653;
    const position =
      node.kind === "episode" && group
        ? group
        : positions.get(node.id) || {
            x: Math.cos(angle) * (100 + index * 14),
            y: Math.sin(angle) * (100 + index * 14),
          };
    return {
      ...node,
      x: position.x * 1.5,
      y: position.y * 0.85,
      colour:
        group?.colour || (node.kind === "canonical" ? "#1e7069" : "#92948f"),
      radius:
        node.kind === "episode"
          ? 9
          : node.kind === "canonical"
            ? 8
            : node.kind === "snack"
              ? 4.2
              : node.kind === "host" || node.kind === "contributor"
                ? 5
                : 2.5 + Math.min(3, (node.degree || 0) * 0.15),
    };
  });
}
