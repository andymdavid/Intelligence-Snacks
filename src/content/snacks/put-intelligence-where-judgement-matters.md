---
title: "Put Intelligence Where Judgement Matters"
editorialTitle: "Concentrating probabilistic intelligence at operational judgement points"
thumbnail: "/images/snacks/put-intelligence-where-judgement-matters.webp"
standfirst: "A hybrid monitoring workflow keeps sensitive data local, reserves frontier models for anomalies and turns repeatable answers into dependable software."
status: published
sourceEpisode: episode-069
episodePosition: 5
theme: software-systems
attribution: "Developed from a conversation between Pete Winn, Piers Cockram and Andy David"
transcriptStart: "44:03.919"
relationships: []
featured: false
fixture: false
---

Piers routes logs from his hardware, firmware, operating systems, applications and Docker containers into a single feeder. A local model processes about 10,000 log lines each hour, then condenses and classifies them into roughly fifty that warrant closer attention. The model is not expected to solve the problems. Its job is to reduce a noisy operational fire hose to a manageable set of exceptions.

Only those exceptions are sent to a frontier model such as Claude, which investigates the outliers, alerts Piers and proposes a response. That division keeps the wider body of personal and sensitive information on equipment he controls while applying stronger reasoning where it adds value. Piers has refined the workflow to the point where unusual network events can be detected and, in some cases, repaired automatically.

The same principle governs what happens after a useful response is found. If the remedy can be repeated, Piers converts it into an ordinary software recipe instead of spending more tokens on fresh inference each time. Deterministic steps then follow a stable path, while probabilistic intelligence remains available for genuine judgement calls. The model helps design, supervise and improve the process without becoming the runtime for every routine action.
