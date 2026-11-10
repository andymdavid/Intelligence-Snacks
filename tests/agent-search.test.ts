import { expect, test } from 'bun:test';
import { rankEntries } from '../public/agents/research.mjs';
const entry = (id: string, title: string, summary = '') => ({id,title,summary});
test('question words and substrings cannot outrank a direct subject match', () => {
 const results=rankEntries([entry('noise','How can an artisan do the work?'),entry('authority','Bounded authority and isolated work')],"How can an agent's authority be bounded?");
 expect(results[0].entry.id).toBe('authority');
 expect(rankEntries([entry('noise','artisan')],'art')).toEqual([]);
 expect(rankEntries([entry('noise','How can we do it?')],'how can we')).toEqual([]);
});
test('rare subject words outweigh ubiquitous vocabulary and plural variants match', () => {
 const results=rankEntries([entry('one','Agents agents agents'),entry('two','Agents at work'),entry('three','Cryptographic authority for an agent')],'agents authority');
 expect(results[0].entry.id).toBe('three');
});
test('ranking is deterministic, limited and handles punctuation', () => {
 expect(rankEntries([entry('b','Review'),entry('a','Review')],'review!',1).map((r: any)=>r.entry.id)).toEqual(['a']);
 expect(rankEntries([entry('a','Review')],'!!!')).toEqual([]);
});
