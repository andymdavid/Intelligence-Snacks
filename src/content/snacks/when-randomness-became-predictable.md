---
title: "When randomness became predictable"
editorialTitle: "Predictable firmware entropy made Coldcard private keys recoverable"
thumbnail: "/images/snacks/when-randomness-became-predictable.webp"
standfirst: "A Coldcard firmware flaw turned private keys from secrets protected by an immense search space into numbers that attackers could recreate within hours."
status: published
sourceEpisode: episode-066
episodePosition: 1
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn and Andy David"
relationships: []
featured: false
fixture: false
---

Coldcard hardware wallets were supposed to generate private keys with a hardware source of randomness. A firmware change committed in March 2021 disabled that source and used a pseudo-random generator instead. The wallets could remain completely offline, but the keys protecting their Bitcoin were only as unpredictable as the limited inputs used to create them.

The replacement process combined a device identifier with other entropy that Pete understood to include timing information. That distinction transformed the economics of an attack. A genuinely random private key would be beyond the reach of all the computing power in the world, while one produced through the flawed process could reportedly be recovered on a laptop in a few hours.

Attackers could therefore reconstruct private keys without touching the devices and sweep funds from wallets whose owners had done nothing. Users who had added independent entropy, such as by rolling dice to generate seed material, were less exposed because their security did not rely solely on the faulty generator. The scale of the theft remained uncertain because public blockchain records cannot by themselves distinguish a stolen transfer from an ordinary one.
