---
title: "Don’t Make the Agent Run Every Step"
editorialTitle: "Redesigning Agent Workflows Around Deterministic Code"
thumbnail: "/images/snacks/dont-make-the-agent-run-every-step.webp"
standfirst: "AI automation works more cleanly when routine operations stay in code and agents enter only where the work calls for judgment."
status: published
sourceEpisode: episode-067
theme: agents
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
transcriptStart: "00:12:59"
relationships: []
featured: false
fixture: false
---

Putting an agent into an existing process can leave the shape of the work untouched, even though that shape may be poorly suited to the agent. In one early pipeline, the agent kept running scripts as part of its own work, carrying routine operations through a context window that didn’t need to contain them.

In Andy's example of building Pliny, his initial design had a visible cost where pipeline runs took roughly 15 to 20 minutes which came from asking the agent to repeatedly supervise what could otherwise have been a series of deterministic steps, so time and context were being spent on tasks that could already have been executed as ordinary scripts.

A more deliberate design was implemented by separating those predictable steps from the moments that require genuine intervention and guidance from the agent. Those parts could be codified, while the agent appears at the specific decision points where judgment is useful. That division requires changing the workflow rather than simply inserting an agent into every stage, but it also gives each part a clearer job and starts to optimise both for outcome and token efficiency.
