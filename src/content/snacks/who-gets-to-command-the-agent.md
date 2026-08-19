---
title: "Who Gets to Command the Agent?"
editorialTitle: "Signed public keys as the command boundary for agents in shared chat"
thumbnail: "/images/snacks/who-gets-to-command-the-agent.webp"
standfirst: "Signed messages give agents a verifiable way to distinguish an authorised operator from everyone else in a shared chat."
status: published
sourceEpisode: episode-065
episodePosition: 2
theme: privacy-security
attribution: "Developed from a conversation between Andy David and Pete Winn"
relationships: []
featured: false
fixture: false
---

Putting an agent in a shared chat creates an immediate access problem. Anyone in the room can ask it to do something, even when the agent is running on someone else’s machine and can reach that person’s resources. A familiar username or presence in the channel is not enough. The request needs to carry an identity that the agent can verify before treating it as a command.

Flight Deck addresses this with Nostr-signed events. Pete’s agent Rick can check the public key attached to each message and respond only when that key appears in Pete’s approved set. Pete adopted the rule as soon as he realised that other people in a shared Flight Deck space could otherwise instruct an agent living on his machine.

The shared room remains open for conversation and collaboration, but access to Rick does not become shared merely because the interface is. Messages signed by other keys can still appear in the channel without qualifying as commands. The boundary is compact and explicit. Rick acts only on signed messages from Pete’s authorised public keys.
