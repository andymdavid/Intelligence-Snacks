#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
// Dependency-free lexical retrieval shared by the example client and evaluation.
const stopwords = new Set('a an and are as at be been between by can could do does for from had has have how i in into is it its might of on or our should than that the their them there these they this to was we were what when where which who why will with without would you your'.split(' '));
export function tokens(text) {
  return [...new Set((text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [])
    .filter(word => word.length > 1 && !stopwords.has(word))
    .map(word => word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word))];
}
export function rankEntries(entries, query, limit = 5) {
  const terms = tokens(query);
  const docs = entries.map(entry => ({entry, title: new Set(tokens(entry.title)), summary: new Set(tokens(entry.summary))}));
  const frequencies = new Map(terms.map(term => [term, docs.filter(doc => doc.title.has(term) || doc.summary.has(term)).length]));
  return docs.map(doc => ({entry: doc.entry, score: terms.reduce((score, term) => {
    const weight = Math.log(1 + (docs.length - frequencies.get(term) + 0.5) / (frequencies.get(term) + 0.5));
    return score + weight * ((doc.title.has(term) ? 3 : 0) + (doc.summary.has(term) ? 1 : 0));
  }, 0)})).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id)).slice(0, limit);
}

// node research.mjs "persistent agent work" [https://intelligencesnacks.com]
async function main() {
const query = process.argv[2];
if (!query) { console.error('Usage: node research.mjs "search words" [base URL]'); process.exit(1); }
const base = process.argv[3] || 'https://intelligencesnacks.com';
const get = async url => { const response = await fetch(url); if (!response.ok) throw new Error(`${response.status}: ${url}`); return response.json(); };
const index = await get(new URL('/api/knowledge/v1/index.json', base));
const matches = rankEntries(index.entries, query);
const results = [];
for (const {entry,score} of matches) {
  const record = await get(new URL(new URL(entry.url).pathname, base));
  const sources = record.sources ? record.sources.map(source=>source.observation) : [record];
  results.push({id:entry.id,title:entry.title,score,citationUrl:entry.citationUrl,recordUrl:entry.url,summary:record.summary,readingNotes:record.readingNotes||[],sources:sources.map(node=>({title:node.title,episode:node.episode,evidence:node.evidence.map(e=>({speaker:e.speaker,excerpt:e.excerpt,url:e.sourceUrl,locator:e.locator,timestamp:e.timestamp}))}))});
}
console.log(JSON.stringify({schemaVersion:index.schemaVersion,contentRevision:index.contentRevision,query,method:'Local lexical matching with whole words, stopword removal and corpus-frequency weighting; scores are relevance hints, not truth or semantic agreement.',results},null,2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
