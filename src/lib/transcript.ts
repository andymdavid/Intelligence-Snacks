export function parseTranscript(source: string) {
  const headers = [...source.matchAll(/^(?:(.+?) \((\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\)|\[(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\] (.+?)(?::|$))[ \t]*/gm)];
  return headers.map((header, index) => ({
    speaker: (header[1] || header[4])!.trim(),
    timestamp: (header[2] || header[3])!,
    text: source.slice(header.index! + header[0].length, headers[index + 1]?.index ?? source.length).trim().replace(/\s*\n\s*/g, ' '),
  }));
}

// Extracted evidence can repeat speaker/timestamp headers between short lines.
// Match only a unique textual passage, rather than inventing a timestamp.
export function evidenceTurnIndex(turns: ReturnType<typeof parseTranscript>, evidence:{excerpt:string;speaker?:string|null}) {
 const normalise=(text:string)=>text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const speakers=new Set([...turns.map(turn=>normalise(turn.speaker)),normalise(evidence.speaker||'')]);
 const cleaned=evidence.excerpt
  .replace(/^\s*\[[\d:.]+\]\s*[^:\n]+:[ \t]*/gm,'')
  .replace(/^\s*\[[\d:.]+\]\s*[^\n]+\n/gm,'')
  .replace(/^[^()\n]+ \([\d:.]+\)[ \t]*\n?/gm,'')
  .split('\n').filter(line=>!/^\s*\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?\s*$/.test(line)&&!speakers.has(normalise(line))).join(' ');
 const excerpt=normalise(cleaned).slice(0,120);if(excerpt.length<24)return -1;
 const texts=turns.map(turn=>normalise(turn.text));
 const matches=texts.map((text,index)=>text.includes(excerpt)?index:-1).filter(index=>index>=0);
 if(matches.length)return matches.length===1?matches[0]!:-1;
 // A lightly edited published transcript may retain a unique interior passage
 // rather than the excerpt opening. Require a long exact match, never a fuzzy guess.
 const full=normalise(cleaned),windows:string[]=[];for(let start=0;start+100<=full.length;start+=25)windows.push(full.slice(start,start+100));
 const interior=texts.map((text,index)=>windows.some(window=>text.includes(window))?index:-1).filter(index=>index>=0);
 return interior.length===1?interior[0]!:-1;
}
