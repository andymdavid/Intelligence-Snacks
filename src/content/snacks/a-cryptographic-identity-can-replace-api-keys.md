---
title: "A Cryptographic Identity Can Replace API Keys"
editorialTitle: "A Cryptographic Identity Can Replace Repeated App Setup"
thumbnail: "/images/snacks/a-cryptographic-identity-can-replace-api-keys.webp"
standfirst: "Combining a persistent Nostr identity with FIPS networking could let software arrange access across apps without sending users through accounts, domains and copied credentials."
status: published
sourceEpisode: episode-072
episodePosition: 5
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "23:23"
relationships: []
featured: false
fixture: false
---

Today, making a local app available elsewhere can require a hosting account, domain configuration, tunnels and API keys. Pete ran into that complexity while making Wingman apps accessible from different devices. After giving each app a FIPS address, he could reach an app running on a home computer from his phone through a FIPS-capable browser, without first deploying it to a data centre or configuring DNS.

Identity is what turns that network connection into a usable product experience. Pete's proposed model asks the user to keep one cryptographic Nostr identity. Devices can have their own keys mapped back to that person, while software decides which apps and machines belong to them. Instead of opening service settings, creating credentials and pasting long strings into an agent, the user can sign in once or scan a QR code and let the software establish the connections.

The result is shared identity infrastructure rather than another account system inside every app. Flight Deck, Tower and Autopilot can run in different places and still recognise who is allowed to reach them over FIPS. A user can open a website, authenticate as themselves and see apps or files supplied by their own machines. The visible action becomes approving a signature, while the domain records, proxy configuration and separate API keys disappear.
