---
title: "When Wingman's encrypted sync got too complex"
editorialTitle: "Pete weighs abandoning Wingman's encrypted record sync as key choices compound"
thumbnail: "/images/snacks/when-wingmans-encrypted-sync-got-too-complex.webp"
standfirst: "Pete considered dropping Wingman's encrypted record sync after its need for a live key created a difficult design choice inside his self-hosted app."
status: published
sourceEpisode: episode-067
episodePosition: 5
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
relationships: []
featured: false
fixture: false
---

Pete had reached the point of considering whether Wingman should abandon its encrypted record sync model because the design had become too complex. The problem was specific to how encryption had to work inside this application, where keeping synchronized records encrypted also meant giving the app an active role in handling the key.

That role begins with the encryption key being live in the app, which then raises a basic ownership decision. Wingman could use the user's key, tying the feature to a key the user already controls, or it could generate a new one and take on a separate key within the design. Either route had to be settled before the encrypted sync model could remain workable, so the complexity wasn't incidental to the feature's operation.

The setting made that burden easier for Pete to question because Wingman was his app running on his own server. In that particular arrangement, the unresolved choice over which key should live in the app had added enough complexity for abandoning encrypted record sync to be a reasonable option. That conclusion belongs to Wingman's design in this setting and doesn't establish a general case against application-level encryption.
