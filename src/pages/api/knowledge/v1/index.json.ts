import { jsonRecord, researchIndex } from "@/lib/agent-knowledge";
export const GET = () => jsonRecord(researchIndex());
