---
title: "Jev Gives AI Drafts a Separate Editor"
editorialTitle: "Using Jev as a confidence-scored style reviewer"
thumbnail: "/images/snacks/jev-gives-ai-drafts-a-separate-editor.webp"
standfirst: "A separate review model could identify unwanted writing habits after a draft is complete, allowing the drafting model to concentrate on producing good writing rather than following an extensive list of style rules."
status: published
sourceEpisode: episode-075
episodePosition: 7
theme: agents
attribution: "Developed from a conversation between Pete Winn and Andy David"
relationships: []
featured: false
fixture: false
---

Andy found that adding more style rules to his Intelligence Snacks pipeline could make its writing worse. The rules addressed real habits, including needless abstraction, unnecessary signposting and generic language where the transcript supplied concrete detail. Yet asking the drafting model to obey every instruction at once left the prose stale. A relatively unconstrained ChatGPT draft could sometimes read better, even though it reintroduced some of those familiar faults.

His experiment moves those judgements into a second stage using Jev, a decision model developed by TypeSafe AI that makes fast, structured judgements rather than generating text. After a draft exists, Jev answers predetermined questions such as whether a passage contains superfluous language, abstraction or signposting. Each yes-or-no decision comes with a confidence score. This gives the drafting model specific problems to address instead of asking it to generate prose while simultaneously following every style rule.

The confidence score also helps inform how extensively a passage needs editing. A strong signal across a passage may justify a broader rewrite, while a local problem might require changing only two words. The drafting model is no longer solely responsible for reviewing its own work. It receives a separate set of editorial judgements, which it can use to revise the draft.
