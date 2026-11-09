import { createHash } from "node:crypto";
export function knowledgeFingerprint(node: any): string {
  const evidence = node.evidence
    .map((e: any) => [e.id, e.excerpt])
    .sort((a: string[], b: string[]) => a[0]!.localeCompare(b[0]!));
  return createHash("sha256")
    .update(
      JSON.stringify([
        node.id,
        node.episodeId,
        node.sourceTranscriptRevisionId,
        node.kind,
        node.title,
        node.summary,
        evidence,
      ]),
    )
    .digest("hex");
}
export function topicFingerprint(topic: any): string {
  return createHash("sha256")
    .update(
      JSON.stringify([
        topic.id,
        topic.parentTopicId || "",
        topic.name,
        topic.description || "",
      ]),
    )
    .digest("hex");
}
/** Report only unchanged screened records. New/changed material must never inherit a stale 100% review label. */
export function sharedReviewCoverage(data: any, registry: any, audit: any) {
  const snapshots = new Map<string, any>(
    audit.records.map((record: any) => [record.nodeId, record]),
  );
  const screened = new Set<string>(
    data.knowledge.nodes
      .filter(
        (node: any) =>
          snapshots.get(node.id)?.fingerprint === knowledgeFingerprint(node),
      )
      .map((node: any) => node.id),
  );
  const linked = new Set<string>(
    registry.concepts
      .filter((c: any) => c.reviewState === "accepted")
      .flatMap((c: any) => c.mentions),
  );
  const freshSources = new Set<string>(
    audit.records
      .filter(
        (r: any) =>
          r.reviewLevel === "source-excerpts-checked" && screened.has(r.nodeId),
      )
      .map((r: any) => r.nodeId),
  );
  const priorSources = new Set<string>(
    audit.records
      .filter(
        (r: any) =>
          r.reviewLevel === "retained-prior-source-review" &&
          screened.has(r.nodeId),
      )
      .map((r: any) => r.nodeId),
  );
  const seen = new Map<string, any>();
  for (const e of data.candidates)
    seen.set(e.episodeId, {
      id: e.episodeId,
      number: e.episodeNumber,
      title: e.episodeTitle,
    });
  const episodes = [...seen.values()]
    .sort((a, b) => a.number - b.number)
    .map((episode) => {
      const nodes = data.knowledge.nodes.filter(
        (n: any) => n.episodeId === episode.id,
      );
      return {
        ...episode,
        total: nodes.length,
        screened: nodes.filter((n: any) => screened.has(n.id)).length,
        linked: nodes.filter((n: any) => linked.has(n.id)).length,
        sourceChecked: nodes.filter((n: any) => freshSources.has(n.id)).length,
        unlinked: nodes.filter((n: any) => !linked.has(n.id)).length,
      };
    });
  const topics = data.topicIndex.topics,
    byId = new Map<string, any>(topics.map((t: any) => [t.id, t]));
  const rootFor = (id: string) => {
    const visited = new Set<string>();
    let node = byId.get(id);
    while (node?.parentTopicId && !visited.has(node.id)) {
      visited.add(node.id);
      node = byId.get(node.parentTopicId);
    }
    return node?.id || id;
  };
  const families = topics
    .filter((t: any) => !t.parentTopicId)
    .map((topic: any) => {
      const members = topics.filter((t: any) => rootFor(t.id) === topic.id);
      return {
        id: topic.id,
        name: topic.name,
        screened: members.every(
          (t: any) => audit.topicFingerprints?.[t.id] === topicFingerprint(t),
        ),
        subtopics: members.length - 1,
        passages: data.topicIndex.passages.filter(
          (p: any) => rootFor(p.primaryTopicId) === topic.id,
        ).length,
        themes: registry.concepts.filter(
          (c: any) =>
            c.reviewState === "accepted" && c.topicFamilies?.includes(topic.id),
        ).length,
      };
    });
  return {
    gaps: audit.reviewGaps || [],
    reviewedAt: audit.reviewedAt,
    totalRecords: data.knowledge.nodes.length,
    screenedRecords: screened.size,
    pendingRecords: data.knowledge.nodes.length - screened.size,
    linkedRecords: data.knowledge.nodes.filter((n: any) => linked.has(n.id))
      .length,
    newSourceChecks: freshSources.size,
    priorSourceChecks: priorSources.size,
    themeCount: registry.concepts.filter(
      (c: any) => c.reviewState === "accepted",
    ).length,
    perspectiveThemes: registry.concepts.filter(
      (c: any) =>
        c.reviewState === "accepted" && c.comparisonType === "perspectives",
    ).length,
    episodes,
    families,
    screenedEpisodes: episodes.filter(
      (e) => e.total > 0 && e.screened === e.total,
    ).length,
    screenedFamilies: families.filter((f: any) => f.screened).length,
    candidatePairs: audit.candidateDecisions.length,
    representedPairs: audit.candidateDecisions.filter(
      (p: any) => p.decision === "represented-in-theme",
    ).length,
    separatePairs: audit.candidateDecisions.filter(
      (p: any) => p.decision === "kept-separate",
    ).length,
  };
}
