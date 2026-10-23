---
title: "Compression Cuts AI Agent Context Costs"
editorialTitle: "Tool-output compression cuts AI agent context costs"
thumbnail: "/images/snacks/compression-cuts-ai-agent-context-costs.webp"
standfirst: "Filtering repetitive tool output before it reaches an AI agent can cut token use while preserving the context that matters."
status: published
sourceEpisode: episode-061
episodePosition: 5
theme: ai-models-infrastructure
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "43:51"
relationships: []
featured: false
fixture: false
---

AI agent harnesses can repeatedly load raw tool results into their context windows, even when most of the material adds nothing useful. Logs are a clear example. An agent may need a handful of errors, but a tool can return thousands of routine lines saying the service is still running. Every irrelevant line then remains in context as the agent continues its work.

Pete highlighted Headroom, a Netflix release designed to reduce token use in coding harnesses such as Claude Code. It uses a statistical model to strip noise from common tool responses and local models trained specifically to compress tool-call context. A log read that might otherwise occupy roughly 400,000 lines can be reduced to about four lines containing the information the agent actually needs.

That reduction matters beyond the immediate API bill. Smaller inputs can make local and open-source models more practical because they often have tighter context limits and run on less powerful hardware than frontier systems. Removing repeated status messages gives those models less irrelevant material to process and can improve their answers. The useful engineering decision happens before inference by deciding which tool output deserves a place in the context window.
