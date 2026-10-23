---
title: "Decision Models Could Make Coding Agents Cheaper"
editorialTitle: "Split Coding Agent Work Between Frontier and Decision Models"
thumbnail: "/images/snacks/decision-models-could-make-coding-agents-cheaper.webp"
standfirst: "Agent harnesses could reserve frontier models for substantive reasoning while cheaper decision models handle routine navigation, routing and tool selection."
status: published
sourceEpisode: episode-073
episodePosition: 5
theme: ai-coding
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "46:30.076"
relationships: []
featured: false
fixture: false
---

Coding agents spend much of their time navigating a repository rather than writing code. They list files, open one, inspect the result and choose the next tool. Each narrow choice can trigger another model completion carrying the conversation, system prompt and accumulated context. Prompt caching may soften that cost, but deciding which file to open still doesn't require the same capability as designing or reviewing a code change.

An agent harness could split those jobs. A fast decision model such as Jev could select tools, route outputs and rank the next action with a confidence score, while the frontier model handles architecture, difficult reasoning and code generation. Because the decision layer is built for structured classification rather than conversation, it can return predictable JSON quickly and at negligible cost compared with repeatedly asking a frontier model to manage every step.

Code graphs could sharpen the division further. A graph can map relationships across a repository, trace the impact of a front-end function and identify the code relevant to a proposed change. The decision model could navigate that structure and assemble a focused context packet before the frontier model begins its substantive work. Instead of paying for broad intelligence to rediscover the repository on every tool call, the harness would apply it only after cheaper components have found the right files and context.
