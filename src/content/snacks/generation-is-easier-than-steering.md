---
title: Generation Is Easier Than Steering
standfirst: The limiting factor in longer autonomous work is increasingly the quality of the feedback that determines whether generated software remains aligned.
status: review
publishedAt: 2026-08-05T00:00:00Z
updatedAt: 2026-08-05T00:00:00Z
sourceEpisode: episode-064
primaryTopic: agents
relatedTopics:
  - ai-coding
  - software-systems
attribution: Developed from a conversation between Andy David, Pete Winn and dpc
relationships:
  - target: the-harness-determines-the-work
    type: develops
    note: Harness design determines which steering signals reach the model.
  - target: software-is-discovered-through-use
    type: overlaps
    note: Important product behaviour often cannot be reduced to mechanical tests.
fixture: true
---

Coding agents can produce large amounts of software. Longer autonomous runs require a reliable way to determine whether the work remains aligned with the intended result. The limiting factor often appears in evaluation rather than generation.

Compilers, tests and stable APIs provide mechanical feedback. They act like a mould around a replacement implementation. The internal code can change while repeated checks confirm that the same external behaviour still fits. This makes a programming language or framework with an extensive test suite easier to rewrite than a business application whose important behaviour lives in buttons, approvals and human workflows.

A business system can preserve its data and still become harder to use. A button can work while appearing in the wrong place. An approval flow can satisfy its formal rules while violating an unstated operational expectation. The agent has no automatic signal that these results are wrong. Each additional period of autonomous work therefore depends on more of the desired behaviour being expressed through tests, specifications or other machine-readable constraints. Where those boundaries remain incomplete, human review supplies the steering.
