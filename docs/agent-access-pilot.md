# Agent access and AI-search visibility: first release

This release implements the first three tasks in the Flight Deck rollout: five citable pilot guides, a public static v1 research interface, and ordinary archive discovery links. Editorial expansion and actual AI-search visibility measurement remain separate follow-up tasks.

Pilot: graph-memory, agent-continuity, code-first-workflows, human-review, shared-work-layers. Pages are server-rendered, self-canonical and linked from /ideas/, their source episodes, graph detail cards, sitemap, footer and llms.txt. Each has an optional plain-text .md representation. Only the five pilot pages are advertised as standalone guides; the other accepted themes remain available through the graph and JSON records.

The v1 index covers all accepted shared themes and observations. Static detail routes use slugs for themes and bare UUIDs for observations. Every record includes schemaVersion and the deterministic contentRevision hash. Unknown paths return 404 and writes return 405. The deployed Bun static server supplies CORS for public research JSON GETs. There is no query-parameter server search or MCP service; the downloaded reference client searches the index locally.

Evidence URLs retain the existing graph resolver's behaviour. A resolved unique transcript turn includes its timestamp and anchor. An unresolved excerpt points to the episode with a null timestamp and explicit episode locator. Exported excerpts and summaries preserve their source records; an accepted observation or editorial grouping is not independent verification of the claim. Theme review is explicitly agent editorial review.

Follow-up questions and evaluation procedure are in agent-research-evaluation.json. No indexing, AI citation, referral or subscription lift has been measured in this release. Account-based baselines require authorised console/analytics access. Do not infer search outcomes from successful deployment, robots permissions, llms.txt, schema or test passes.

Validation commands:

- bun run agent:test
- bun run graph:test
- bun run build
- PORT=8796 bun server/index.ts
- GRAPH_CHROMIUM_EXECUTABLE=<chromium> bun run agent:browser
- GRAPH_PREVIEW_URL=http://127.0.0.1:8796 GRAPH_CHROMIUM_EXECUTABLE=<chromium> bun run graph:browser
- node public/agents/research.mjs "persistent agent work" http://127.0.0.1:8796

Originating Flight Deck thread: 816028ad-4da0-4ab8-a940-150933c00cad; message 0cbcc933-aa41-4343-ac13-d209a6d1bb9e.
