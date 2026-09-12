---
title: "AI Coding Tools Need Cryptographic Guardrails"
editorialTitle: "AI coding tools need firm cryptographic boundaries"
thumbnail: "/images/snacks/ai-coding-tools-need-cryptographic-guardrails.webp"
standfirst: "AI can accelerate software prototypes, but cryptographic code exposes why expert developers must still control the design and review every decision."
status: published
sourceEpisode: episode-062
episodePosition: 1
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn, Yo and Andy David"
relationships: []
featured: false
fixture: false
---

At Sovereign Engineering, Yo has found cryptography to be a particularly weak area for AI coding tools. The models don't merely make occasional implementation mistakes. They tend to propose writing their own cryptography, even though established cryptographic components should be used instead. Developers therefore have to recognise the danger and explicitly reject that approach.

That changes the human role from approving a finished result to enforcing a boundary throughout the work. Telling the model once isn't enough. Yo said developers have to keep reminding it that the project isn't going to invent its own cryptography. Fluent explanations and confident code can't substitute for judgement about which technical choices are unacceptable.

The same limitation becomes more serious in production software, where small details can determine whether a system remains stable or creates a hidden hazard. AI can still help with experiments and prototypes, but serious projects need people to design the system, guide the model and inspect its output. The practical rule is concrete. Don't delegate cryptographic judgement to the model, and don't let generated code replace established cryptographic components.
