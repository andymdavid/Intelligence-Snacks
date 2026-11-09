import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
export function applyCanonicalConcepts(
  model: { nodes: any[]; links: any[] },
  registry: { concepts: any[]; suggestions?: any[] },
  knowledge?: any[],
) {
  const ids = new Set(model.nodes.map((node) => node.id));
  const conceptIds = new Set<string>();
  for (const concept of registry.concepts) {
    if (conceptIds.has(concept.id))
      throw new Error(`Duplicate canonical concept ${concept.id}`);
    conceptIds.add(concept.id);
    if (
      concept.reviewState !== "accepted" ||
      !concept.reviewer ||
      !concept.reviewMethod
    )
      continue;
    const mentions = [...new Set<string>(concept.mentions)];
    for (const id of mentions)
      if (!ids.has(`knowledge:${id}`))
        throw new Error(
          `Canonical concept ${concept.id} has missing mention ${id}`,
        );
    if (knowledge) {
      if (
        !concept.reviewedAt ||
        concept.reviewMethod !== "agent-editorial-review"
      )
        throw new Error(
          `Canonical concept ${concept.id} has incomplete editorial review`,
        );
      const records = new Map(knowledge.map((node) => [node.id, node]));
      const episodes = new Set<string>();
      for (const mention of mentions) {
        const record = records.get(mention),
          source = concept.sources?.find(
            (item: any) => item.nodeId === mention,
          );
        if (
          !record ||
          !source ||
          record.sourceTranscriptRevisionId !== source.transcriptRevisionId ||
          !source.rationale?.trim() ||
          !source.evidenceIds?.length ||
          source.evidenceIds.some(
            (id: string) =>
              !record.evidence.some(
                (e: any) =>
                  e.id === id &&
                  source.evidenceSha256?.[id] ===
                    createHash("sha256").update(e.excerpt).digest("hex"),
              ),
          )
        )
          throw new Error(
            `Canonical concept ${concept.id} needs source re-review: ${mention}`,
          );
        if (source.expandedContext) {
          const context = source.expandedContext;
          if (
            !/^src\/content\/transcripts\/episode-\d+\.txt$/.test(
              context.path,
            ) ||
            createHash("sha256")
              .update(readFileSync(context.path))
              .digest("hex") !== context.sha256
          )
            throw new Error(
              `Canonical concept ${concept.id} needs source re-review: expanded context ${mention}`,
            );
        }
        episodes.add(record.episodeId);
      }
      if (episodes.size < 2)
        throw new Error(
          `Canonical concept ${concept.id} must span at least two episodes`,
        );
    }
    const id = `canonical:${concept.id}`;
    model.nodes.push({
      id,
      kind: "canonical",
      title: concept.title,
      summary: concept.summary,
      episodeId: "",
      href: `/graph/?node=${encodeURIComponent(id)}`,
      reviewMethod: concept.reviewMethod,
      reviewer: concept.reviewer,
      reviewedAt: concept.reviewedAt,
      comparisonType: concept.comparisonType || "recurrence",
      topicFamilies: concept.topicFamilies || [],
      episodeCount: new Set(
        mentions
          .map(
            (mention) =>
              model.nodes.find((node) => node.id === `knowledge:${mention}`)
                ?.episodeId,
          )
          .filter(Boolean),
      ).size,
    });
    for (const mention of mentions)
      model.links.push({
        source: id,
        target: `knowledge:${mention}`,
        type: "discussed-in",
        note:
          (concept.sources?.find((item: any) => item.nodeId === mention)
            ?.rationale ||
            "A reviewed topic connection; the observations retain distinct meanings and evidence.") +
          " This editorial grouping does not assert that the claims are equivalent.",
        reviewMethod: concept.reviewMethod,
        reviewer: concept.reviewer,
        reviewedAt: concept.reviewedAt,
      });
  }
  // Suggestions are deliberately excluded from the public graph until reviewed into the registry.
  return model;
}
export function proposeConceptMentions(nodes: any[], title: string) {
  const words = title
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);
  return nodes
    .filter(
      (node) =>
        node.kind === "concept" &&
        words.some((word) =>
          `${node.title} ${node.summary}`.toLowerCase().includes(word),
        ),
    )
    .map((node) => ({
      nodeId: node.id,
      reviewState: "proposed",
      rationale: `Text overlaps with “${title}”; an editor must assess the source.`,
      evidenceIds: (node.evidence || []).map((item: any) => item.id),
    }));
}
