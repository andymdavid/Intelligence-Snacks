---
title: "Smaller AI Models Work Better on Narrow Tasks"
editorialTitle: "Task Decomposition Makes Smaller AI Models Competitive"
thumbnail: "/images/snacks/smaller-ai-models-work-better-on-narrow-tasks.webp"
standfirst: "Dividing software work into bounded jobs can make cheaper models a practical alternative to a single request sent to the largest available model."
status: published
sourceEpisode: episode-062
episodePosition: 5
theme: ai-models-infrastructure
attribution: "Developed from a conversation between Pete Winn, Yo and Andy David"
relationships: []
featured: false
fixture: false
---

Pete found that model size was not the biggest factor in getting useful results. Although a larger model could help, he could achieve similar output by breaking a task into smaller components and running a separate job for each one. The model then handled a limited problem instead of trying to produce an entire feature in one pass.

The economics made that approach compelling. Pete said some GLM models could cost about 100 times less to run than Claude. At that difference, he could run ten smaller jobs and still spend less, using repeated attempts or specialised steps to assemble the result he wanted.

The saving came with extra work. Someone still had to define the components, coordinate the jobs and combine their outputs, so the method was harder to use than a one-shot prompt. Smaller models became competitive not by matching a frontier model on one broad request, but by being given narrower jobs that played to their capabilities. He could trade some convenience for more control over how the work was done.
