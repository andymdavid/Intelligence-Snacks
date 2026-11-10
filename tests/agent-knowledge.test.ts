import { describe, expect, test } from "bun:test";
import { canonicalPublicGraph } from "../src/lib/public-graph-data";
import {
  researchData,
  researchIndex,
  pilotIdeas,
  pilotIdeaIds,
} from "../src/lib/agent-knowledge";
import { GET as legacyEvidence } from "../src/pages/graph/details.json";

describe("public research records", () => {
  const data = researchData();
  const raw = canonicalPublicGraph();
  test("exports only accepted observations without rewriting claims or evidence", () => {
    expect(data.observations.map((n) => n.id).sort()).toEqual(
      raw.knowledge.nodes.map((n: any) => `knowledge:${n.id}`).sort(),
    );
    for (const node of data.observations) {
      const source = raw.knowledge.nodes.find(
        (n: any) => `knowledge:${n.id}` === node.id,
      )!;
      expect(node.title).toBe(source.title);
      expect(node.summary).toBe(source.summary);
      expect(node.transcriptRevisionId).toBe(source.sourceTranscriptRevisionId);
      expect(node.evidence.map((e) => [e.id, e.excerpt, e.speaker])).toEqual(
        source.evidence.map((e: any) => [
          e.id,
          e.excerpt,
          e.speaker?.trim() || null,
        ]),
      );
    }
  });
  test("retains existing evidence locators and never fabricates unresolved timestamps", async () => {
    const response = await legacyEvidence({} as any);
    const old = await response.json();
    let exact = 0,
      unresolved = 0;
    for (const node of data.observations)
      for (const evidence of node.evidence) {
        const original = old[node.id].evidence.find(
          (e: any) => e.id === evidence.id,
        );
        expect(evidence.sourceUrl).toBe(
          new URL(original.sourceHref, "https://intelligencesnacks.com").href,
        );
        expect(evidence.timestamp).toBe(original.timestamp);
        if (evidence.locator === "transcript-turn") {
          exact++;
          expect(new URL(evidence.sourceUrl).hash).toMatch(
            /^#transcript-turn-\d+$/,
          );
          expect(evidence.timestamp).not.toBeNull();
        } else {
          unresolved++;
          expect(new URL(evidence.sourceUrl).hash).toBe("");
          expect(evidence.timestamp).toBeNull();
        }
      }
    expect(exact).toBeGreaterThan(0);
    expect(unresolved).toBeGreaterThan(0);
  });
  test("pilot guides link distinct episodes and the evidence actually reviewed for their groupings", () => {
    expect(
      pilotIdeas()
        .map((i) => i.id)
        .sort(),
    ).toEqual([...pilotIdeaIds].sort());
    for (const idea of data.ideas) {
      expect(
        new Set(idea.sources.map((s) => s.observation.episode.id)).size,
      ).toBeGreaterThanOrEqual(2);
      expect(idea.review.humanReviewImplied).toBe(false);
      for (const source of idea.sources) {
        expect(source.observation).toBeDefined();
        expect(source.rationale.length).toBeGreaterThan(0);
        for (const id of source.reviewedEvidenceIds)
          expect(source.observation.evidence.some((e) => e.id === id)).toBe(
            true,
          );
      }
      for (const related of idea.relatedIdeas) {
        const other = data.ideas.find((i) => i.id === related.id)!;
        expect(related.sharedObservationCount).toBe(
          idea.sources.filter((s) =>
            other.sources.some((t) => t.observation.id === s.observation.id),
          ).length,
        );
      }
      for (const note of idea.readingNotes)
        for (const id of note.observationIds)
          expect(
            idea.sources.some((s) => s.observation.id === `knowledge:${id}`),
          ).toBe(true);
      expect(Boolean(idea.pageUrl)).toBe(pilotIdeaIds.includes(idea.id));
    }
  });
  test("index entries consistently identify detail records and canonical citations", () => {
    const index = researchIndex();
    expect(index.entries.length).toBe(
      data.ideas.length + data.observations.length,
    );
    expect(new Set(index.entries.map((n) => n.id)).size).toBe(
      index.entries.length,
    );
    for (const entry of index.entries) {
      expect(entry.url).toStartWith(
        "https://intelligencesnacks.com/api/knowledge/v1/",
      );
      if (entry.citationUrl) expect(entry.citationUrl).not.toContain("?node=");
    }
  });
});
