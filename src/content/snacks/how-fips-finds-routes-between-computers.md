---
title: "How FIPS Finds Routes Between Computers"
editorialTitle: "FIPS Builds Self-Organising Routes Across Any Link"
thumbnail: "/images/snacks/how-fips-finds-routes-between-computers.webp"
standfirst: "FIPS lets peers find a path to a computer or application, then carries IPv6 traffic across whatever underlying connection is available."
status: published
sourceEpisode: episode-072
episodePosition: 2
theme: software-systems
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "07:44"
relationships: []
featured: false
fixture: false
---

In FIPS, a computer or application gets an address that looks like a Nostr npub followed by .fips. That address replaces the need for someone to buy a domain and configure DNS records before the destination can be reached. Nostr relays help bootstrap discovery by letting a device announce where it is and find peers already connected nearby.

Those peers exchange information about the computers they can reach and how to reach them. As that information passes through the network, the peers form a self-organising mesh. A machine can locate another computer, identify the most direct available path and communicate with it without relying on a central DNS server to map a human-readable domain in advance.

FIPS sends the traffic as IPv6 packets, but it doesn't bind them to one kind of connection. The same routing system can use Bluetooth, a direct cable, microwave signals or another available transport. The address and discovery process stay consistent while the physical link can change, allowing computers and applications to find each other across whatever connection can carry the packets.
