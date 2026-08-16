---
title: "Don’t Make the Agent Run Every Step"
editorialTitle: "Redesigning Agent Workflows Around Deterministic Code"
thumbnail: "/images/snacks/dont-make-the-agent-run-every-step.webp"
standfirst: "AI automation becomes more efficient when deterministic operations stay in code and agents appear only where the work requires judgement."
status: published
sourceEpisode: episode-067
episodePosition: 7
theme: agents
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
transcriptStart: "00:12:59"
relationships: []
featured: false
fixture: false
seo:
  title: "Don’t Make the Agent Run Every Step"
  description: "AI automation becomes more efficient when deterministic operations stay in code and agents appear only where the work requires judgement."
---

Andy’s first version of Pliny, his off-social-media newspaper for reading Twitter, ran as a series of agent-driven pipelines. Each run took roughly 15 to 20 minutes. That was manageable while building the tool, but not for something intended to run three, four or five times a day.

The problem was not simply that the agent was slow. Too much of the pipeline lived inside the agent runtime, including routine script execution that did not require interpretation. Pete saw the same pattern in OpenClaw setups that broke after about a month. Agents repeatedly ran scripts inside their context windows until the accumulated machinery became confused and behaved unpredictably.

Andy’s answer was to re-engineer Pliny around a sharper division of labour. Fixed, repeatable operations could run as deterministic code, while the agent entered only at the points that genuinely needed intelligence. Adding agents to an existing process is therefore not just a matter of automating each current step. The process itself may need to change, with ordinary scripts carrying the predictable workload and context windows reserved for judgement.
