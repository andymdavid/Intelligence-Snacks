import {readFileSync} from 'node:fs';
import {parseTranscript,evidenceTurnIndex} from '../src/lib/transcript';
import {expect,test} from 'bun:test';
import {canonicalPublicGraph} from '../src/lib/public-graph-data';
import {buildKnowledgeModel} from '../src/lib/graph-model';
import {applyReviewedRelationships} from '../src/lib/graph-relationships';
import relationships from '../src/data/graph-relationships.json';
import {selectGraphView,buildIdeaProjection,ideaDiscovery} from '../src/lib/graph-view.js';
const data=canonicalPublicGraph(),raw=buildKnowledgeModel(data),model={nodes:raw.nodes,allConnections:raw.links.map((edge,index)=>({...edge,id:String(index),sourceId:edge.source,targetId:edge.target,relationshipType:edge.type}))};
test('ideas projection preserves distinct claims and omits provenance from layout',()=>{
 const projection=buildIdeaProjection(model),byId=new Map<string,any>(projection.nodes.map((n:any)=>[n.id,n]));
 expect(projection.nodes.length).toBe(528);expect(projection.nodes.every((n:any)=>!['episode','host','contributor','root','snack'].includes(n.kind))).toBe(true);
 expect(projection.allConnections.every((e:any)=>byId.has(e.sourceId)&&byId.has(e.targetId))).toBe(true);
 const reviewed=projection.allConnections.filter((e:any)=>e.reviewedRelationshipId);expect(reviewed.length).toBe(3);
 for(const edge of reviewed){expect(byId.get(edge.sourceId).episodeId).not.toBe(byId.get(edge.targetId).episodeId);expect(byId.get(edge.sourceId).layoutGroup).toBe(byId.get(edge.targetId).layoutGroup);expect(edge.note.length).toBeGreaterThan(80);}
 const full=selectGraphView({...model,displayMode:'ideas'},{limit:1000000});expect(full.nodes.length).toBe(projection.nodes.length);expect(full.allConnections.length).toBe(projection.allConnections.length);
 const balanced=selectGraphView({...model,displayMode:'ideas'});expect(balanced.nodes.length).toBe(320);expect(balanced.allConnections.filter((e:any)=>e.reviewedRelationshipId).length).toBe(3);
 const pilot=selectGraphView({...model,displayMode:'ideas',ideaScope:'pilot'});expect(pilot.nodes.length).toBeLessThan(100);expect(pilot.allConnections.filter((e:any)=>e.reviewedRelationshipId).length).toBe(3);
});
test('reviewed relationships fail closed for stale evidence and do not publish proposals',()=>{
 const base=()=>({nodes:raw.nodes,links:[]});const registry=structuredClone(relationships);registry.relationships[0]!.sources[0]!.transcriptRevisionId='stale';expect(()=>applyReviewedRelationships(base(),data.knowledge.nodes,registry)).toThrow('re-review');
 const missing=structuredClone(relationships);missing.relationships[0]!.sources[0]!.evidenceIds=['missing'];expect(()=>applyReviewedRelationships(base(),data.knowledge.nodes,missing)).toThrow('re-review');
 const proposals=structuredClone(relationships);proposals.relationships.forEach(e=>e.reviewState='proposed');expect(applyReviewedRelationships(base(),data.knowledge.nodes,proposals).links).toHaveLength(0);
});
test('discovery separates distinct source reach from recency and popularity',()=>{
 const discovery=ideaDiscovery(model);expect(discovery.reviewedCrossEpisodeLinks).toBe(3);expect(discovery.shared.map((n:any)=>n.episodeReach)).toEqual([3,2]);expect(discovery.shared.every((n:any)=>n.recentEpisodes===0)).toBe(true);expect(discovery.latestEpisodes).toEqual([79,78,77,76,75]);expect(discovery.recent.every((n:any)=>discovery.latestEpisodes.includes(n.episodeNumber))).toBe(true);
 const duplicated={...model,allConnections:[...model.allConnections,...model.allConnections]};expect(ideaDiscovery(duplicated).shared.map((n:any)=>n.episodeReach)).toEqual([3,2]);
});

test('every reviewed pilot endpoint has a uniquely matchable published source passage',()=>{
 const ids=new Set(relationships.relationships.flatMap(edge=>[edge.sourceId,edge.targetId]));
 for(const id of ids){const node=data.knowledge.nodes.find((node:any)=>node.id===id);const published=raw.nodes.find(node=>node.id===`knowledge:${id}`)!;const slug=published.href.split('/').filter(Boolean).at(-1);const turns=parseTranscript(readFileSync(`src/content/transcripts/${slug}.txt`,'utf8'));expect(node.evidence.some((e:any)=>evidenceTurnIndex(turns,e)>=0)).toBe(true);}
});
