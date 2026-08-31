type AnyRecord = Record<string, any>;

const rootColours: Record<string, string> = {
  agents: '#d1ddd3', 'ai-coding': '#3292ff', 'ai-models-infrastructure': '#75c9c8', bitcoin: '#fe7141',
  'business-markets': '#f4bf58', 'knowledge-memory': '#ef8fb1', 'privacy-security': '#d89b72',
  'social-media': '#6b8fd6', 'software-systems': '#cdabfe',
};
const fallbackColours = ['#fe7445','#334891','#d1ddd3','#a89be8','#7ba2ad','#e07250','#cdabfe','#153250','#c8d5c2'];

function colourFamily(hex: string, count: number) {
  const value = hex.replace('#', ''); const r = Number.parseInt(value.slice(0,2),16)/255; const g = Number.parseInt(value.slice(2,4),16)/255; const b = Number.parseInt(value.slice(4,6),16)/255;
  const max = Math.max(r,g,b); const min = Math.min(r,g,b); const delta = max - min; const midpoint = (max + min) / 2; let hue = 0;
  if (delta) { if (max === r) hue = ((g-b)/delta)%6; else if (max === g) hue = (b-r)/delta+2; else hue = (r-g)/delta+4; }
  hue = Math.round((hue*60+360)%360); const saturation = Math.max(28, Math.round(delta ? delta/(1-Math.abs(2*midpoint-1))*100 : 0));
  return Array.from({ length: count }, (_, index) => `hsl(${hue} ${saturation}% ${count === 1 ? 58 : Math.round(34 + 48*index/(count-1))}%)`);
}

export function buildTopicModel(data: AnyRecord) {
  const topics = data.topicIndex?.topics || []; const passages = data.topicIndex?.passages || []; const analyses = data.topicIndex?.analyses || [];
  const byId = new Map<string,AnyRecord>(topics.map((topic: AnyRecord) => [String(topic.id), topic]));
  const rootFor = (id: string) => { let topic: AnyRecord | undefined = byId.get(id); const seen = new Set<string>(); while (topic?.parentTopicId && byId.has(topic.parentTopicId) && !seen.has(topic.parentTopicId)) { seen.add(topic.id); topic = byId.get(topic.parentTopicId); } return topic?.id || id; };
  const roots = topics.filter((topic: AnyRecord) => !topic.parentTopicId).sort((a: AnyRecord,b: AnyRecord) => a.name.localeCompare(b.name));
  const colours = new Map<string,string>(roots.map((root: AnyRecord,index: number) => [String(root.id), rootColours[root.id] || fallbackColours[index%fallbackColours.length] || '#d1ddd3']));
  const childrenByRoot = new Map<string, AnyRecord[]>();
  for (const root of roots) { const children = topics.filter((topic: AnyRecord) => topic.id !== root.id && rootFor(topic.id) === root.id).sort((a: AnyRecord,b: AnyRecord) => a.name.localeCompare(b.name)); const tones = colourFamily(colours.get(root.id)!, children.length); childrenByRoot.set(root.id, children.map((child: AnyRecord,index: number) => ({ ...child, colour: tones[index] }))); }
  const total = analyses.reduce((sum: number,item: AnyRecord) => sum + Number(item.classifiedWordCount || 0), 0); const rootWords = new Map<string,number>(); const childWords = new Map<string,number>(); const episodeWords = new Map<string,Map<string,number>>();
  for (const passage of passages) { const rootId = rootFor(passage.primaryTopicId); const words = Number(passage.wordCount || 0); rootWords.set(rootId,(rootWords.get(rootId)||0)+words); if (byId.get(passage.primaryTopicId)?.parentTopicId) { childWords.set(passage.primaryTopicId,(childWords.get(passage.primaryTopicId)||0)+words); const episodes = episodeWords.get(passage.primaryTopicId)||new Map(); episodes.set(passage.episodeId,(episodes.get(passage.episodeId)||0)+words); episodeWords.set(passage.primaryTopicId,episodes); } }
  const episodeById = new Map<string,AnyRecord>((data.candidates || []).map((candidate: AnyRecord) => [String(candidate.episodeId),{ number:candidate.episodeNumber,title:candidate.episodeTitle,href:candidate.episodeHref }]));
  return roots.map((root: AnyRecord) => ({ ...root, colour: colours.get(root.id), words: rootWords.get(root.id)||0, share: total ? (rootWords.get(root.id)||0)/total : 0,
    children: (childrenByRoot.get(root.id)||[]).map((child: AnyRecord) => ({ ...child, words: childWords.get(child.id)||0, share: (rootWords.get(root.id)||0) ? (childWords.get(child.id)||0)/(rootWords.get(root.id)||0) : 0,
      episodes: [...(episodeWords.get(child.id)||new Map<string,number>()).entries()].map(([id,words]) => ({ id,words,...(episodeById.get(id)||{}) })).sort((a,b) => Number(b.words)-Number(a.words)) })).filter((child: AnyRecord) => child.words).sort((a: AnyRecord,b: AnyRecord) => b.words-a.words) })).filter((root: AnyRecord) => root.words).sort((a: AnyRecord,b: AnyRecord) => b.words-a.words);
}

export function buildKnowledgeModel(data: AnyRecord) {
  const candidates = data.candidates || []; const contributors = data.contributors || []; const knowledge = data.knowledge || { nodes:[],edges:[],snackLinks:[] };
  const episodes = [...new Map(candidates.map((item: AnyRecord) => [item.episodeId,{ id:item.episodeId,number:item.episodeNumber,title:item.episodeTitle,href:item.episodeHref }])).values()] as AnyRecord[];
  const episodeById = new Map(episodes.map((episode) => [episode.id,episode]));
  const nodes: AnyRecord[] = [
    { id:'root:intelligence-snacks',kind:'root',title:'Intelligence Snacks',summary:'The people, episodes and ideas developed across the archive.',href:'/graph/',episodeId:'' },
    ...episodes.map((episode) => ({ id:`episode:${episode.id}`,kind:'episode',title:`Episode ${episode.number} · ${episode.title}`,summary:episode.title,href:episode.href,episodeId:episode.id,episodeNumber:episode.number })),
    ...contributors.map((person: AnyRecord) => ({ id:`contributor:${person.contributorId}`,kind:/host/i.test(person.role)?'host':'contributor',title:person.name,summary:person.shortBio||person.role,href:person.href,episodeId:'' })),
    ...candidates.map((snack: AnyRecord) => ({ id:`snack:${snack.candidateId}`,kind:'snack',title:snack.title,summary:snack.standfirst,href:snack.href,episodeId:snack.episodeId,episodeNumber:snack.episodeNumber })),
    ...(knowledge.nodes||[]).map((node: AnyRecord) => ({ id:`knowledge:${node.id}`,kind:node.kind,title:node.title,summary:node.summary,evidence:node.evidence||[],episode:episodeById.get(node.episodeId),href:episodeById.get(node.episodeId)?.href,episodeId:node.episodeId,episodeNumber:episodeById.get(node.episodeId)?.number })),
  ];
  const ids = new Set(nodes.map((node) => node.id)); const links: AnyRecord[] = [];
  for (const episode of episodes) links.push({ source:'root:intelligence-snacks',target:`episode:${episode.id}`,type:'contains' });
  for (const snack of candidates) links.push({ source:`episode:${snack.episodeId}`,target:`snack:${snack.candidateId}`,type:'publishes' });
  for (const person of contributors) { links.push({ source:'root:intelligence-snacks',target:`contributor:${person.contributorId}`,type:/host/i.test(person.role)?'hosted by':'features' }); for (const episodeId of person.episodeIds||[]) links.push({ source:`contributor:${person.contributorId}`,target:`episode:${episodeId}`,type:/host/i.test(person.role)?'hosted':'contributed to' }); }
  const normalise = (value: unknown) => String(value||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const contributorBySpeaker = new Map<string,string>(); for (const person of contributors) for (const label of [person.name,...(person.aliases||[])]) if(normalise(label)) contributorBySpeaker.set(normalise(label),person.contributorId);
  for (const node of knowledge.nodes||[]) { links.push({ source:`episode:${node.episodeId}`,target:`knowledge:${node.id}`,type:'develops' }); for (const speaker of new Set((node.evidence||[]).map((item:AnyRecord)=>normalise(item.speaker)).filter(Boolean))) { const personId=contributorBySpeaker.get(String(speaker)); if(personId)links.push({source:`contributor:${personId}`,target:`knowledge:${node.id}`,type:'contributed'}); } }
  for (const edge of knowledge.edges||[]) links.push({ source:`knowledge:${edge.sourceNodeId}`,target:`knowledge:${edge.targetNodeId}`,type:edge.relationshipType,note:edge.explanation });
  for (const link of knowledge.snackLinks||[]) links.push({ source:`knowledge:${link.knowledgeNodeId}`,target:`snack:${link.candidateId}`,type:link.relationshipType });
  for (const relationship of data.relationships||[]) links.push({ source:`snack:${relationship.sourceCandidateId}`,target:`snack:${relationship.targetCandidateId}`,type:relationship.relationshipType,note:relationship.explanation });
  const publicLinks = links.filter((link) => ids.has(link.source)&&ids.has(link.target)); const degree = new Map<string,number>(); for (const link of publicLinks) { degree.set(link.source,(degree.get(link.source)||0)+1); degree.set(link.target,(degree.get(link.target)||0)+1); }
  return { nodes: nodes.map((node) => ({ ...node, degree:degree.get(node.id)||0 })), links:publicLinks };
}
