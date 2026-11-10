import { pilotIdeas } from "@/lib/agent-knowledge";
import type { Idea } from "@/lib/agent-knowledge";
export function getStaticPaths() {
  return pilotIdeas().map((idea) => ({
    params: { id: idea.id },
    props: { idea },
  }));
}
export const GET = ({ props }: { props: { idea: Idea } }) => {
  const idea = props.idea;
  const parts = [
    `# ${idea.title}`,
    `Canonical page: ${idea.pageUrl}`,
    idea.summary,
    `Agent editorial review: ${idea.review.reviewedAt}. Shared themes do not assert agreement or independently verify source claims.`,
  ];
  for (const note of idea.readingNotes)
    parts.push(
      `## ${note.heading}`,
      note.text,
      `Sources: ${note.observationIds.map((id) => `${idea.pageUrl}#observation-${id}`).join(" ")}`,
    );
  for (const source of idea.sources) {
    const node = source.observation;
    parts.push(
      `## ${node.title}`,
      `${node.episode.title} — Episode ${node.episode.number}`,
      node.summary,
      `Grouping rationale: ${source.rationale}`,
    );
    for (const e of node.evidence.filter((e) =>
      source.reviewedEvidenceIds.includes(e.id),
    )) {
      parts.push(
        `> ${e.excerpt.replace(/\n/g, "\n> ")}`,
        `${e.speaker || "Speaker not identified"} — ${e.sourceUrl}${e.timestamp ? ` (${e.timestamp})` : " (episode-level citation; exact passage not resolved)"}`,
      );
    }
  }
  parts.push(`Full JSON: ${idea.recordUrl}`);
  return new Response(parts.join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
