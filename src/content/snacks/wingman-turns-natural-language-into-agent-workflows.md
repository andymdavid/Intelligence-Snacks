---
title: "Wingman Turns Natural Language Into Agent Workflows"
editorialTitle: "Wingman Alternates Agent Sessions With Deterministic Code"
thumbnail: "/images/snacks/wingman-turns-natural-language-into-agent-workflows.webp"
standfirst: "Pete built Wingman to turn a plain-language description of a process into an editable pipeline of code, specialised agents and loops."
status: published
sourceEpisode: episode-062
episodePosition: 7
theme: agents
attribution: "Developed from a conversation between Pete Winn, Yo and Andy David"
relationships: []
featured: false
fixture: false
---

Rather than handing an entire job to one AI agent, Wingman places focused agent sessions inside a larger declarative workflow. Each agent receives a specific task and produces an output for the next stage, while ordinary code handles operations such as processing data, discarding unwanted material and gathering inputs from other sources.

Pete can describe the workflow in natural language, including the sequence of steps and where agents should take over. Wingman then builds a declarative pipeline that can run that sequence. A workflow might start with code that prepares data, pass the result to an agent with a defined assignment, return to code for further processing, invoke another agent and repeat part of the sequence in a loop.

The generated pipeline remains editable, so the workflow can be refined as it runs instead of being trapped inside a single prompt. Pete described this as one of Wingman's most powerful features, although the wider project was still being prepared for other users. Its five applications, graph memory, PostgreSQL backups and deployment tooling still needed clearer documentation and some remaining connections between components.
