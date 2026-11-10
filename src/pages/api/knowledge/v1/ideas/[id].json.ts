import { jsonRecord, researchData } from "@/lib/agent-knowledge";
export function getStaticPaths() {
  return researchData().ideas.map((idea) => ({
    params: { id: idea.id },
    props: { idea },
  }));
}
export const GET = ({ props }: any) => {
  const data = researchData();
  return jsonRecord({
    schemaVersion: data.schemaVersion,
    contentRevision: data.contentRevision,
    ...props.idea,
  });
};
