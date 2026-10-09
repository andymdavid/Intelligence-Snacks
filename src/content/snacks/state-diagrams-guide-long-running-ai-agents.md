---
title: "State Diagrams Guide Long-Running AI Agents"
editorialTitle: "Long-running AI agents need visible state checkpoints"
thumbnail: "/images/snacks/state-diagrams-guide-long-running-ai-agents.webp"
standfirst: "A visual comparison of how a system works today and how it should work after a change could help people direct AI agents working on longer tasks."
status: published
sourceEpisode: episode-075
episodePosition: 6
theme: ai-coding
attribution: "Developed from a conversation between Pete Winn and Andy David"
relationships: []
featured: false
fixture: false
---

Long-running AI agents create a particular risk. An agent can spend more time on a task and still return a weaker result because there are fewer opportunities for human feedback along the way. Implementation often reveals decisions that couldn't sensibly be made at the outset, so intelligence alone can't replace timely direction from the person responsible for those choices.

Pete is experimenting with editable flow diagrams to make that direction easier to provide. One diagram records how the current system works, including its components, actions, links and state changes. A second shows how the system should work after the change. Because both are represented as JSON, the agent can compare them directly while Pete can inspect and adjust the diagrams.

That gives the agent a clearer picture of what it's supposed to build and gives Pete a way to check whether it has understood what he wants. Missing steps, unwanted fallback paths and incorrect links could be spotted and corrected before the agent starts implementing the changes. The approach is still an experiment, but Pete hopes it will make it easier to agree on what the finished system should do before committing to a lengthy implementation.
