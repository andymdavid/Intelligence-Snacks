---
title: "When an agent rents its own server"
editorialTitle: "An agent rents compute and moves its runtime after payment"
thumbnail: "/images/snacks/when-an-agent-rents-its-own-server.webp"
standfirst: "A wallet gives an AI agent the means to rent infrastructure, move its runtime and pay to keep itself online."
status: published
sourceEpisode: episode-069
episodePosition: 3
theme: agents
attribution: "Developed from a conversation between Pete Winn, Piers Cockram and Andy David"
transcriptStart: "09:50.173"
relationships: []
featured: false
fixture: false
---

Roland from Alby Hub created an AI agent that went shopping for a virtual machine it could rent. After finding one, the agent moved its runtime onto the rented machine. It could then pay the infrastructure operator from whatever activities it was carrying out, linking its continued operation to its ability to cover the hosting bill.

A separate experiment showed how little machinery the transaction can require. Dimmy built a protocol for buying Kubernetes pods with Cashu. A buyer could send an endpoint the software image and everything it needed, receive an invoice, pay it and gain a running machine. Payment turned a request for compute directly into provisioned infrastructure.

That pattern does not have to end with one rental. A machine could launch another machine, which could launch the next, allowing the software to move repeatedly through a marketplace of available servers. If the runtime shifted to a newly rented host each day, the physical location of the active software could keep changing as part of the same paid provisioning cycle.
