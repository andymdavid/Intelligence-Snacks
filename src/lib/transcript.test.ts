import { test, expect } from 'bun:test';
import { parseTranscript } from './transcript';

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
