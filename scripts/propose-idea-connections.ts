// Offline discovery only. Lexical overlap is a review lead, never a semantic edge.
import {canonicalPublicGraph} from '../src/lib/public-graph-data';
import reviewed from '../src/data/graph-relationships.json';
const nodes=canonicalPublicGraph().knowledge.nodes;
const ignored=new Set('about after before their there these those which would could should agents agent models model using through other rather'.split(' '));
const terms=(node:any)=>new Set<string>((`${node.title} ${node.summary}`.toLowerCase().match(/[a-z]{5,}/g)||[]).filter((word:string)=>!ignored.has(word)));
const vocab=new Map<string,Set<string>>(nodes.map((node:any)=>[node.id,terms(node)]));
const known=new Set(reviewed.relationships.map(edge=>[edge.sourceId,edge.targetId].sort().join(':')));
const suggestions:any[]=[];
for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
 const a=nodes[i],b=nodes[j];if(a.episodeId===b.episodeId||known.has([a.id,b.id].sort().join(':')))continue;
 const shared=[...vocab.get(a.id)!].filter(word=>vocab.get(b.id)!.has(word));if(shared.length<3)continue;
 suggestions.push({sourceId:a.id,targetId:b.id,titles:[a.title,b.title],sharedTerms:shared,score:shared.length/Math.sqrt(vocab.get(a.id)!.size*vocab.get(b.id)!.size),reviewState:'proposed',relationshipType:null,rationale:'Lexical overlap only. Read both sources, articulate a relationship, or reject.',sources:[a,b].map(node=>({nodeId:node.id,transcriptRevisionId:node.sourceTranscriptRevisionId,evidenceIds:node.evidence.map((e:any)=>e.id)}))});
}
suggestions.sort((a,b)=>b.score-a.score||a.sourceId.localeCompare(b.sourceId)||a.targetId.localeCompare(b.targetId));
console.log(JSON.stringify({version:1,publication:'excluded-until-editorial-review',suggestions:suggestions.slice(0,Math.max(1,Math.min(200,Number(process.argv[2])||20)))},null,2));
