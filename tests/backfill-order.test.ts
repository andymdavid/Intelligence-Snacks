import {test,expect} from 'bun:test';
import {episodesNewestFirst,snacksNewestEpisodeFirst} from '../src/lib/content';
const episodes=[{id:'old',data:{number:59}},{id:'new',data:{number:80}},{id:'middle',data:{number:79}}];
test('backfilled episodes stay behind higher episode numbers',()=>expect(episodesNewestFirst(episodes).map(e=>e.data.number)).toEqual([80,79,59]));
test('backfilled Snacks do not replace newer episode Snacks and keep editorial order',()=>{
 const snacks=[{id:'backfill',data:{sourceEpisode:{id:'old'},episodePosition:1}},{id:'new-second',data:{sourceEpisode:{id:'new'},episodePosition:2}},{id:'new-first',data:{sourceEpisode:{id:'new'},episodePosition:1}}];
 expect(snacksNewestEpisodeFirst(snacks,episodes).map(s=>s.id)).toEqual(['new-first','new-second','backfill']);
 expect(snacks[0]!.id).toBe('backfill');
});
