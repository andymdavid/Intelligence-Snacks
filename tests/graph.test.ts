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

import {deriveEpisodeMap} from '../src/lib/episode-map.js';
test('Episode 78 groups every published idea and Snack into a readable board',()=>{
 const episode=model.nodes.find(node=>node.kind==='episode'&&node.episodeNumber===78)!;
 const view=deriveEpisodeMap({...model,allConnections:model.links.map(edge=>({sourceId:edge.source,targetId:edge.target,relationshipType:edge.type}))},episode.episodeId)!;
 expect(view.nodes).toHaveLength(37);expect(view.people).toHaveLength(2);expect(view.groups.map(group=>[group.kind,group.nodes.length])).toEqual([['concept',8],['claim',13],['example',3],['question',6],['snack',7]]);
});
