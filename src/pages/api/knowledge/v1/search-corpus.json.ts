import { jsonRecord, researchData } from '@/lib/agent-knowledge';
// Build-time snapshot consumed by the Bun search handler, never recomputed per request.
export const GET = () => {
  const { schemaVersion, contentRevision, observations } = researchData();
  return jsonRecord({ schemaVersion, contentRevision, observations });
};
