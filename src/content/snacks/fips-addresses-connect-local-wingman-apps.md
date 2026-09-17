---
title: "FIPS Addresses Connect Local Wingman Apps"
editorialTitle: "FIPS addresses remove the networking stack around local Wingman apps"
thumbnail: "/images/snacks/fips-addresses-connect-local-wingman-apps.webp"
standfirst: "A FIPS-based Wingman prototype made laptop-hosted apps reachable from other devices without first provisioning the usual public web infrastructure."
status: published
sourceEpisode: episode-072
episodePosition: 4
theme: software-systems
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "21:35"
relationships: []
featured: false
fixture: false
---

Making a local Wingman app available over the public internet had required DNS, tunnels, proxies, subdomain routing, certificates and Cloudflare configuration. Pete instead gave each app a FIPS address. That let the prototype expose an app directly from the computer running it, without deploying the app to a hosting service or configuring that surrounding network infrastructure.

Pete then used FIPS links between Flight Deck, the user-facing interface, Tower, the data backend, and Autopilot, the component that runs work and creates apps. Those parts could run in different places and still communicate without DNS. In the clearest test, Autopilot stayed on a laptop while Pete opened one of its apps from a FIPS-capable browser on his phone.

The Wingman browser implementation worked on iPhone, Android, Linux and MacBook, although Pete hadn't added Windows support. Once signed in with his Nostr identity, he could reach apps on his home Autopilot from another computer or while travelling, provided the host computer remained on. The same approach could reduce a new Wingman deployment to setting up the software and scanning a QR code.
