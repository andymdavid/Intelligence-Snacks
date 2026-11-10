#!/usr/bin/env node
// node research.mjs "persistent agent work" [https://intelligencesnacks.com]
const query = process.argv[2];
if (!query) { console.error('Usage: node research.mjs "search words" [base URL]'); process.exit(1); }
const base = process.argv[3] || 'https://intelligencesnacks.com';
const get = async url => { const response = await fetch(url); if (!response.ok) throw new Error(`${response.status}: ${url}`); return response.json(); };
const index = await get(new URL('/api/knowledge/v1/index.json', base));
const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
const matches = index.entries.map(entry => ({entry, score:words.reduce((sum, word)=>sum+(entry.title.toLowerCase().includes(word)?3:0)+(entry.summary.toLowerCase().includes(word)?1:0),0)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.entry.id.localeCompare(b.entry.id)).slice(0,5);
const results = [];
for (const {entry,score} of matches) {
  const record = await get(new URL(new URL(entry.url).pathname, base));
  const sources = record.sources ? record.sources.map(source=>source.observation) : [record];
  results.push({id:entry.id,title:entry.title,score,citationUrl:entry.citationUrl,recordUrl:entry.url,summary:record.summary,readingNotes:record.readingNotes||[],sources:sources.map(node=>({title:node.title,episode:node.episode,evidence:node.evidence.map(e=>({speaker:e.speaker,excerpt:e.excerpt,url:e.sourceUrl,locator:e.locator,timestamp:e.timestamp}))}))});
}
console.log(JSON.stringify({schemaVersion:index.schemaVersion,contentRevision:index.contentRevision,query,method:'Local lexical matching of index titles and summaries; scores measure word matches, not truth or semantic agreement.',results},null,2));
