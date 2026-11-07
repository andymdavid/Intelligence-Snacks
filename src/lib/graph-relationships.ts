// Editorial cross-source interpretations are separate from extracted claims.
// Source revision and evidence IDs are pinned: publication stops for re-review
// if a later export replaces the material on which the interpretation depended.
export function applyReviewedRelationships(model: {nodes:any[];links:any[]}, knowledge:any[], registry:{relationships:any[]}) {
 const byId=new Map(knowledge.map(node=>[node.id,node]));const ids=new Set<string>();
 for(const edge of registry.relationships){
  if(ids.has(edge.id))throw new Error(`Duplicate reviewed relationship ${edge.id}`);ids.add(edge.id);
  if(edge.reviewState!=='accepted')continue;
  if(!edge.reviewer||edge.reviewMethod!=='agent-editorial-review'||!edge.reviewedAt||!edge.explanation?.trim()||!['extends','parallels','complements','supports','contradicts','exemplifies','enables'].includes(edge.relationshipType))throw new Error(`Incomplete relationship review ${edge.id}`);
  if(edge.sourceId===edge.targetId)throw new Error(`Self relationship ${edge.id}`);
  for(const id of [edge.sourceId,edge.targetId]){
   const node=byId.get(id),source=edge.sources?.find((item:any)=>item.nodeId===id);
   if(!node||!source||node.sourceTranscriptRevisionId!==source.transcriptRevisionId||!source.evidenceIds?.length||source.evidenceIds.some((id:string)=>!node.evidence.some((e:any)=>e.id===id)))throw new Error(`Reviewed relationship ${edge.id} needs source re-review: ${id}`);
  }
  model.links.push({source:`knowledge:${edge.sourceId}`,target:`knowledge:${edge.targetId}`,type:edge.relationshipType,note:edge.explanation,reviewer:edge.reviewer,reviewMethod:edge.reviewMethod,reviewedAt:edge.reviewedAt,reviewedRelationshipId:edge.id});
 }
 return model;
}
