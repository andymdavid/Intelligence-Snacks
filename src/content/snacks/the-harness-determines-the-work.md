---
title: An Agent Harness Controls Context, Tools and Feedback
editorialTitle: Context, Tools and Feedback
thumbnail: /images/snacks/agent-harness-context-tools-feedback-v2.webp
standfirst: A coding harness controls which files an agent can inspect, which commands it can run and which results return to the model.
status: published
publishedAt: 2026-08-05T00:00:00Z
updatedAt: 2026-08-06T00:00:00Z
sourceEpisode: episode-064
theme: agents
attribution: Developed from a conversation between Andy David, Pete Winn and dpc
relationships:
  - target: coding-models-have-working-personalities
    type: overlaps
    note: Harness controls meet persistent behavioural tendencies in the underlying model.
  - target: generation-is-easier-than-steering
    type: develops
    note: The harness supplies much of the feedback required to steer longer runs.
fixture: false
---

A coding model becomes useful as an agent when its runtime allows it to inspect files, run commands, modify a project and respond to the output. The model supplies reasoning and generation, and the harness decides which repository files enter the prompt, which tools are available and how each command shapes the next model call.

The harness described in Episode 64 treats each tool as a separate process that communicates through a lightweight protocol. A shell, virtual machine or remote host appears to the agent through the same interface, so an SSH command prefix can move an extension onto another machine and preserve the same tool call. An event log gives every tool and extension a shared record of prompts, commands and responses.

This design keeps the harness inspectable and adaptable by exposing its prompts and tool calls. Specifications, repository instructions and design records can steer the model, and its trained habits shape how it interprets them. The harness controls the execution environment and the feedback returned after each command, leaving architectural and product judgement with the developer directing the agent.
