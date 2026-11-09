/** Produce a single HTML review file; source links and branding assets use the live public site. */
import {readFileSync,writeFileSync} from 'node:fs';
const output=process.argv[2]||'/tmp/graph-explorer-preview.html';
let html=readFileSync('dist/graph/index.html','utf8');
const safe=text=>text.replace(/<\/script/gi,'<\\/script');
html=html.replace(/<link rel="stylesheet" href="(\/_astro\/[^\"]+)"\s*\/?>/g,(_,path)=>`<style>${readFileSync('dist'+path,'utf8').replace(/url\(\//g,'url(https://intelligencesnacks.com/')}</style>`);
html=html.replace(/<script type="module" src="(\/_astro\/[^\"]+)"><\/script>/g,(_,path)=>`<script type="module">${safe(readFileSync('dist'+path,'utf8'))}</script>`);
const evidence=JSON.parse(readFileSync('dist/graph/details.json','utf8'));
for(const record of Object.values(evidence))for(const item of record.evidence||[])if(item.sourceHref?.startsWith('/'))item.sourceHref='https://intelligencesnacks.com'+item.sourceHref;
html=html.replace('</head>',`<base href="https://intelligencesnacks.com/"><script id="preview-evidence" type="application/json">${safe(JSON.stringify(evidence).replace(/</g,'\\u003c'))}</script><script>const originalFetch=window.fetch.bind(window);window.fetch=(input,options)=>String(input).split('?')[0].endsWith('/details.json')?Promise.resolve(new Response(document.querySelector('#preview-evidence').textContent,{headers:{'content-type':'application/json'}})):originalFetch(input,options);</script></head>`);
html=html.replace(/id="knowledge-data"([^>]*)>(.*?)<\/script>/s,(_,attrs,json)=>{const model=JSON.parse(json);for(const node of model.nodes)if(node.href?.startsWith('/'))node.href='https://intelligencesnacks.com'+node.href;return `id="knowledge-data"${attrs}>${JSON.stringify(model).replace(/</g,'\\u003c')}</script>`;});
writeFileSync(output,html);console.log(`${output}: ${Buffer.byteLength(html)} bytes`);
