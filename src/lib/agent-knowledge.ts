import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import registry from "../data/graph-concepts.json";
import guides from "../data/idea-guides.json";
import { canonicalPublicGraph } from "./public-graph-data";
import { buildKnowledgeModel } from "./graph-model";
import { evidenceTurnIndex, parseTranscript } from "./transcript";

export const site = "https://intelligencesnacks.com";
export const pilotIdeaIds = [
  "graph-memory",
  "agent-continuity",
  "code-first-workflows",
  "human-review",
  "shared-work-layers",
  "attention-bottleneck",
  "bounded-authority",
  "mature-tool-reuse",
];
export const absolute = (path: string) => new URL(path, site).href;
export const ideaPage = (id: string) =>
  pilotIdeaIds.includes(id) ? absolute(`/ideas/${id}/`) : null;
export const ideaRecord = (id: string) =>
  absolute(`/api/knowledge/v1/ideas/${id}.json`);
export const observationRecord = (id: string) =>
  absolute(`/api/knowledge/v1/observations/${id}.json`);
export type Evidence = {
  id: string;
  excerpt: string;
  speaker: string | null;
  contributorUrl: string | null;
  timestamp: string | null;
  sourceUrl: string;
  locator: "transcript-turn" | "episode";
};
export type Episode = {
  id: string;
  number: number;
  title: string;
  url: string;
  publishedAt: string | null;
};
export type Connection = {
  sourceId: string;
  targetId: string;
  type: string;
  explanation: string | null;
  neighbourId: string;
  neighbourTitle: string;
  neighbourUrl: string;
  reviewMethod: string | null;
  reviewer: string | null;
  reviewedAt: string | null;
};
export type Observation = {
  id: string;
  kind: string;
  title: string;
  summary: string;
  recordUrl: string;
  graphUrl: string;
  citationUrl: string;
  episode: Episode;
  extractionMethod: string;
  transcriptRevisionId: string;
  evidence: Evidence[];
  connections: Connection[];
};
export type Idea = {
  guideUpdatedAt: string | null;
  readingNotes: { heading: string; text: string; observationIds: string[] }[];
  id: string;
  title: string;
  summary: string;
  pageUrl: string | null;
  graphUrl: string;
  recordUrl: string;
  comparisonType: string;
  review: {
    method: string;
    reviewer: string;
    reviewedAt: string;
    humanReviewImplied: boolean;
  };
  sources: {
    observation: Observation;
    rationale: string;
    reviewedEvidenceIds: string[];
  }[];
  relatedIdeas: {
    id: string;
    title: string;
    pageUrl: string | null;
    recordUrl: string;
    sharedObservationCount: number;
  }[];
};
let cached: ReturnType<typeof buildResearch> | undefined;
function buildResearch() {
  const raw = canonicalPublicGraph();
  // The graph model enforces accepted registry entries, revision/evidence hashes and cross-episode coverage.
  const model = buildKnowledgeModel(raw);
  const byId = new Map(model.nodes.map((node: any) => [node.id, node]));
  const episodeById = new Map<string, Episode>();
  for (const episode of raw.episodes) {
    const slug = episode.href.split("/").filter(Boolean).at(-1);
    const path = `src/content/episodes/${slug}.md`;
    if (!existsSync(path)) continue;
    const header = /^---\r?\n([\s\S]*?)\r?\n---/.exec(
      readFileSync(path, "utf8"),
    )?.[1];
    const metadata = header ? parse(header) : {};
    if (metadata.status !== "published") continue;
    episodeById.set(episode.episodeId, {
      id: episode.episodeId,
      number: episode.episodeNumber,
      title: metadata.title,
      url: absolute(episode.href),
      publishedAt: metadata.originalPublishedAt
        ? new Date(metadata.originalPublishedAt).toISOString()
        : null,
    });
  }
  const transcripts = new Map<string, ReturnType<typeof parseTranscript>>();
  const observations: Observation[] = raw.knowledge.nodes.map((node: any) => {
    const episode = episodeById.get(node.episodeId);
    if (!episode) throw new Error(`Unpublished source episode for ${node.id}`);
    let turns = transcripts.get(episode.id);
    if (!turns) {
      const slug = new URL(episode.url).pathname
        .split("/")
        .filter(Boolean)
        .at(-1);
      const path = `src/content/transcripts/${slug}.txt`;
      turns = existsSync(path)
        ? parseTranscript(readFileSync(path, "utf8"))
        : [];
      transcripts.set(episode.id, turns);
    }
    const evidence: Evidence[] = node.evidence.map((item: any) => {
      const turn = evidenceTurnIndex(turns!, item);
      const speaker = String(item.speaker || "").trim();
      const normalise = (text: string) => text.toLowerCase().trim();
      const person = raw.contributors.find((p: any) =>
        [p.name, ...(p.aliases || [])].some(
          (name: string) => normalise(name) === normalise(speaker),
        ),
      );
      return {
        id: item.id,
        excerpt: item.excerpt,
        speaker: speaker || null,
        contributorUrl: person ? absolute(person.href) : null,
        timestamp: turn >= 0 ? turns![turn]!.timestamp : null,
        sourceUrl:
          turn >= 0 ? `${episode.url}#transcript-turn-${turn}` : episode.url,
        locator: turn >= 0 ? "transcript-turn" : "episode",
      };
    });
    const id = `knowledge:${node.id}`;
    const connections: Connection[] = model.links
      .filter((edge: any) => edge.source === id || edge.target === id)
      .map((edge: any) => {
        const targetId = edge.source === id ? edge.target : edge.source;
        const target: any = byId.get(targetId);
        return {
          sourceId: edge.source,
          targetId: edge.target,
          type: edge.type,
          explanation: edge.note || null,
          neighbourId: targetId,
          neighbourTitle: target.title,
          reviewMethod: edge.reviewMethod || null,
          reviewer: edge.reviewer || null,
          reviewedAt: edge.reviewedAt || null,
          neighbourUrl: targetId.startsWith("knowledge:")
            ? observationRecord(targetId.slice(10))
            : targetId.startsWith("canonical:")
              ? ideaRecord(targetId.slice(10))
              : absolute(target.href),
        };
      });
    return {
      id,
      kind: node.kind,
      title: node.title,
      summary: node.summary,
      recordUrl: observationRecord(node.id),
      graphUrl: absolute(`/graph/?node=${encodeURIComponent(id)}`),
      citationUrl:
        evidence.find((item) => item.locator === "transcript-turn")
          ?.sourceUrl ||
        evidence[0]?.sourceUrl ||
        episode.url,
      episode,
      extractionMethod:
        node.origin === "pipeline"
          ? "Automated extraction with transcript validation"
          : "Editorial record",
      transcriptRevisionId: node.sourceTranscriptRevisionId,
      evidence,
      connections,
    };
  });
  const obs = new Map(observations.map((node) => [node.id, node]));
  const accepted = registry.concepts.filter((concept) =>
    byId.has(`canonical:${concept.id}`),
  );
  const ideas: Idea[] = accepted.map((concept) => ({
    guideUpdatedAt: pilotIdeaIds.includes(concept.id) ? guides.updatedAt : null,
    readingNotes:
      (
        guides.guides as Record<
          string,
          { heading: string; text: string; observationIds: string[] }[]
        >
      )[concept.id] || [],
    id: concept.id,
    title: concept.title,
    summary: concept.summary,
    pageUrl: ideaPage(concept.id),
    graphUrl: absolute(
      `/graph/?node=${encodeURIComponent(`canonical:${concept.id}`)}`,
    ),
    recordUrl: ideaRecord(concept.id),
    comparisonType:
      "comparisonType" in concept
        ? String(concept.comparisonType)
        : "recurrence",
    review: {
      method: concept.reviewMethod,
      reviewer: concept.reviewer,
      reviewedAt: concept.reviewedAt,
      humanReviewImplied: false,
    },
    sources: concept.sources.map((source) => ({
      observation: obs.get(`knowledge:${source.nodeId}`)!,
      rationale: source.rationale,
      reviewedEvidenceIds: source.evidenceIds,
    })),
    relatedIdeas: accepted
      .filter(
        (other) =>
          other.id !== concept.id &&
          other.mentions.some((id) => concept.mentions.includes(id)),
      )
      .map((other) => ({
        id: other.id,
        title: other.title,
        pageUrl: ideaPage(other.id),
        recordUrl: ideaRecord(other.id),
        sharedObservationCount: other.mentions.filter((id) =>
          concept.mentions.includes(id),
        ).length,
      })),
  }));
  const revision = createHash("sha256")
    .update(JSON.stringify({ ideas, observations }))
    .digest("hex");
  return {
    schemaVersion: "1.0",
    contentRevision: revision,
    ideas,
    observations,
    episodes: [...episodeById.values()],
  };
}
export function researchData() {
  return (cached ||= buildResearch());
}
export function pilotIdeas() {
  return researchData().ideas.filter((idea) => pilotIdeaIds.includes(idea.id));
}
export function researchIndex() {
  const data = researchData();
  return {
    schemaVersion: data.schemaVersion,
    contentRevision: data.contentRevision,
    documentationUrl: absolute("/for-agents/"),
    scope:
      "Accepted public shared themes and extracted observations; themes are agent-editorial groupings, not independent verification of source claims.",
    searchMode:
      "Download this static index and search title/summary locally; URL query parameters do not filter these files.",
    counts: {
      ideas: data.ideas.length,
      observations: data.observations.length,
      episodes: data.episodes.length,
      publishedIdeaPages: pilotIdeas().length,
    },
    entries: [
      ...data.ideas.map((idea) => ({
        id: `canonical:${idea.id}`,
        kind: "shared-idea",
        title: idea.title,
        summary: idea.summary,
        url: idea.recordUrl,
        citationUrl: idea.pageUrl,
        graphUrl: idea.graphUrl,
      })),
      ...data.observations.map((node) => ({
        id: node.id,
        kind: node.kind,
        title: node.title,
        summary: node.summary,
        url: node.recordUrl,
        citationUrl: node.citationUrl,
        graphUrl: node.graphUrl,
      })),
    ],
  };
}
export function jsonRecord(value: unknown) {
  return new Response(JSON.stringify(value), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300",
    },
  });
}
