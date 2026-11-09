import { expect, test } from "bun:test";
import {
  rankArchive,
  topicVisibleIds,
  visibleConnections,
} from "../src/lib/graph-explorer-discovery";
import { canonicalPublicGraph } from "../src/lib/public-graph-data";
import { buildKnowledgeModel } from "../src/lib/graph-model";
import { applyCanonicalConcepts } from "../src/lib/graph-concepts";
import registry from "../src/data/graph-concepts.json";
type SourceNode = {
  id: string;
  episodeId: string;
  sourceTranscriptRevisionId: string;
  evidence: { id: string }[];
};
const n = (
  id: string,
  title: string,
  summary = "",
  episodeId = "e1",
  kind = "concept",
) => ({ id, title, summary, episodeId, kind });
test("exact, prefix and title matches outrank incidental summary matches regardless of input order", () => {
  const nodes = [
    n("summary", "Another idea", "Graph memory"),
    n("tokens", "Memory in a graph"),
    n("partial", "Understanding graph memory"),
    n("prefix", "Graph memory systems"),
    n("exact", "Graph memory"),
  ];
  expect(rankArchive(nodes, "GRAPH—MEMORY").map((n) => n.id)).toEqual([
    "exact",
    "prefix",
    "partial",
    "tokens",
    "summary",
  ]);
  expect(
    rankArchive(
      [n("mail", "Email and claims"), n("ai", "AI models")],
      "AI",
    ).map((n) => n.id),
  ).toEqual(["ai"]);
  expect(rankArchive(nodes, "graph absent")).toEqual([]);
  expect(rankArchive(nodes, " ")).toEqual(nodes);
  expect(
    rankArchive([n("b", "Same title"), n("a", "Same title")], "same title").map(
      (n) => n.id,
    ),
  ).toEqual(["a", "b"]);
});
test("topic map includes matching episode records and their linked hubs, without claiming unrelated nodes", () => {
  const nodes = [
    n("a", "One", "", "e1"),
    n("b", "Two", "", "e2"),
    n("hub", "Shared", "", "", "canonical"),
    n("other", "Other", "", "", "canonical"),
    n("speaker", "Person", "", "", "contributor"),
  ];
  const edges = [
    { sourceId: "hub", targetId: "a", relationshipType: "discussed-in" },
    { sourceId: "other", targetId: "b", relationshipType: "discussed-in" },
    { sourceId: "speaker", targetId: "a", relationshipType: "contributed" },
  ];
  expect([...topicVisibleIds(nodes, edges, new Set(["e1"]))]).toEqual([
    "a",
    "hub",
  ]);
  expect(topicVisibleIds(nodes, edges, new Set()).size).toBe(0);
  expect(topicVisibleIds(nodes, edges).size).toBe(nodes.length);
});
test("default connections exclude archive structure; source toggle restores only in-scope connections", () => {
  const edges = [
    { sourceId: "a", targetId: "b", relationshipType: "supports" },
    { sourceId: "a", targetId: "b", relationshipType: "develops" },
    { sourceId: "a", targetId: "outside", relationshipType: "supports" },
  ];
  const scope = new Set(["a", "b"]);
  expect(visibleConnections(edges, scope)).toEqual([edges[0]!]);
  expect(visibleConnections(edges, scope, true)).toEqual(edges.slice(0, 2));
});
test("every shared concept spans episodes and pins its reviewed source revision, evidence and rationale", () => {
  const data = canonicalPublicGraph(),
    model = buildKnowledgeModel(data),
    byId = new Map<string, SourceNode>(
      (data.knowledge.nodes as SourceNode[]).map((n) => [n.id, n]),
    );
  expect(model.nodes.filter((n) => n.kind === "canonical").length).toBe(47);
  for (const concept of registry.concepts) {
    expect(
      new Set(concept.mentions.map((id) => byId.get(id)!.episodeId)).size,
    ).toBeGreaterThanOrEqual(2);
    for (const source of concept.sources) {
      const node = byId.get(source.nodeId)!;
      expect(source.transcriptRevisionId).toBe(node.sourceTranscriptRevisionId);
      expect(source.rationale.length).toBeGreaterThan(20);
      for (const id of source.evidenceIds)
        expect(node.evidence.some((e) => e.id === id)).toBe(true);
    }
  }
  const concept = registry.concepts.find(
    (c) => c.id === "code-first-workflows",
  )!;
  const knowledge = structuredClone(data.knowledge.nodes) as SourceNode[],
    base = {
      nodes: model.nodes.filter((n) => n.kind !== "canonical"),
      links: [],
    };
  knowledge.find(
    (n) => n.id === concept.mentions[0],
  )!.sourceTranscriptRevisionId = "changed";
  expect(() =>
    applyCanonicalConcepts(
      structuredClone(base),
      { concepts: [concept] },
      knowledge,
    ),
  ).toThrow("needs source re-review");
  const invalid = structuredClone(concept);
  invalid.sources[0]!.evidenceIds = ["missing"];
  expect(() =>
    applyCanonicalConcepts(
      structuredClone(base),
      { concepts: [invalid] },
      data.knowledge.nodes,
    ),
  ).toThrow("needs source re-review");
});
