---
title: "Code-Directed Workflows Keep AI Agents on Track"
editorialTitle: "Code-Directed Agent Workflows Limit Runtime Randomness and Drift"
thumbnail: "/images/snacks/code-directed-workflows-keep-ai-agents-on-track.webp"
standfirst: "Declarative pipelines reduce AI agent drift by fixing the path through functions, steps and data while leaving people responsible for direction and course correction."
status: published
sourceEpisode: episode-060
episodePosition: 1
theme: agents
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
relationships: []
featured: false
fixture: false
---

In Wingman, Pete built declarative pipelines from a selection of functions, ordered steps and data passed between them. A pipeline can be assembled at runtime, but once it starts, code controls how the work moves through its stages. The agent tackles the task inside those boundaries instead of repeatedly deciding what should happen next.

Pete contrasts that approach with systems where an agent drives every call from inside its own loop. Each runtime choice introduces a little more randomness. On a long, uninterrupted run, those small deviations can compound. His analogy is a driver heading south who leaves the motorway for a minor road. The broad direction still looks right, but the route has quietly become slower and less useful.

Structure reduces that drift, but it doesn't remove the need for human attention. Pete prefers giving an agent a small piece of work, ending that agent's run, carrying the useful context forward and having another agent check whether the work still follows the plan. If it doesn't, the reviewer can steer the next stage back towards the goal before another small detour becomes the route.
