---
title: "Cloud agents can resume on fresh compute"
editorialTitle: "Cloud agents can resume on fresh compute"
thumbnail: "/images/snacks/cloud-agents-can-resume-on-fresh-compute.webp"
standfirst: "In Pete’s design, a cloud agent keeps its personality, data access and tools while releasing the compute between tasks."
status: published
studioCandidateId: 91c1a238-585b-4ff3-a848-49dac9379766
studioRevisionId: 75db6ad7-2a1b-4543-904c-52ccdbe1ccc1
sourceEpisode: episode-079
episodePosition: 4
theme: ai-models-infrastructure
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "28:53.048"
relationships: []
featured: false
fixture: false
---

Pete’s cloud agents don’t need a computer running between tasks. The personality stays, as do the data access and tools. NStack, the data platform behind the agents, holds the information needed to carry on, so the next runtime can pick up the work without keeping the previous one alive.

When a message arrives, the system finds an empty slot on a server and loads the agent’s workspace with the information it needs to continue. The task might take five minutes or an hour. Once the turn ends, the system reclaims the compute. Another message starts a fresh runtime with the context to continue the work.

Those slots come from a shared pool of servers, each able to run a limited number of agents at once. During a turn, an agent has its own sandbox and can browse the web, create software or publish results back to NStack. The output can outlast the runtime. Pete gives the example of a report. The agent builds it, and the user can open it later through Ambulando.
