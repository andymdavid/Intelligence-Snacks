import {expect,test} from 'bun:test';
import {canonicalPublicGraph} from '../src/lib/public-graph-data';
import {buildKnowledgeModel,buildTopicModel} from '../src/lib/graph-model';
import {applyCanonicalConcepts,proposeConceptMentions} from '../src/lib/graph-concepts';
import {selectGraphView} from '../src/lib/graph-view.js';
import {existsSync} from 'node:fs';
const data=canonicalPublicGraph();const model=buildKnowledgeModel(data);
test('every public URL matches canonical published content and every edge has endpoints',()=>{
 const ids=new Set(model.nodes.map(node=>node.id));expect(ids.size).toBe(model.nodes.length);
 for(const node of model.nodes)if(node.href&&!node.href.startsWith('/graph/')){const parts=node.href.split('/').filter(Boolean);const collection=parts[0]==='contributors'?'people':parts[0];expect(existsSync(`src/content/${collection}/${parts[1]}.md`)).toBe(true);}
 for(const edge of model.links){expect(ids.has(edge.source)).toBe(true);expect(ids.has(edge.target)).toBe(true);}
 expect(data.candidates.some((node:any)=>node.href==='/snacks/ai-needs-a-way-back/')).toBe(false);
 expect(data.candidates.some((node:any)=>node.href==='/snacks/ai-coding-agents-are-power-tools/')).toBe(true);
});
test('every idea beyond old cap can become focus; canonical memory connects three episodes',()=>{
 const connections=model.links.map((edge,index)=>({id:String(index),sourceId:edge.source,targetId:edge.target}));
 for(const node of model.nodes.slice(500)){const view=selectGraphView({...model,allConnections:connections},{focusId:node.id});expect(view.nodes.some((item:any)=>item.id===node.id)).toBe(true);}
 const memory=model.links.filter(edge=>edge.source==='canonical:graph-memory');expect(memory.length).toBe(3);
 const byId=new Map(model.nodes.map(node=>[node.id,node]));expect(new Set(memory.map(edge=>byId.get(edge.target)?.episodeId)).size).toBe(3);
});
test('suggestions never enter public graph and invalid canonical mentions fail loudly',()=>{
 const base={nodes:[{id:'knowledge:n'}],links:[]};expect(applyCanonicalConcepts(base,{concepts:[{id:'draft',reviewState:'proposed',mentions:['missing'] }],suggestions:[{nodeId:'n'}]}).nodes.length).toBe(1);
 expect(()=>applyCanonicalConcepts({nodes:[],links:[]},{concepts:[{id:'bad',reviewState:'accepted',reviewer:'r',reviewMethod:'review',mentions:['missing']}]})).toThrow('missing mention');
 expect(proposeConceptMentions([{id:'n',kind:'concept',title:'Graph memory',summary:'Connected records',evidence:[{id:'ev'}]}],'graph memory')[0]).toMatchObject({reviewState:'proposed',evidenceIds:['ev']});
});
test('topic mix primary shares sum to one and represented words equal classified words',()=>{
 const topics=buildTopicModel(data);expect(topics.reduce((sum:number,topic:any)=>sum+topic.share,0)).toBeCloseTo(1,6);
 expect(topics.reduce((sum:number,topic:any)=>sum+topic.words,0)).toBe(data.topicIndex.analyses.reduce((sum:number,item:any)=>sum+item.classifiedWordCount,0));
});

test('balanced and focused views preserve all episode gateways and complete focused episode',()=>{
 const allConnections=model.links.map((edge,index)=>({id:String(index),sourceId:edge.source,targetId:edge.target}));
 const graph={...model,allConnections};const episodes=model.nodes.filter(n=>n.kind==='episode');
 for(const focus of [null,...episodes.map(n=>n.id)]){
  const view=selectGraphView(graph,{focusId:focus});const ids=new Set(view.nodes.map((n:any)=>n.id));
  expect(view.nodes.length).toBe(320);for(const episode of episodes)expect(ids.has(episode.id)).toBe(true);
  if(focus){const episode=episodes.find(n=>n.id===focus)!;for(const node of model.nodes.filter(n=>n.episodeId===episode.episodeId))expect(ids.has(node.id)).toBe(true);}
  for(const episode of episodes)expect(view.nodes.some((n:any)=>n.episodeId===episode.episodeId&&n.kind!=='episode')).toBe(true);
 }
 const full=selectGraphView(graph,{limit:model.nodes.length});expect(full.nodes.length).toBe(model.nodes.length);expect(full.allConnections.length).toBe(allConnections.length);
 const tiny=selectGraphView(graph,{limit:1});expect(tiny.nodes.filter((n:any)=>n.kind==='episode').length).toBe(episodes.length);
});
