import {chromium} from 'playwright-core';
import {writeFileSync} from 'node:fs';
const base=process.env.GRAPH_PREVIEW_URL||'http://127.0.0.1:8768';
const browser=await chromium.launch({executablePath:process.env.GRAPH_CHROMIUM_EXECUTABLE,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1600,height:1100}}),checks=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
const check=(ok,label,detail)=>{checks.push({label,ok,detail});if(!ok)throw Error(label+': '+JSON.stringify(detail));};
async function labelGeometry(){return page.locator('.graphTextLayer g').evaluateAll(groups=>{const boxes=groups.map(g=>g.querySelector('rect').getBoundingClientRect());let overlaps=0;for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++)if(Math.min(boxes[i].right,boxes[j].right)>Math.max(boxes[i].left,boxes[j].left)&&Math.min(boxes[i].bottom,boxes[j].bottom)>Math.max(boxes[i].top,boxes[j].top))overlaps++;return {count:boxes.length,overlaps};});}
try{
 await page.goto(base+'/graph/?node=episode%3A1d2c8c00-ecc4-4966-bdac-cbf6ce3e1385',{waitUntil:'networkidle'});await page.waitForSelector('.graphTextLayer text');
 check(await page.locator('canvas').count()===7,'node-link graph remains rendered');
 check((await page.locator('[data-view-count]').textContent()).startsWith('41 of'),'all 41 episode neighborhood nodes retained');
 check(await page.locator('[data-detail]').isHidden(),'episode opens with full graph width');
 const initial=await labelGeometry();check(initial.count>0&&initial.count<=8,'sparse default label budget',initial);check(initial.overlaps===0,'zero overlapping labels at fitted zoom',initial);
 check((await page.locator('.graphTextLayer text').allTextContents()).every(text=>text.length<=26),'canvas labels short');
 await page.locator('[data-public-graph]').screenshot({path:'/tmp/snack-spacing-desktop.png'});
 const anchor=await page.locator('.graphTextLayer g').evaluateAll(groups=>{const g=groups.find(g=>g.querySelector('text').textContent.includes('…'));return {id:g.dataset.nodeId,x:Number(g.dataset.nodeX),y:Number(g.dataset.nodeY)};});
 const bounds=await page.locator('[data-public-graph]').boundingBox();await page.mouse.move(bounds.x+anchor.x,bounds.y+anchor.y);await page.waitForSelector('.graphHoverTitle:not([hidden])');
 const expectedTitle=await page.evaluate(id=>JSON.parse(document.querySelector('#knowledge-data').textContent).nodes.find(n=>n.id===id).title,anchor.id);
 check(await page.locator('.graphHoverTitle').textContent()===expectedTitle,'hover reveals full untruncated title');
 await page.locator('[data-public-graph]').screenshot({path:'/tmp/snack-spacing-hover.png'});
 await page.evaluate(()=>window.readabilityCanvas=document.querySelector('[data-public-graph] canvas'));
 await page.mouse.click(bounds.x+anchor.x,bounds.y+anchor.y);await page.waitForSelector('[data-detail] blockquote');
 check(await page.locator('[data-detail]').isVisible(),'selection opens evidence alongside graph');check(await page.evaluate(()=>window.readabilityCanvas===document.querySelector('[data-public-graph] canvas')),'selection preserves renderer and layout');
 check((await page.locator('[data-view-count]').textContent()).startsWith('41 of'),'selection retains episode neighborhood');const selectedPosition=()=>page.locator('.graphTextLayer g').evaluateAll((groups,id)=>{const group=groups.find(g=>g.dataset.nodeId===id);return {x:Number(group.dataset.nodeX),y:Number(group.dataset.nodeY)};},anchor.id);const settledA=await selectedPosition();await page.waitForTimeout(500);const settledB=await selectedPosition();check(Math.hypot(settledB.x-settledA.x,settledB.y-settledA.y)<0.5,'selection does not reheat settled positions');check((await labelGeometry()).overlaps===0,'selected view labels remain non-overlapping');
 await page.locator('[data-details-toggle]').click();await page.waitForTimeout(100);
 const beforeTitles=await page.locator('.graphTextLayer text').allTextContents();for(let i=0;i<3;i++){await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.waitForTimeout(230);}const zoomTitles=await page.locator('.graphTextLayer text').allTextContents();check(zoomTitles.some(title=>!beforeTitles.includes(title)),'zoom reveals additional idea labels',{before:beforeTitles.length,after:zoomTitles.length,newTitles:zoomTitles.filter(title=>!beforeTitles.includes(title))});
 await page.getByRole('button',{name:'Fit graph',exact:true}).click();await page.waitForTimeout(300);await page.locator('[data-expand]').click();await page.waitForTimeout(150);check(await page.evaluate(()=>Boolean(document.fullscreenElement)||document.querySelector('.graph-layout').classList.contains('is-expanded')),'graph expands');if(await page.evaluate(()=>Boolean(document.fullscreenElement)))await page.evaluate(()=>document.exitFullscreen());
 await page.goto(base+'/graph/?node=episode%3A1d2c8c00-ecc4-4966-bdac-cbf6ce3e1385',{waitUntil:'networkidle'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(150);const mobile=await labelGeometry();check(mobile.overlaps===0,'mobile labels do not overlap',mobile);check((await page.locator('.graphTextLayer text').allTextContents()).includes('Episode 78'),'selected episode label remains readable on mobile');check(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth),'mobile has no horizontal overflow');await page.locator('[data-public-graph]').screenshot({path:'/tmp/snack-spacing-mobile.png'});
 check(errors.length===0,'no browser errors',errors);
}finally{writeFileSync('/tmp/snack-readability-results.json',JSON.stringify(checks,null,2));console.log(JSON.stringify(checks,null,2));await browser.close();}
