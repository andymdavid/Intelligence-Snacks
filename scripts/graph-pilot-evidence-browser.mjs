import {chromium} from 'playwright-core';
import {writeFileSync} from 'node:fs';
const base=process.env.GRAPH_PREVIEW_URL||'http://127.0.0.1:8768';
const browser=await chromium.launch({executablePath:process.env.GRAPH_CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage(),checks=[];
const check=(ok,label,detail)=>{checks.push({label,ok,detail});console.log(label,ok,detail||'');if(!ok)throw Error(label);};
try{
 await page.goto(base+'/graph/?view=ideas&scope=pilot',{waitUntil:'domcontentloaded'});
 const model=await page.evaluate(()=>JSON.parse(document.querySelector('#knowledge-data').textContent));
 const ids=[...new Set(model.allConnections.filter(edge=>edge.reviewedRelationshipId).flatMap(edge=>[edge.sourceId,edge.targetId]))];check(ids.length===5,'five distinct reviewed source endpoints');
 const response=await page.request.get(base+'/graph/details.json');check(response.ok(),'source evidence dataset loads');const details=await response.json();
 for(const id of ids){const evidence=details[id].evidence.find(item=>item.sourceHref?.includes('#transcript-turn-'));check(Boolean(evidence),'reviewed endpoint has an anchored published passage',id);await page.goto(base+evidence.sourceHref,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('.transcript-reader')?.open&&Boolean(document.querySelector(':target')));check(await page.locator(':target').count()===1&&await page.locator(':target').innerText().then(text=>text.length>24),'source reader opens the matching target',evidence.sourceHref);}
}finally{writeFileSync('/tmp/snack-pilot-evidence-results.json',JSON.stringify(checks,null,2));await browser.close();}
