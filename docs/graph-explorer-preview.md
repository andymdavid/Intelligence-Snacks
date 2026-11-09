# Graph explorer design preview

The design was approved for implementation in the originating Flight Deck thread on 2026-11-09. This release replaces `/graph/` with the approved explorer. The original design preview introduced no duplicate production route. Subsequent reviewed concept additions are described below. The portable review file remains available for reproducing the original review workflow.

## Review

- Overview: all 716 published nodes and 2,212 recorded connections. The default shows 740 idea connections, with 1,472 source links available on demand. Shared ideas and source episodes act as labelled landmarks.
- Hover for a title, select an episode/idea, follow connections, inspect evidence, return with Back or Overview.
- Search covers the entire published archive; Browse the archive supplies keyboard and no-JavaScript navigation.
- Selection, source-episode topic scope and source-link mode are represented by `?node=...&topic=...&context=all` and support browser history and direct loading.
- Mobile selection presents details beneath the map. Mouse drag, wheel zoom, touch pan/pinch and explicit zoom controls are supported; animated camera moves respect reduced motion.
- Existing site fonts, header, colour tokens and editorial controls are reused.

Layout neighbourhoods remain explicitly grouped by source episode. Topic scope filters those episodes and hubs linked to their observations; it does not classify every claim into that topic. Source lines are hidden by default and source context is collapsed in the detail panel. Literal search ranks exact, prefix and other title matches ahead of incidental summary matches.

Ten shared-concept hubs are agent-editorial groupings, not assertions that observations are equivalent. Eight additions were reviewed against 27 source observations; the registry now links 32 observations across 13 episodes. Each mention pins its source transcript revision and evidence IDs with a specific rationale. Production validation fails for missing/stale source references or a hub that does not span at least two episodes. Original extracted graph and topic classification data are unchanged. See `src/data/graph-concepts.json` for the review ledger.

## Validation

```sh
bun install --frozen-lockfile
bun run graph:test
bun run build
# Serve dist using a local static server, then:
GRAPH_PREVIEW_URL=http://127.0.0.1:8794 GRAPH_CHROMIUM_EXECUTABLE=/path/to/chrome bun run graph:browser
```

The browser smoke covers complete rendering/index, overview labels, deferred evidence, pointer and keyboard selection, exact transcript links, history, overview, zoom/drag, search/empty results, mobile overflow, direct selection with reduced motion, evidence failure and no-JavaScript access. Actual touch-device usability and larger future archives still need human assessment; synthetic checks do not establish these.

## Portable review file

After building, `bun run graph:preview:package` produces `/tmp/graph-explorer-preview.html` (an optional output argument can override it). Download and open in a browser. Code, graph data, styles and source evidence are embedded; public fonts/branding and source destinations use intelligencesnacks.com. No credentials or private data are included. The embedded evidence is for portable review only; the normal site build still fetches evidence on demand.

A file URL is local: Copy idea link cannot produce a remotely shareable preview URL. Use the hosted build for shared deep links when preview hosting is available. The standalone file is not an alternative production publishing mechanism.

## Assessment still needed

Review whether the episode-based overview is a useful starting point, the amount of background fading, label density and the mobile reading flow. Topic-based landmarks can be assessed separately when reliable idea-to-topic membership is available. The reviewed registry now contains ten shared concepts; this remains an editorial starting set, not comprehensive thematic coverage.

## Release performance validation

The normal built site reproduced the preview lag. The renderer batches connections into six paths by visual state, caches unchanged SVG attributes and node element references, recomputes connection highlighting only when selection/hover changes, and coalesces pointer/wheel updates to animation frames.

For the original 708-node release, in the same headless Chromium session, at 1440 × 1050, a sequence of 60 wheel zoom frames measured:

| Measurement | Original | Optimized |
| --- | ---: | ---: |
| Median event-to-next-frame interval | 65.9 ms | 17.2 ms |
| 95th percentile interval | 80.2 ms | 29.4 ms |
| SVG attribute mutations | 437,855 | 47,082 |

These are local comparative measurements, not a promise of a particular frame rate on every device. Browser regression checks verify default idea connections and optional complete source connections are rendered and selection highlights exactly its recorded connections, alongside navigation, evidence, mobile overflow and fallback checks.
