---
title: Long Agent Runs Depend on Reliable Feedback
thumbnail: /images/snacks/long-agent-runs-feedback-v2.webp
standfirst: Tests, specifications and human review determine how long a coding agent can keep producing useful software on its own.
status: published
publishedAt: 2026-08-05T00:00:00Z
updatedAt: 2026-08-06T00:00:00Z
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
    note: Usability and operational expectations require feedback beyond mechanical tests.
fixture: false
---

Coding agents can produce large amounts of software, so the useful length of an autonomous run depends on the signals available to keep the generated code aligned with its requirements. As generation becomes faster, the quality of those evaluation signals increasingly sets the limit.

Compilers, tests and stable APIs provide mechanical feedback that acts like a mould around a replacement implementation. Repeated checks can confirm that new internal code returns the same API responses and passes the same tests, giving an agent clear boundaries for a rewrite. Business applications are harder to steer because many requirements live in button placement, approval sequences, human workflows and expectations that have never been written down.

An application can preserve its data and become harder to use because a working button can appear in the wrong place or an approval flow can violate an unstated operational expectation. The agent receives no automatic signal that either mistake has occurred. Longer runs therefore need more requirements expressed through tests, specifications and other machine-readable constraints, with human review covering usability and operational knowledge.
