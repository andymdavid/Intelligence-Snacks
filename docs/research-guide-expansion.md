# Research guide expansion and archive-search comparison — 10 November 2026

Publish three additional guides: attention-bottleneck, bounded-authority and mature-tool-reuse. All three use existing accepted theme memberships; no observations, evidence excerpts or relationships are rewritten. Each has three source-linked reading notes with named attribution, distinct contexts and explicit limits on the conclusions.

The supervision guide develops the first Flight Deck draft into a narrower published theme guide. The draft also discussed protecting-attention sources; those remain in that draft, rather than silently adding unreviewed memberships to the supervision theme. The tool-reuse guide distinguishes Andy's immediate experience from Pete's expectation that demonstrated routes can later become software, and points readers toward the existing code-first guide. The access-boundary guide distinguishes tools, information acquisition and machine-level reach. Cryptographic identity and legal accountability remain separate editorial topics, not security or legal guidance.

## Source-context review

Read the reviewed excerpts for all three themes and surrounding published transcript turns for the exact-locator sources. Reading notes rely on these resolved source passages:

- Attention: episode 53 turn 418 (Jarad), episode 60 turn 14 (Anthony), episode 79 turn 134 and its continuation (Andy).
- Bounded authority: episode 64 turn 64 (dpc), episode 69 turn 184 and the continuation of Pete's acquisition-versus-analysis proposal, episode 79 turns 122–124 (Pete).
- Tool reuse: episode 72 turns 105–108 (Andy/Pete) and 117–120 (Pete), episode 76 turns 84–86 (Andy).

Also inspected the episode 63 section around 01:02:29–01:03:55 and the episode 65 discussion of concurrent sessions. The episode 63 export identifies Kane as speaker, while the excerpt includes both Kane and Andy labels and the surrounding transcript assigns the substantive judgement/attention discussion to Andy. Do not present the entire multi-speaker excerpt as Kane's quotation. HTML and plain-text guide rendering now use a neutral multiple-speaker attribution when explicit speaker/timestamp headers identify multiple speakers. Exported original metadata and excerpts remain intact. Unlabelled excerpts are not assigned inferred speakers.

This is agent editorial review. It is not independent factual verification or human signoff.

## Actual ordinary-search comparison

`bun run agent:compare-archive` runs the browser UI at /search/ with all twelve prepared questions, then with separately declared editorial keyword reformulations, and compares availability with the research client on the unchanged full questions. The committed JSON records query strings, top-five URLs, run time, archive-index hash and public research revision.

On the pre-expansion live site:

| Query route | Questions with any result |
| --- | --- |
| Ordinary archive search, full question | 0/12 |
| Ordinary archive search, editorial keywords | 12/12 |
| Research client, full question | 12/12 |

The ordinary interface requires every query term as a substring, including punctuation and question words. It is a keyword search rather than a question-answering interface. The keyword reformulations are manual, not equivalent inputs or automatic query expansion. Result availability does not measure answer quality, citation correctness or search-engine visibility. Prepared-theme coverage from the previous run is a separate metric.

Keyword search does expose useful material: “human review” finds Human Checkpoints and Who Checks the AI Reviewer; “code” finds code-directed workflows alongside unrelated software material; “agent context” finds human-context and canvas-thread material. Searchable source material already exists; the research interface adds direct observation/evidence access and grouped comparisons.

Guides were absent from the ordinary archive search index. This release includes published guides and their reading notes in that index, so the new entry points can be found by readers using site search. It does not change the existing AND-matching behaviour. A future search improvement should evaluate full-question handling and held-out queries without treating every nonempty result as a success.

## Publication and follow-up

All eight guides are included in the normal discovery routes, source-episode links, sitemap, llms.txt, plain-text routes and public records. The /ideas/ and agent documentation copy no longer hard-codes five guides. Automated checks cover source references, guide counts, multi-speaker attribution, exact anchors, mobile overflow and source/export parity.

Remaining work: generated-answer/citation evaluation using the ordinary-search and research routes; held-out relevance judgements; attribution cleanup in the source pipeline; and authorised Search Console/Bing/analytics measurement. No indexing, AI citations, referral lift or subscription lift is claimed.
