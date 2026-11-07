import { test, expect } from 'bun:test';
import { parseTranscript,evidenceTurnIndex } from './transcript';

test('retains fractional timestamps and continuation paragraphs', () => {
  expect(parseTranscript('Pete (00:01.334)\nFirst paragraph.\n\nContinues here.\n\nAndy (01:02:03.45)\nReply.')).toEqual([
    {speaker:'Pete',timestamp:'00:01.334',text:'First paragraph. Continues here.'},
    {speaker:'Andy',timestamp:'01:02:03.45',text:'Reply.'},
  ]);
});
test('reads previously published bracketed timestamps and whole seconds', () => {
  expect(parseTranscript('[00:00:01.463] Pete Winn:\nHello.\n\nAndy David (00:12)\nGood morning.')).toEqual([
    {speaker:'Pete Winn',timestamp:'00:00:01.463',text:'Hello.'},
    {speaker:'Andy David',timestamp:'00:12',text:'Good morning.'},
  ]);
});

test('inline published turns preserve text and evidence resolves through fragmented headers',()=>{
 const turns=parseTranscript('[17:38] Pete: I mean, we often talk about how you want to impart more knowledge into agents and stuff. And we use graphs.\n\n[18:45] Andy: Another thought.');
 expect(turns).toHaveLength(2);expect(turns[0]!.text).toContain('And we use graphs.');
 expect(evidenceTurnIndex(turns,{speaker:'Pete',excerpt:'Pete\n17:38\nI mean, we often talk about how you want to impart more knowledge into agents and stuff.\n\nPete\n17:45\nAnd we use graphs.'})).toBe(0);
 expect(evidenceTurnIndex(turns,{excerpt:'This is not present anywhere in the source.'})).toBe(-1);
 expect(evidenceTurnIndex([...turns,...turns],{excerpt:turns[0]!.text})).toBe(-1);
});

test('reads colon-free legacy bracket headers and locates only unique long interior passages',()=>{
 const phrase='This long distinctive explanation describes capabilities that attach through standard input and standard output as separate processes.';
 const turns=parseTranscript(`[00:20:42] Pete\nAn edited opening. ${phrase}\n\n[00:21:10] Andy\nA separate response.`);
 expect(turns).toHaveLength(2);expect(turns[0]!.speaker).toBe('Pete');
 expect(evidenceTurnIndex(turns,{excerpt:`An original opening with several filler words that differ from the edited publication. ${phrase}`})).toBe(0);
 expect(evidenceTurnIndex([...turns,...turns],{excerpt:`Different opening. ${phrase}`})).toBe(-1);
});
