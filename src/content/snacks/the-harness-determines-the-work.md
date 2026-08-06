---
title: The Harness Determines What an AI Agent Can Become
editorialTitle: The Harness Determines the Work
standfirst: The model supplies reasoning and generation. The surrounding harness determines its context, tools, feedback and practical limits.
status: published
publishedAt: 2026-08-05T00:00:00Z
updatedAt: 2026-08-05T00:00:00Z
sourceEpisode: episode-064
primaryTopic: agents
relatedTopics:
  - ai-coding
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

A coding model becomes useful as an agent when the surrounding system allows it to inspect files, run commands, modify a project and continue working through the results. The model supplies reasoning and generation. The harness decides what context it receives, which tools it can use and how each action becomes part of the next step.

A minimal harness can treat every tool as a separate process. A shell, virtual machine or remote host communicates through a lightweight protocol and appears to the agent through the same interface. Adding an SSH command prefix can move an extension onto another machine without requiring the model to understand that anything changed. An event log can provide the common record through which tools and extensions observe the work.

This design makes the system easier to inspect and adapt than a large coding product whose prompts and internal workflows change behind the scenes. It also defines the limit of that control. Specifications, context files and design records can steer a model, though its trained habits still shape how it interprets them. The harness can constrain the environment and expose more of the mechanism. It cannot supply the accumulated judgement that the model does not possess.
