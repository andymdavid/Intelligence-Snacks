---
title: "Put the Workflow in Code"
editorialTitle: "Code-first pipelines make recurring agent work predictable"
thumbnail: "/images/snacks/put-the-workflow-in-code.webp"
standfirst: "A pipeline can contain agent judgement without surrendering control of the wider process to an open-ended agent loop."
status: published
sourceEpisode: episode-065
episodePosition: 4
theme: software-systems
attribution: "Developed from a conversation between Andy David and Pete Winn"
relationships: []
featured: false
fixture: false
---

Wingman pipelines turn a process into a code-first workflow that can be started manually or run on a daily, weekly or other set cadence. Once a useful piece of work has been completed and understood, it can be reverse engineered into a pipeline instead of being prompted from scratch each time. Agents can still handle the parts that require judgement, while code controls how the recurring job progresses.

Each agent receives only the information needed for its particular decision. It starts, makes that decision or performs the bounded task, then shuts down so deterministic code can move the workflow to its next step. This differs from a skill that operates inside an agent runtime, where the result depends on the agent following the instructions. In a pipeline, the code runs directly and the agent is contained within the sequence.

That structure takes more work upfront than a skill or loosely directed agent loop because the process must first be understood and encoded. The payoff is consistency across repeated runs, which matters in businesses built around dependable processes. Rather than letting agents improvise an entire operation, the pipeline reserves intelligence for the points that need it and keeps everything else deterministic.
