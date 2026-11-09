const stop = new Set(
  "the a an and or of to in for with on by as is are be can could should would may might from that this it its at into not than rather their these more less one how when what why using use used ai agent agents model models system systems work working software human people through have has make makes new own".split(
    " ",
  ),
);
/** Lexical candidates only. This function never creates accepted concepts or relationships. */
export function proposeSharedIdeaPairs(nodes: any[], threshold = 0.22) {
  const counts = nodes.map((node) => {
    const counts = new Map<string, number>();
    for (const word of `${node.title} ${node.title} ${node.summary}`
      .toLowerCase()
      .match(/[a-z]{3,}/g) || [])
      if (!stop.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
    return counts;
  });
  const df = new Map<string, number>();
  for (const countsForNode of counts)
    for (const term of countsForNode.keys())
      df.set(term, (df.get(term) || 0) + 1);
  const vectors = counts.map(
    (countsForNode) =>
      new Map(
        [...countsForNode].map(([term, count]) => [
          term,
          count * Math.log(1 + nodes.length / (1 + df.get(term)!)),
        ]),
      ),
  );
  const norms = vectors.map((vector) =>
    Math.sqrt([...vector.values()].reduce((sum, v) => sum + v * v, 0)),
  );
  const pairs = [];
  for (let i = 0; i < nodes.length; i++)
    for (let j = 0; j < i; j++) {
      if (nodes[i].episodeId === nodes[j].episodeId) continue;
      const common = [...vectors[i]!.keys()].filter((term) =>
        vectors[j]!.has(term),
      );
      const score =
        common.reduce(
          (sum, term) => sum + vectors[i]!.get(term)! * vectors[j]!.get(term)!,
          0,
        ) / (norms[i]! * norms[j]! || 1);
      if (score > threshold)
        pairs.push({
          sourceId: nodes[i].id,
          targetId: nodes[j].id,
          score: Math.round(score * 1000) / 1000,
          terms: common.sort(),
          reviewState: "proposed",
        });
    }
  return pairs.sort(
    (a, b) =>
      b.score - a.score ||
      a.sourceId.localeCompare(b.sourceId) ||
      a.targetId.localeCompare(b.targetId),
  );
}
