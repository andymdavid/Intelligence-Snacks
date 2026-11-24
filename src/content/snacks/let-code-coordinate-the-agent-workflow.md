---
title: "Let code coordinate the agent workflow"
editorialTitle: "Let code coordinate the agent workflow"
thumbnail: "/images/snacks/let-code-coordinate-the-agent-workflow.webp"
standfirst: "Pete uses agents to explore a task, then puts the repeatable work into a pipeline run by code."
status: published
studioCandidateId: dc85cb49-b047-4b97-a641-6d924d2e79b1
studioRevisionId: dfa15555-f0d9-479d-9922-8d214cc61bce
sourceEpisode: episode-057
episodePosition: 4
theme: software-systems
attribution: "Developed from a conversation between Pete Winn, Mark Suman and Andy David"
relationships: []
featured: false
fixture: false
---

Pete found that getting an agent to do a job once was easier than getting it to do the same job reliably. It could explore, work something out and produce an impressive result, then take a different path next time. In Wingman, his approach is to use that exploratory session to help define a pipeline for repeating the work. The pipeline spells out the steps instead of leaving the whole sequence for an agent to choose each time.

Code runs those steps, calling an agent when it needs a decision or a transformation. The agent gets context for that particular task, returns its response and leaves the next step to the surrounding software. A script that simply needs to run can execute directly. Pete sees little reason to put several instructions to run scripts inside an agent's skill file when the computer could do that work before the agent starts.

He describes the same division around database operations. The agent can produce an object containing data, while a later script posts it and handles retries. That creates a place to check whether the output meets the workflow's requirements before taking it forward. Pete presents this as a way to narrow the agent's freedom, while acknowledging that an agent with broad tools could still send information out during its own step.
