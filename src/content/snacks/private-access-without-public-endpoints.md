---
title: "Private Access Without Public Endpoints"
editorialTitle: "A signed-device proxy for private access to local Autopilot WApps"
thumbnail: "/images/snacks/private-access-without-public-endpoints.webp"
standfirst: "Signed device access could make locally hosted Autopilot WApps available through Wingman without turning every installation into a public internet service."
status: published
sourceEpisode: episode-070
episodePosition: 1
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "04:04"
relationships: []
featured: false
fixture: false
---

Pete is testing a proof of concept for people who run Autopilot on a personal laptop or another machine they do not want to expose online. Today, making its WApps reachable can mean configuring domains, DNS and separate endpoints. A local proxy inside the Wingman app would instead provide a route to WApps running on that machine while keeping Autopilot itself private.

The second part of the design is a FIPS reverse proxy controlled through signed identity. An owner would sign approval for a particular device, allowing its requests to reach the apps it has permission to use. Traffic from devices without that approval would be discarded, so access would depend on an explicit relationship between an identity and a device rather than possession of a public address.

That model becomes more useful as one person runs Autopilot across a desktop, laptop or several other machines. Each additional installation currently brings more endpoint and DNS work. Routing access through Wingman could remove that repeated configuration and make local development WApps easier to share with approved people. The intended result is simple. The services remain on their host machines, while each authorised device gets a controlled path to them.
