import { canonicalPublicGraph } from '../src/lib/public-graph-data';
import { buildKnowledgeModel } from '../src/lib/graph-model';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const data=canonicalPublicGraph();const model=buildKnowledgeModel(data);const ids=new Set(model.nodes.map(node=>node.id));
if(ids.size!==model.nodes.length)throw new Error('Duplicate graph identity');
for(const edge of model.links)if(!ids.has(edge.source)||!ids.has(edge.target))throw new Error(`Dangling edge ${edge.source} -> ${edge.target}`);
for(const node of model.nodes)if(node.href&&!node.href.startsWith('/graph/')) {
 const parts=node.href.split('/').filter(Boolean);const directory=parts[0]==='contributors'?'people':parts[0];
 if(!existsSync(`src/content/${directory}/${parts[1]}.md`))throw new Error(`Unpublished graph destination ${node.href}`);
}
for(const node of data.knowledge.nodes)if(node.reviewState!=='accepted'||!node.evidence?.length)throw new Error(`Ineligible knowledge ${node.id}`);
for(const item of [...data.knowledge.edges,...data.knowledge.snackLinks])if(item.reviewState!=='accepted')throw new Error(`Unaccepted graph edge ${item.id}`);
const revisionByEpisode=new Map<string,string>();
for(const node of data.knowledge.nodes){const known=revisionByEpisode.get(node.episodeId);if(known&&known!==node.sourceTranscriptRevisionId)throw new Error(`Multiple graph source revisions for episode ${node.episodeId}`);revisionByEpisode.set(node.episodeId,node.sourceTranscriptRevisionId);}
for(const analysis of data.topicIndex.analyses)if(revisionByEpisode.has(analysis.episodeId)&&revisionByEpisode.get(analysis.episodeId)!==analysis.transcriptRevisionId)throw new Error(`Knowledge/topic revision mismatch for episode ${analysis.episodeId}`);
if(process.argv.includes('--built')) {
 const html=readFileSync('dist/graph/index.html','utf8');
 const payload=JSON.parse(/id="knowledge-data"[^>]*>(.*?)<\/script>/s.exec(html)?.[1]||'null');
 if(payload?.nodes.length!==model.nodes.length)throw new Error('Built graph index is incomplete');
 if(payload.nodes.some((node:any)=>node.evidence?.length))throw new Error('Evidence must load on demand');
 for(const node of model.nodes)if(node.href&&!node.href.startsWith('/graph/')&&!existsSync(`dist${node.href}index.html`))throw new Error(`Built destination missing ${node.href}`);
 if(!existsSync('dist/graph/details.json'))throw new Error('Evidence dataset missing');
 console.log(JSON.stringify({htmlBytes:Buffer.byteLength(html),evidenceBytes:readFileSync('dist/graph/details.json').length}));
}
console.log(JSON.stringify({nodes:model.nodes.length,connections:model.links.length,snacks:data.candidates.length,knowledge:data.knowledge.nodes.length,canonicalConcepts:model.nodes.filter(node=>node.kind==='canonical').length,sourceGraphSha256:createHash('sha256').update(readFileSync('src/data/graph.json')).digest('hex'),policy:data.publicationPolicy||'legacy snapshot; review metadata is not evidence of human approval'}));
