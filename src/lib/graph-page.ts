import { selectGraphView,ideaDiscovery } from './graph-view.js';
type Node = { id: string; kind: string; title: string; summary: string; episodeId: string; episodeNumber?: number; href?: string; evidenceCount?: number; reviewer?: string; reviewMethod?: string };
type Edge = { sourceId: string; targetId: string; relationshipType: string; explanation: string; reviewMethod?:string; reviewer?:string; reviewedAt?:string; reviewedRelationshipId?:string };
export function initialiseGraphPage() {
  const model = JSON.parse(document.querySelector('#knowledge-data')?.textContent || '{}');
  const membership = JSON.parse(document.querySelector('#topic-membership')?.textContent || '{}');
  const byId = new Map<string, Node>(model.nodes.map((node: Node) => [node.id,node]));
  const search = document.querySelector<HTMLInputElement>('[data-search]')!;
  const kind = document.querySelector<HTMLSelectElement>('[data-kind]')!;
  const episode = document.querySelector<HTMLSelectElement>('[data-episode]')!;
  const topic = document.querySelector<HTMLSelectElement>('[data-topic]')!;
  const detail = document.querySelector<HTMLElement>('[data-detail]')!;
  const canvas = document.querySelector<HTMLElement>('[data-public-graph]')!;
  const rows = [...document.querySelectorAll<HTMLElement>('[data-result]')];
  let cleanup: (()=>void) & {updateSelection?:(id:string)=>boolean} = () => {};
  let episodeContextId='';
  let displayMode=new URLSearchParams(location.search).get('view')==='episodes'?'episodes':'ideas';
  const scope=document.querySelector<HTMLSelectElement>('[data-idea-scope]')!;scope.value=new URLSearchParams(location.search).get('scope')==='pilot'?'pilot':'all';
  function syncView(){document.querySelectorAll<HTMLButtonElement>('[data-graph-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.graphView===displayMode)));document.querySelector<HTMLElement>('[data-ideas-controls]')!.hidden=displayMode!=='ideas';document.querySelector<HTMLElement>('[data-idea-discovery]')!.hidden=displayMode!=='ideas';document.querySelector<HTMLElement>('[data-view-help]')!.textContent=displayMode==='ideas'?'Ideas are arranged by their connections, across episodes. Size reflects direct idea connections; it is not an importance score. Open an idea for its sources.':'Every episode stays available as a gateway. Selecting one expands its content while retaining the other episode gateways.';}
  syncView();
  let renderedViewKey='';
  const layout=document.querySelector<HTMLElement>('.graph-layout')!;
  const detailToggle=document.querySelector<HTMLButtonElement>('[data-details-toggle]')!;
  function setDetails(open:boolean){detail.hidden=!open;layout.classList.toggle('has-details',open);detailToggle.textContent=open?'Hide details':'Show details';detailToggle.setAttribute('aria-expanded',String(open));requestAnimationFrame(()=>canvas.dispatchEvent(new CustomEvent('graph-layout-change')));}
  setDetails(false);
  detailToggle.addEventListener('click',()=>setDetails(Boolean(detail.hidden)));
  const expand=document.querySelector<HTMLButtonElement>('[data-expand]')!;
  expand.addEventListener('click',async()=>{if(document.fullscreenElement){await document.exitFullscreen();return;}try{await layout.requestFullscreen();}catch{layout.classList.toggle('is-expanded');expand.textContent=layout.classList.contains('is-expanded')?'Reduce graph':'Expand graph';canvas.dispatchEvent(new CustomEvent('graph-layout-change'));}});
  document.addEventListener('fullscreenchange',()=>{expand.textContent=document.fullscreenElement?'Reduce graph':'Expand graph';requestAnimationFrame(()=>canvas.dispatchEvent(new CustomEvent('graph-layout-change')));});
  let selected = '';
  let frozen = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let mountGraph: any;
  let detailsPromise: Promise<Record<string, any>> | null = null;
  const emit = (name: string, node?: Node) => document.dispatchEvent(new CustomEvent('snack-graph', { detail:{name,kind:node?.kind,episodeNumber:node?.episodeNumber} }));
  const el = (tag: string, text: string) => { const element = document.createElement(tag); element.textContent = text; return element; };
  function updateUrl() {
    const url = new URL(location.href);
    for (const [key,value] of Object.entries({view:displayMode,scope:displayMode==='ideas'&&scope.value==='pilot'?'pilot':'',node:selected,context:episodeContextId,q:search.value,kind:kind.value,episode:episode.value,topic:topic.value,density:document.querySelector<HTMLSelectElement>('[data-density]')!.value==='1000000'?'all':''})) { if(value)url.searchParams.set(key,value);else url.searchParams.delete(key); }
    history.replaceState(null,'',url);
  }
  function filter() {
    const query = search.value.toLocaleLowerCase().trim(); let count = 0;
    for(const row of rows) {
      const node=byId.get(row.dataset.result!)!;
      const show=(!query || `${node.title} ${node.summary}`.toLocaleLowerCase().includes(query)) && (!kind.value || node.kind===kind.value) && (!episode.value || node.episodeId===episode.value) && (!topic.value || (membership[topic.value]||[]).includes(node.episodeId));
      row.hidden=!show; if(show)count++;
    }
    document.querySelector('[data-result-count]')!.textContent=`${count} of ${model.nodes.length} archive results`;
    updateUrl();
  }
  function mount() {
    if(!mountGraph) return;
    const anchor=displayMode==='ideas'?(byId.get(selected)||null):episodeContextId?model.nodes.find((node:Node)=>node.kind==='episode'&&node.episodeId===episodeContextId):byId.get(selected)||null;
    const limit=Number(document.querySelector<HTMLSelectElement>('[data-density]')!.value)||320;
    const key=`${displayMode}:${scope.value}:${displayMode==='ideas'?'semantic':anchor?.id||'overview'}:${limit}`;
    if(key===renderedViewKey && cleanup.updateSelection?.(selected)){canvas.dispatchEvent(new CustomEvent('graph-layout-change'));return;}
    cleanup();
    const focused={...model,focus:anchor,explicitFocus:Boolean(anchor),selectedNodeId:selected,freezeLayout:frozen,viewLimit:limit,displayMode,ideaScope:scope.value};
    const view=selectGraphView(focused,{focusId:anchor?.id,limit});
    document.querySelector('[data-view-count]')!.textContent=`${view.nodes.length} of ${view.totalNodes} ${displayMode==='ideas'?'ideas':'nodes'} · ${view.allConnections.length} connections in view`;
    try { cleanup=mountGraph(canvas,focused,(id:string)=>{ void select(id,true); }); renderedViewKey=key; }
    catch { canvas.replaceChildren(el('p','The visual map is unavailable. Use the complete archive index below.'));emit('render-fallback'); }
  }
  async function select(id:string, focusPanel=false) {
    const node=byId.get(id); if(!node)return;
    if(!['concept','claim','example','question','canonical'].includes(node.kind)){displayMode='episodes';syncView();}
    if(displayMode==='ideas'&&scope.value==='pilot'){const pilot=selectGraphView({...model,displayMode:'ideas',ideaScope:'pilot'},{limit:1000000});if(!pilot.nodes.some((n:Node)=>n.id===id))scope.value='all';}
    if(node.kind==='episode')episodeContextId=node.episodeId;
    else if(node.kind==='root'||node.kind==='canonical'||(node.episodeId&&node.episodeId!==episodeContextId))episodeContextId='';
    selected=id;updateUrl();emit('select',node);setDetails(node.kind!=='episode');mount();
    detail.replaceChildren();
    const title=el('h2',node.title);title.id='graph-detail-title';title.tabIndex=-1;
    detail.append(el('p',`${node.kind}${node.episodeNumber?` · Episode ${node.episodeNumber}`:''}`),title,el('p',node.summary||''));
    if(node.href && !node.href.startsWith('/graph/')) {
      const link=el('a',node.kind==='snack'?'Read this Snack':'Open source page') as HTMLAnchorElement;link.href=node.href;link.addEventListener('click',()=>emit('content-open',node));detail.append(link);
    }
    if(node.reviewMethod)detail.append(el('p',`Grouping review: ${node.reviewMethod} by ${node.reviewer}. Source claims remain independent.`));
    const edges=model.allConnections.filter((edge:Edge)=>edge.sourceId===id||edge.targetId===id);
    detail.append(el('h3',`${edges.length} connections`));
    const list=el('ul','');
    for(const edge of edges) {
      const outgoing=edge.sourceId===id;const target=byId.get(outgoing?edge.targetId:edge.sourceId);if(!target)continue;
      const row=el('li','');const type=el('span',`${outgoing?'Outgoing':'Incoming'} · ${edge.relationshipType.replaceAll('-',' ')}`);type.className='edge-type';
      const link=el('a',target.title) as HTMLAnchorElement;link.href=`/graph/?node=${encodeURIComponent(target.id)}`;link.addEventListener('click',(event)=>{event.preventDefault();emit(target.episodeId!==node.episodeId?'cross-episode':'follow-connection',target);void select(target.id,true);});
      row.append(type,link);if(edge.explanation)row.append(el('p',edge.explanation));if(edge.reviewMethod)row.append(el('p',`Connection interpretation: ${edge.reviewMethod.replaceAll('-',' ')} by ${edge.reviewer}, ${edge.reviewedAt}. Open each idea to inspect its separate source evidence.`));list.append(row);
    }
    detail.append(list);
    const evidenceSection=el('section','');detail.append(evidenceSection);
    if(node.kind==='canonical') {
      evidenceSection.append(el('p','Open a linked discussion to inspect its separate source evidence.'));
    } else if(node.evidenceCount) {
      evidenceSection.append(el('p','Loading source excerpts…'));
      try {
        detailsPromise ||= fetch('/graph/details.json').then(response=>{if(!response.ok)throw new Error('Evidence request failed');return response.json();}).catch(error=>{detailsPromise=null;throw error;});
        const all=await detailsPromise;if(selected!==id)return;
        const record=all[id];evidenceSection.replaceChildren(el('h3','Source evidence'),el('p',record?.reviewMethod||'Source record'));
        for(const evidence of record?.evidence||[]) {
          const quote=el('blockquote',evidence.excerpt);const caption=el('p',evidence.speaker||'Speaker not identified');quote.append(caption);if(evidence.sourceHref){const source=el('a',evidence.timestamp?`Read at ${evidence.timestamp}`:'Read source transcript') as HTMLAnchorElement;source.href=evidence.sourceHref;source.addEventListener('click',()=>emit('source-open',node));quote.append(source);}evidenceSection.append(quote);
        }
        evidenceSection.append(el('p','Excerpts ground this idea in the transcript. They do not independently verify that the claim is true.'));
        emit('evidence-open',node);
      } catch { evidenceSection.replaceChildren(el('p','Source excerpts could not load. Open the source episode or select this node again to retry.')); }
    }
    if(focusPanel)title.focus({preventScroll:true});
  }
  for(const row of rows)row.querySelector('a')!.addEventListener('click',event=>{event.preventDefault();void select(row.dataset.result!,true);});
  search.addEventListener('input',filter);for(const control of [kind,episode,topic])control.addEventListener('change',()=>{filter();emit('filter');});
  document.querySelectorAll<HTMLElement>('[data-topic-pick]').forEach(button=>button.addEventListener('click',()=>{topic.value=button.dataset.topicPick!;filter();search.focus();}));
  document.querySelectorAll<HTMLButtonElement>('[data-graph-view]').forEach(button=>button.addEventListener('click',()=>{displayMode=button.dataset.graphView!;selected='';episodeContextId='';setDetails(false);syncView();updateUrl();mount();}));
  scope.addEventListener('change',()=>{selected='';episodeContextId='';setDetails(false);updateUrl();mount();});
  const discovery=ideaDiscovery(model),discoveryElement=document.querySelector<HTMLElement>('[data-idea-discovery]')!;
  const shared=el('section','');shared.append(el('h2','Shared ideas — reviewed pilot'),el('p',`${discovery.reviewedCrossEpisodeLinks} reviewed cross-episode connections. Coverage is limited to graph memory and agent harnesses; these are not rankings of the whole archive.`));
  for(const idea of discovery.shared){const button=el('button',`${idea.title} · ${idea.episodeReach} episodes · ${idea.recentEpisodes} in the latest five`) as HTMLButtonElement;button.type='button';button.dataset.sharedIdea=idea.id;button.addEventListener('click',()=>void select(idea.id,true));shared.append(button);}
  const recent=el('section','');recent.append(el('h2','Recent discussions'),el('p','From the latest five published episodes. Recency is a discovery cue, not evidence that an idea is growing.'));
  for(const idea of discovery.recent){const button=el('button',`${idea.title} · Episode ${idea.episodeNumber}`) as HTMLButtonElement;button.type='button';button.addEventListener('click',()=>void select(idea.id,true));recent.append(button);}
  discoveryElement.append(shared,recent);
  document.querySelector('[data-density]')!.addEventListener('change',()=>{updateUrl();mount();});
  document.querySelector('[data-reset]')!.addEventListener('click',()=>{selected='';episodeContextId='';setDetails(false);updateUrl();mount();});
  const motion=document.querySelector<HTMLButtonElement>('[data-motion]')!;
  motion.textContent=frozen?'Show static map':'Freeze layout';motion.setAttribute('aria-pressed',String(frozen));
  motion.addEventListener('click',()=>{frozen=!frozen;motion.textContent=frozen?'Resume layout':'Freeze layout';motion.setAttribute('aria-pressed',String(frozen));if(frozen){canvas.dispatchEvent(new CustomEvent('graph-freeze'));}else {renderedViewKey='';mount();}});
  const params=new URLSearchParams(location.search);if(params.get('density')==='all')document.querySelector<HTMLSelectElement>('[data-density]')!.value='1000000';search.value=params.get('q')||'';kind.value=params.get('kind')||'';episode.value=params.get('episode')||'';topic.value=params.get('topic')||'';filter();
  if(params.get('context')&&model.nodes.some((node:Node)=>node.kind==='episode'&&node.episodeId===params.get('context')))episodeContextId=params.get('context')!;
  if(params.get('node'))void select(params.get('node')!);
  // The text index works before or without WebGL and before the rendering bundle downloads.
  const moduleUrl=canvas.dataset.rendererUrl||'/graph-explorer.js';
  import(/* @vite-ignore */ moduleUrl).then(module=>{mountGraph=module.mountKnowledgeGraph;mount();}).catch(()=>{canvas.replaceChildren(el('p','The visual map could not load. The archive index and source details remain available.'));});
}
