import { test, expect } from 'bun:test';
import { knowledgeSearch } from '../server/knowledge-search';
import { researchData } from '../src/lib/agent-knowledge';
const corpus = researchData();
const request = (query: string, method = 'GET') => knowledgeSearch(new Request(`http://localhost/api/knowledge/v1/search?${query}`, { method }), corpus);
test('evidence search returns bounded real records with provenance', async () => {
 const response = request('q=human%20attention&limit=3');
 const body = await response.json();
 expect(body.results.length).toBe(3);
 expect(body.contentRevision).toBe(corpus.contentRevision);
 for (const result of body.results) {
  const original = corpus.observations.find(node => node.id === result.id)!;
  expect(result.recordUrl).toBe(original.recordUrl);
  for (const evidence of result.evidence) {
   expect(original.evidence.some(e => e.id === evidence.id && e.sourceUrl === evidence.sourceUrl)).toBe(true);
   expect(evidence.excerpt.length).toBeLessThanOrEqual(900);
  }
 }
});
test('validates inputs and handles empty results, HEAD and text', async () => {
 for (const query of ['', 'q=x&limit=11', 'q=x&limit=1.5', 'q=x&format=html', `q=${'x'.repeat(301)}`]) expect(request(query).status).toBe(400);
 expect(request('q=x', 'POST').status).toBe(405);
 expect((await request('q=zzzxxyyqq').json()).results).toEqual([]);
 expect(await request('q=attention', 'HEAD').text()).toBe('');
 const response = request('q=attention&format=text');
 expect(response.headers.get('content-type')).toContain('text/plain');
 expect(await response.text()).toContain('Source: https://intelligencesnacks.com/');
});
test('filters do not invent speaker attribution', async () => {
 const sample = corpus.observations.find(n => n.evidence.some(e => e.speaker))!;
 const speaker = sample.evidence.find(e => e.speaker)!.speaker!;
 const body = await request(`q=${encodeURIComponent(sample.title)}&episode=${sample.episode.number}&speaker=${encodeURIComponent(speaker)}`).json();
 expect(body.results.some((r: any) => r.id === sample.id)).toBe(true);
 for (const r of body.results) {
  expect(r.episode.number).toBe(sample.episode.number);
  expect(corpus.observations.find(n => n.id === r.id)!.evidence.some(e => e.speaker === speaker)).toBe(true);
 }
});
