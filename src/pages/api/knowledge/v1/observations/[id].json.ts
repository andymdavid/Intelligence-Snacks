import { jsonRecord, researchData } from "@/lib/agent-knowledge";
export function getStaticPaths() {
  return researchData().observations.map((node) => ({
    params: { id: node.id.slice(10) },
    props: { node },
  }));
}
export const GET = ({ props }: any) => {
  const data = researchData();
  return jsonRecord({
    schemaVersion: data.schemaVersion,
    contentRevision: data.contentRevision,
    ...props.node,
  });
};
