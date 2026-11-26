# Compact evidence search delivery

The Bun server now provides `GET /api/knowledge/v1/search?q=human%20attention&limit=5`.
It searches observation titles, summaries and evidence using the existing deterministic lexical ranker. No embeddings or external service are needed. It uses a build-time corpus from the same public records and reports their content revision.

The default limit is five; maximum ten. `format=text` supplies plain text for tools that struggle with JSON. `episode` filters by number or ID; `speaker` matches a single attributed speaker name case-insensitively. Empty/oversized queries and invalid limits/formats return 400. GET and HEAD are supported; other methods return 405. Evidence excerpts are limited to two per result and 900 characters each, with explicit truncation flags. Full records retain all evidence and typed graph relationships. Corpus weights are calculated before filtering.

The For Agents page documents search → inspect → follow one relevant connection → read source → cite. The reference client uses the endpoint and then fetches full records. Static index and detail record URLs remain available. Search results do not infer agreement from graph membership or assign multi-speaker exchanges to a single speaker.

Validation: 11 agent/search tests passed, including real-corpus provenance, bounds, filters, text, HEAD, invalid input and empty results. Production build passed with zero Astro diagnostics. Local production-server HTTP search and the Node reference client passed; “human attention” ranked “AI cannot scale human attention” first. The deployment Dockerfile includes the shared ranker required by the runtime.

Limits: lexical search does not establish semantic relevance, factual accuracy or answer completeness. This change documents bounded traversal over existing record connections; it does not automatically expand the graph or prove a graph retrieval benefit. Plain text is a compatibility option, not evidence that format caused the reported tool failures. Consumer ChatGPT/Claude compatibility, unbranded discovery, referrals and subscriptions remain unmeasured pending access and release. Existing graph shared-review inventory failures were documented separately on the original branch and origin/main.
