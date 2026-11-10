import { readFile, writeFile } from 'node:fs/promises';
import { rankEntries } from '../public/agents/research.mjs';
const base = process.argv[2] || 'https://intelligencesnacks.com';
const get = async path => {const response = await fetch(new URL(path, base)); if (!response.ok) throw new Error(`${response.status} ${path}`); return response.json();};
const index = await get('/api/knowledge/v1/index.json');
const suite = JSON.parse(await readFile(new URL('../docs/agent-research-evaluation.json', import.meta.url)));
const legacy = query => {
  const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  return index.entries.map(entry => ({entry,score:words.reduce((sum,word)=>sum+(entry.title.toLowerCase().includes(word)?3:0)+(entry.summary.toLowerCase().includes(word)?1:0),0)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id)).slice(0,5);
};
const rows = [];
for (const item of suite.questions) {
  const relevant = new Set(item.startingThemes.map(id => `canonical:${id}`));
  for (const id of item.startingThemes) {
    const theme = await get(`/api/knowledge/v1/ideas/${id}.json`);
    for (const source of theme.sources) relevant.add(source.observation.id);
  }
  const summarize = results => ({hits:results.filter(r=>relevant.has(r.entry.id)).length,results:results.map(({entry,score})=>({id:entry.id,title:entry.title,url:entry.url,score,startingThemeOrMember:relevant.has(entry.id)}))});
  rows.push({...item,legacy:summarize(legacy(item.question)),revised:summarize(rankEntries(index.entries,item.question)),observationsOnly:summarize(rankEntries(index.entries.filter(entry=>entry.kind!=='shared-idea'),item.question))});
}
const output = {runAt:new Date().toISOString(),base,contentRevision:index.contentRevision,method:'Top-five lexical retrieval comparison. Relevance proxy is the pre-existing starting themes and their member observations; incomplete relevance labels, not answer-quality or visibility measurement.',summary:Object.fromEntries(['legacy','revised','observationsOnly'].map(key=>[key,{questionsWithHit:rows.filter(row=>row[key].hits>0).length,totalHits:rows.reduce((sum,row)=>sum+row[key].hits,0),questions:rows.length}])),rows};
await writeFile(new URL('../docs/agent-retrieval-results.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output.summary,null,2));
