---
title: "When Cyber Safeguards Block Defenders"
editorialTitle: "Cyber safeguards can block defenders from analysing known exploits"
thumbnail: "/images/snacks/when-cyber-safeguards-block-defenders.webp"
standfirst: "A model that refuses exploit work can also deny incident responders the tools they need to locate a known vulnerability and check other systems for the same flaw."
status: published
sourceEpisode: episode-066
episodePosition: 2
theme: privacy-security
attribution: "Developed from a conversation between Pete Winn and Andy David"
relationships: []
featured: false
fixture: false
---

During the Coldcard incident, responders had to reproduce the failure and trace it through the code before they could establish which devices were exposed. That work crossed C, MicroPython and Python scripts, making the flaw difficult to spot from a simple code review. As the investigation developed, the affected scope widened beyond the device model identified in the first reports.

Pete said responders reported that OpenAI and Anthropic models, including cyber-focused models, refused requests for retrospective red-team analysis because they classified the work as a cyberattack. That left people unable to use those models to examine their own code bases at the moment they needed fast answers. Unsafeguarded models such as Kimi were then used to confirm the bug and scan dependent code across the Bitcoin ecosystem for related vulnerabilities.

The same technical capability can therefore support both attack and defence. An unrestricted model may lower the cost of finding an exploitable flaw, but blanket refusals can also prevent defenders from reconstructing that flaw once funds are moving and services are under pressure. In this case, access to the less restricted model let responders test claims against code, refine the affected scope and search for further weaknesses while some services shut down hot wallets under attack.
