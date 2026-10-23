---
title: "Decision Models Keep Software Workflows Deterministic"
editorialTitle: "Localized Decision Models in Deterministic Software Workflows"
thumbnail: "/images/snacks/decision-models-keep-software-workflows-deterministic.webp"
standfirst: "Fast, structured model judgements can handle uncertain decision points while ordinary code remains in control of the wider automation."
status: published
sourceEpisode: episode-073
episodePosition: 3
theme: software-systems
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "12:27.249"
relationships: []
featured: false
fixture: false
---

Most automated workflows don't need an agent reasoning at every step. Code can still handle the predictable work, then call a decision model such as Jev when an input needs to be classified, prioritised or routed. This gives uncertainty a defined place in the workflow instead of turning the entire process into an open-ended agent loop.

The boundary works because Jev returns JSON in a known shape, allowing the next program step to consume its answer like any other structured result. Pete contrasted decisions delivered in milliseconds with agent runs that can take from 30 seconds to two minutes when several judgements are chained together. That speed makes richer routing practical without slowing the useful work that follows.

The model layer can also return confidence scores, giving the software an explicit threshold for escalation. A high-confidence result can continue through code, while a lower-confidence case can be sent to a person. Generative models still have a role in open-ended research, text and translation, but narrow decision models can keep repeated automation faster, cheaper and more deterministic.
