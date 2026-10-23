---
title: "When encrypted sync costs too much"
editorialTitle: "Pete weighs abandoning Wingman's encrypted record sync as key choices compound"
thumbnail: "/images/snacks/when-encrypted-sync-costs-too-much.webp"
standfirst: "Application-level encryption can impose more design complexity than it earns when an app already runs on its owner’s server."
status: published
sourceEpisode: episode-067
episodePosition: 5
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn, Anthony and Andy David"
relationships: []
featured: false
fixture: false
seo:
  title: "When encrypted sync costs too much"
  description: "Application-level encryption can impose more design complexity than it earns when an app already runs on its owner’s server."
---

Pete had considered abandoning the encrypted record synchronisation model in Wingman. It had become too complex without adding enough value, particularly when Tower, the stack’s backend service, would probably be self-hosted. The problem was not encryption in isolation. It was the way encryption reached into the application’s data model and every operation involving a protected record.

Decrypting those records requires a live key inside the app. That raises immediate design questions about whether the app should use the owner’s Nostr key or generate a separate key of its own. Once key identity, availability and encryption epochs enter the model, encrypted storage stops being a contained feature and becomes part of the application’s wider logic.

Anthony encountered the same trade-off while building home calendars. He wanted encryption at rest with Nostr keys, but removed it after it complicated too many parts of the data model. For Pete, the decisive detail was simpler still. The app was his, running on his own server, so the additional encryption machinery was solving a problem he did not need the application to solve.
