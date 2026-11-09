import { expect, test } from "bun:test";
import { canonicalPublicGraph } from "../src/lib/public-graph-data";
import {
  knowledgeFingerprint,
  sharedReviewCoverage,
} from "../src/lib/graph-shared-review";
import { proposeSharedIdeaPairs } from "../src/lib/shared-idea-candidates";
import { buildKnowledgeModel } from "../src/lib/graph-model";
import { applyCanonicalConcepts } from "../src/lib/graph-concepts";
import registry from "../src/data/graph-concepts.json";
import audit from "../src/data/graph-shared-review.json";
const data = canonicalPublicGraph();
test("dated review accounts for every current record, episode and topic-family catalogue without conflating screening and source review", () => {
  const c = sharedReviewCoverage(data, registry, audit);
  expect(c.screenedRecords).toBe(526);
  expect(c.pendingRecords).toBe(0);
  expect(c.screenedEpisodes).toBe(21);
  expect(c.screenedFamilies).toBe(9);
  expect(c.themeCount).toBe(47);
  expect(c.linkedRecords).toBe(193);
  expect(c.newSourceChecks).toBe(161);
  expect(c.priorSourceChecks).toBe(32);
  expect(c.episodes.every((e) => e.total === e.screened && e.linked > 0)).toBe(
    true,
  );
  expect(c.families.every((f: any) => f.themes > 0)).toBe(true);
  expect(c.candidatePairs).toBe(62);
  expect(c.representedPairs).toBe(44);
  expect(c.separatePairs).toBe(18);
  for (const n of data.knowledge.nodes)
    expect(audit.records.find((r) => r.nodeId === n.id)?.fingerprint).toBe(
      knowledgeFingerprint(n),
    );
});
test("new or changed knowledge does not inherit a completed review and changed taxonomy invalidates catalogue coverage", () => {
  const fresh = structuredClone(data);
  fresh.knowledge.nodes.push({ ...fresh.knowledge.nodes[0], id: "new-record" });
  const added = sharedReviewCoverage(fresh, registry, audit);
  expect(added.pendingRecords).toBe(1);
  expect(added.screenedRecords).toBe(526);
  const changed = structuredClone(data);
  changed.knowledge.nodes[0].summary += " Changed.";
  expect(sharedReviewCoverage(changed, registry, audit).pendingRecords).toBe(1);
  changed.topicIndex.topics.find((t: any) => !t.parentTopicId)!.description +=
    " Changed.";
  expect(sharedReviewCoverage(changed, registry, audit).screenedFamilies).toBe(
    8,
  );
});
test("candidate generation reproduces the screened pair inventory and never publishes editorial decisions", () => {
  const candidates = proposeSharedIdeaPairs(data.knowledge.nodes);
  const pair = (a: string, b: string) => [a, b].sort().join("|");
  expect(new Set(candidates.map((p) => pair(p.sourceId, p.targetId)))).toEqual(
    new Set(audit.candidateDecisions.map((p) => pair(p.a, p.b))),
  );
  expect(candidates.every((p) => p.reviewState === "proposed")).toBe(true);
  expect(
    audit.candidateDecisions.every((p) =>
      ["represented-in-theme", "kept-separate"].includes(p.decision),
    ),
  ).toBe(true);
});
test("evidence text changed under the same ID requires editorial re-review", () => {
  const model = buildKnowledgeModel(data),
    knowledge = structuredClone(data.knowledge.nodes),
    concept = registry.concepts[0]!;
  knowledge.find(
    (n: any) => n.id === concept.mentions[0],
  )!.evidence[0].excerpt += " Changed.";
  expect(() =>
    applyCanonicalConcepts(
      { nodes: model.nodes.filter((n) => n.kind !== "canonical"), links: [] },
      { concepts: [concept] },
      knowledge,
    ),
  ).toThrow("needs source re-review");
});
test("expanded transcript context changes also require source re-review", () => {
  const model = buildKnowledgeModel(data),
    concept = structuredClone(
      registry.concepts.find((c) => c.id === "business-ownership")!,
    );
  const source = (concept.sources as any[]).find((s) => s.expandedContext);
  source.expandedContext.sha256 = "0".repeat(64);
  expect(() =>
    applyCanonicalConcepts(
      { nodes: model.nodes.filter((n) => n.kind !== "canonical"), links: [] },
      { concepts: [concept] },
      data.knowledge.nodes,
    ),
  ).toThrow("needs source re-review");
});
test("perspectives retain distinct claims while an explicit later reference gets a typed development link", () => {
  const model = buildKnowledgeModel(data);
  expect(
    model.nodes.filter((n) => n.comparisonType === "perspectives").length,
  ).toBe(12);
  expect(
    model.links.find(
      (l) =>
        l.reviewedRelationshipId ===
        "subscription-friction-extends-consumer-inertia",
    ),
  ).toMatchObject({ type: "extends", reviewMethod: "agent-editorial-review" });
  expect(
    model.links.filter(
      (l) => l.reviewedRelationshipId && l.type === "contradicts",
    ).length,
  ).toBe(0);
});
