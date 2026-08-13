---
title: "The bandwidth limit on local AI"
editorialTitle: "Why local inference needs bandwidth as well as memory capacity"
thumbnail: "/images/snacks/the-bandwidth-limit-on-local-ai.webp"
standfirst: "A local AI system needs enough memory to hold a model, but its bandwidth helps determine how quickly that model can produce an answer."
status: published
sourceEpisode: episode-067
episodePosition: 3
theme: ai-models-infrastructure
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
transcriptStart: "00:46:16"
relationships: []
featured: false
fixture: false
---

Memory capacity is an obvious limit for local AI because a model has to fit before it can run, yet the amount of VRAM doesn't describe the whole machine. Memory bandwidth matters alongside capacity, since it governs how quickly data can move through the system while the model is generating its response.

That constraint becomes visible during decode, the stage measured by the number of output tokens produced each second. A compact Spark system was described as having weak memory bandwidth relative to its compute, leaving substantial processing power paired with a slower route to memory and making its response speed unattractive despite the compute available.

More memory doesn't remove every boundary either. A card with 96 GB of memory was priced above $20,000, yet that capacity still couldn't accommodate the very largest models under discussion. Local performance therefore rests on two separate hardware questions that have to be considered together, whether the model fits in memory, and how quickly memory can feed the decoding work once it does.
