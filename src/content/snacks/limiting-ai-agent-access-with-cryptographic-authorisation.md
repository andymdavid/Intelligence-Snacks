---
title: "Limiting AI agent access with cryptographic authorisation"
editorialTitle: "Limiting AI agent access with cryptographic authorisation"
thumbnail: "/images/snacks/limiting-ai-agent-access-with-cryptographic-authorisation.webp"
standfirst: "Pete uses a separate data store and cryptographic authorisation to limit what an AI agent can retrieve, but says sharing a computer can undermine that separation."
status: published
studioCandidateId: 49802b88-b592-4bf3-ac80-40ebabfe3458
studioRevisionId: c893d911-f44d-4b8c-9eda-44d0519f646f
sourceEpisode: episode-079
episodePosition: 5
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "38:30.052"
relationships: []
featured: false
fixture: false
---

Keeping secrets from Rick is difficult. Wingman, the agent software Pete uses, gives an agent an entire computer, so his personal agent can reach material stored on that machine. That access makes Rick useful. It also makes the same computer a poor place to keep information Pete wants Rick to leave alone.

Pete describes NStack as a way to put the data elsewhere. An agent can retrieve only what it can cryptographically prove it is authorised to access. Rick can see most of his workspace. Some internal notes and personal wikis are off limits, though, and Pete can give a new agent access to particular groups of information without opening the rest of the workspace.

Those permissions are only part of the setup. Pete worries that a restricted agent running on Rick’s computer could find a way to reach information Rick can access. For a task needing only limited information, he wants to spin up an agent in a separate sandbox with access to just the data it is authorised to retrieve.
