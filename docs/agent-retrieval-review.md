# Retrieval and pilot editorial review — 10 November 2026

The pilot is useful as a source-led archive entry point. The first measured problem is retrieval: the original example client gives question words and substring matches too much influence. Revised whole-word matching, common-word removal, light plural normalisation and inverse document-frequency weighting improve coverage on the prepared questions. This remains lexical search.

## Reproducible retrieval run

Run `bun run agent:evaluate` against the public site, or pass a local base URL. `agent-retrieval-results.json` records the exact question set, run time, public content revision, scores, IDs and record URLs. The original ranking is retained in the evaluator as a baseline.

| Retrieval configuration | Questions with a labelled top-five hit | Labelled hits across 60 slots |
| --- | --- | --- |
| Original client, themes and observations | 9/12 | 13 |
| Revised client, themes and observations | 11/12 | 22 |
| Revised client, observations only | 7/12 | 12 |

Labels come from the starting themes prepared before this run and their member observations. This is a coverage proxy with incomplete labels, not precision, answer accuracy, independent human review or AI-search visibility. Observations-only is an ablation of theme access, not a simulation of a web search engine or the site's ordinary archive search. The same questions still need a separate ordinary-search and answer-generation comparison.

Persistent context and human review both move from zero labelled results to two. Bounded authority moves from zero to four. The code/interface question drops from four to two. The model-intelligence question drops from one to zero, although its revised first result, “Can a system become too intelligent to be useful?”, appears relevant outside the starting-theme membership. Do not tune the implementation to these theme IDs or treat every unlabelled result as irrelevant. Expand independent judgements and add held-out paraphrases before claiming a general search improvement.

## Pilot editorial assessment

Reviewed all ten reading-note paragraphs across the five guides, their observation references, and a sample of the underlying excerpts. This is an agent editorial spot check, not independent factual verification or a fresh exhaustive transcript review.

- **Graph memory:** the contrast between news memory, conversation memory and operational routes is useful. The guide explicitly distinguishes developer learning from agent context. A future question-led briefing should explain what actually carries between sessions using those source distinctions.
- **Persistent agent work:** the distinction between persistent state and continuing compute is the clearest answer in the pilot. Keep the persistent-computer alternative and the disposable-worker approach separate; neither is a measured supplier comparison.
- **Code-first workflows:** the exploration-to-repeatable-code distinction is useful. The guide does not fully answer the evaluation question about graphical interfaces: mature-tool reuse and computer-use evidence are also needed. Add a separate comparison rather than stretching this guide's scope.
- **Human review:** inspectable intermediate products and work-specific checkpoints provide concrete distinctions. Preserve the difference between forensic spreadsheet review and short visual-edit feedback.
- **Shared work layers:** the records-versus-runtime distinction is useful, but the material is heavily about the hosts' own architecture. Keep attribution clear and avoid presenting that proposal as independently validated interoperability.

The reading notes are brief relative to the large source lists (especially code-first). Expansion should add useful question-led synthesis and direct source attribution rather than duplicate the existing summaries. Some raw evidence has a null structured speaker even where a transcript excerpt includes a speaker label; do not fill this by guessing. This remains an attribution-quality follow-up.

## Next editorial batch

Prioritise three question-led briefings for evidence review:

1. **What limits how many agents one person can supervise?** Combine attention-bottleneck and protecting-attention evidence. Distinguish personal examples from measured capacity claims.
2. **How can an agent's authority be bounded?** Compare bounded-authority, cryptographic-authority and agent-accountability proposals. Preserve deployment context; do not imply security guarantees from discussion alone.
3. **When should an agent use code, an existing tool or a graphical interface?** Extend beyond code-first with mature-tool-reuse and computer-use observations. Attribute tradeoffs to the relevant speakers.

Do not automatically publish all 42 remaining themes. Keep the existing five guides while drafting this focused batch.

## Unmeasured outcomes

No external platform answer baseline, indexing, AI citation lift, referral lift or subscription lift was measured. Authorised Search Console/Bing/analytics access is still required for account-based measurements. Unit and browser checks verify implementation, not editorial truth or search visibility.
