---
title: "AI Agents Could Replace Spreadsheets"
editorialTitle: "Spreadsheets as small programs and the case for agent-generated code"
thumbnail: "/images/snacks/ai-agents-could-replace-spreadsheets.webp"
standfirst: "Spreadsheets made lightweight programming accessible to almost anyone, but agents could shift some of that work into custom software with logic that's easier to inspect."
status: published
sourceEpisode: episode-074
episodePosition: 5
theme: ai-coding
attribution: "Developed from a conversation between Pete Winn and Andy David"
transcriptStart: "29:55.726"
relationships: []
featured: false
fixture: false
---

Excel became one of the world's most widely used programming tools without most people treating it as a programming language. Its grid is a remarkably useful primitive. People can add values across rows and columns, track lists, build financial models, analyse data and create charts without first learning conventional software development.

That flexibility becomes a liability when a workbook grows or several people work on it. Version control is difficult, and a formula error can sit invisibly inside a cell while producing results that look plausible. Inserting rows or copying a formula into the wrong range can leave an entire model subtly wrong, forcing reviewers to trace calculations cell by cell to find where the mistake entered.

AI agents make a different approach practical for some of this work. Instead of constructing a general-purpose workbook, someone could ask an agent to build a small program tailored to the task and share it with the team. The program's code could be reviewed directly, checked by a second agent and equipped with tests that expose failures. A Jupyter notebook could still show the formulas, working and charts, while making the underlying logic more explicit than calculations hidden across spreadsheet cells.
