---
title: "The bandwidth limit on local AI"
editorialTitle: "Why local inference needs bandwidth as well as memory capacity"
thumbnail: "/images/snacks/the-bandwidth-limit-on-local-ai.webp"
standfirst: "A model may fit in a local AI machine yet still respond slowly if its memory cannot supply data quickly enough."
status: published
sourceEpisode: episode-067
episodePosition: 3
theme: ai-models-infrastructure
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
transcriptStart: "00:46:16"
relationships: []
featured: false
fixture: false
seo:
  title: "The bandwidth limit on local AI"
  description: "A model may fit in a local AI machine yet still respond slowly if its memory cannot supply data quickly enough."
---

VRAM capacity determines whether a model can run, but it does not determine how quickly the model will answer. Memory bandwidth governs how much data can move through the machine, making it a separate constraint on local inference rather than a detail that more capacity automatically solves.

Anthony pointed to Nvidia’s DGX Spark as an example of the imbalance. He described its memory bandwidth as weak relative to its available compute, which limits decode speed. Decode is the stage users experience as the rate at which a model produces its response, usually measured in tokens per second. A machine can therefore have substantial processing power while still generating text too slowly to be attractive.

Higher-capacity hardware does not make the trade-off disappear. Anthony said an RTX 6000 professional card with 96 GB of memory now cost more than $20,000, while even that much VRAM could not hold the largest models under discussion. Choosing hardware for local AI therefore requires two checks. The model must fit in memory, and that memory must be fast enough to feed the model during decode.
