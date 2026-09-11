---
title: "Use Agents Only for Uncertain Work"
editorialTitle: "Keeping the Process Outside the Agent"
thumbnail: "/images/snacks/use-agents-only-for-uncertain-work.webp"
standfirst: "Reliable AI workflows keep known operations in ordinary code and call an agent only when flexible judgement is genuinely useful."
status: published
sourceEpisode: episode-071
episodePosition: 2
theme: software-systems
attribution: "Developed from a conversation between Pete Winn, Paul Itoi and Andy David"
transcriptStart: "12:49.293"
relationships: []
featured: false
fixture: false
---

Treating the agent as the runtime gives it responsibility for deciding and executing every step. A better division puts the process outside the agent. The workflow specifies what happens and in what order, then brings in the agent for the particular step that needs interpretation. The agent becomes one component in a controlled process rather than the process itself.

Most of the surrounding work does not require a language model. A computer can count letters in a string directly. Once an agent has turned messy input into a spreadsheet or a structured schema, ordinary software can validate fields, apply formulas and move the data through subsequent steps. Asking a model to perform those settled operations only makes it rediscover the same procedure on every run.

This separation cuts both cost and uncertainty. Conventional computation is effectively free beside repeated model calls, and the same input can produce the same result every time. Checks can then concentrate at the boundaries where the agent receives ambiguous material and returns structured output. The flexible judgement remains available, while every operation after that boundary can be deterministic.
