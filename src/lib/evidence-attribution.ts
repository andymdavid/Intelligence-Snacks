import { parseTranscript } from './transcript';

// Presentation only: preserve exported extraction metadata and the original excerpt.
export function evidenceAttribution(evidence: { excerpt: string; speaker: string | null }) {
  const labels = [
    ...parseTranscript(evidence.excerpt).map(turn => turn.speaker),
    ...[...evidence.excerpt.matchAll(/^([^\n]+)\n\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?\s*$/gm)].map(match => match[1]!.trim()),
  ];
  const speakers = new Set(labels.map(label => label.toLowerCase().trim()));
  return speakers.size > 1 ? 'Multiple speakers — see transcript' : evidence.speaker || 'Speaker not identified';
}
