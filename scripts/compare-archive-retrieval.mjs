import { chromium } from 'playwright-core';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { rankEntries } from '../public/agents/research.mjs';
const base = process.argv[2] || 'https://intelligencesnacks.com';
const suite = JSON.parse(await readFile(new URL('../docs/agent-research-evaluation.json',import.meta.url)));
// Explicit editorial reformulations; these are not the same queries or automatic optimisation.
const keywords = ['agent context','human review','code','shared work','attention','authority','model','visual','experiment','operational knowledge','content','privacy'];
const response = await fetch(new URL('/api/knowledge/v1/index.json',base));
if (!response.ok) throw new Error(`Research index: ${response.status}`);
const index = await response.json();
const browser = await chromium.launch({executablePath:process.env.GRAPH_CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox']});
try {
 const page = await browser.newPage();
 await page.goto(new URL('/search/',base).href,{waitUntil:'networkidle'});
 const archiveIndex = await page.locator('#search-index').textContent();
 const archiveSearch = async query => {
  await page.locator('[data-search-input]').fill(query);
  return {query,count:await page.locator('[data-results-count]').textContent(),results:await page.locator('[data-search-results] a').evaluateAll(as=>as.slice(0,5).map(a=>({url:a.href,title:a.querySelector('strong')?.textContent||a.textContent}))) };
 };
 const rows=[];
 for(let i=0;i<suite.questions.length;i++){
  const question=suite.questions[i].question;
  rows.push({question,ordinaryQuestion:await archiveSearch(question),ordinaryKeywords:await archiveSearch(keywords[i]),researchQuestion:rankEntries(index.entries,question).map(({entry,score})=>({id:entry.id,title:entry.title,url:entry.url,citationUrl:entry.citationUrl,score}))});
 }
 const output={runAt:new Date().toISOString(),base,contentRevision:index.contentRevision,archiveIndexSha256:createHash('sha256').update(archiveIndex).digest('hex'),method:'Actual browser search UI, unchanged natural-language questions plus separately declared editorial keyword reformulations. Research client runs the unchanged natural-language questions. Result availability is not relevance or generated-answer quality.',summary:{ordinaryQuestionWithResults:rows.filter(r=>r.ordinaryQuestion.results.length).length,ordinaryKeywordsWithResults:rows.filter(r=>r.ordinaryKeywords.results.length).length,researchQuestionWithResults:rows.filter(r=>r.researchQuestion.length).length,questions:rows.length},rows};
 await writeFile(new URL('../docs/archive-retrieval-comparison.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
 console.log(JSON.stringify(output.summary,null,2));
}finally{await browser.close();}
