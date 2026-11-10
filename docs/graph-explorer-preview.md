# Graph explorer design preview

The design was approved for implementation in the originating Flight Deck thread on 2026-11-09. This release replaces `/graph/` with the approved explorer. The original design preview introduced no duplicate production route. Subsequent reviewed concept additions are described below. The portable review file remains available for reproducing the original review workflow.

## Review

- Overview: all 753 published nodes and 2,374 recorded connections. The default shows 902 idea connections, with 1,472 source links available on demand. Shared ideas and source episodes act as labelled landmarks.
- Hover for a title, select an episode/idea, follow connections, inspect evidence, return with Back or Overview.
- Search covers the entire published archive; Browse the archive supplies keyboard and no-JavaScript navigation.
- Selection, source-episode topic scope and source-link mode are represented by `?node=...&topic=...&context=all` and support browser history and direct loading.
- Mobile selection presents details beneath the map. Mouse drag, wheel zoom, touch pan/pinch and explicit zoom controls are supported; animated camera moves respect reduced motion.
- Existing site fonts, header, colour tokens and editorial controls are reused.

The shared-theme ring has been replaced by deterministic source anchors: each connected episode contributes one equal vote to a theme's centroid, followed by a bounded spacing pass around themes and episode neighbourhoods. Layout is computed once from the full graph, so selection and topic scope preserve node positions. Approximate proximity describes source navigation, not semantic similarity or agreement. Source-episode and observation positions remain unchanged.

At the widest scale the map prioritises up to 14 shared-theme labels on desktop and six on narrow screens. Labels use measured font widths, try four placements and suppress collisions; more detail appears when zooming or selecting. Episode labels appear on zoom or focus. Background idea connections are quieter, while hovered and selected connections stay prominent. All published nodes and connections remain available, including optional source links.

Layout neighbourhoods remain explicitly grouped by source episode. Topic scope filters those episodes and hubs linked to their observations; it does not classify every claim into that topic. Source lines are hidden by default and source context is collapsed in the detail panel. Literal search ranks exact, prefix and other title matches ahead of incidental summary matches.

The registry now contains 47 agent-editorial shared themes linking 193 observations across all 21 episodes. The archive-wide pass screened all 526 extracted titles/summaries and the nine family / 71 subtopic catalogue. It checked 161 additional observations against source excerpts and retained 32 prior source reviews. Thirty-seven new themes were added; nine existing hubs were extended rather than duplicated. Twelve themes explicitly compare different perspectives. One new typed development relationship records an explicit later reference to the consumer-inertia discussion; no new contradictions are inferred.

Each membership has a source rationale, pinned transcript revision, evidence IDs and evidence-text hashes. Three short-snippet cases also pin expanded local transcript context. Publication rejects missing or changed reviewed sources and hubs spanning fewer than two episodes. Extracted graph and Knowledge mix classifications remain unchanged.

`src/data/graph-shared-review.json` records fingerprints/dispositions for all 526 records, the 62 candidate-pair decisions (44 represented, 18 kept separate), consolidations and gaps. The public coverage disclosure distinguishes inventory screening from source verification and never claims an exhaustive ontology or full transcript reread. New/changed records and catalogue entries cannot inherit a completed review label. Ungrouped records are not declared unique.

`bun run graph:propose-shared` reproduces lexical cross-episode candidates from the full inventory without changing the accepted registry. An editor must inspect sources, record decisions and update the dated audit before publication. Theme family tags are editorial review-navigation tags, not new classifications of every claim.

The compact shared-idea browser starts with eight entries and expands to all current in-scope themes. All themes are also searchable. Search results reset their internal scroll and keep the input/results visible when opened after map navigation.

## Validation

```sh
bun install --frozen-lockfile
bun run graph:test
bun run build
# Serve dist using a local static server, then:
GRAPH_PREVIEW_URL=http://127.0.0.1:8794 GRAPH_CHROMIUM_EXECUTABLE=/path/to/chrome bun run graph:browser
```

The browser smoke covers complete rendering/index, overview labels, deferred evidence, pointer and keyboard selection, exact transcript links, history, overview, zoom/drag, search/empty results, mobile overflow, direct selection with reduced motion, evidence failure and no-JavaScript access. Actual touch-device usability and larger future archives still need human assessment; synthetic checks do not establish these. The layout iteration also checks non-overlapping overview labels after fonts load, landmark budgets, stable positions through topic changes, source-weight invariance and hub separation.

## Portable review file

After building, `bun run graph:preview:package` produces `/tmp/graph-explorer-preview.html` (an optional output argument can override it). Download and open in a browser. Code, graph data, styles and source evidence are embedded; public fonts/branding and source destinations use intelligencesnacks.com. No credentials or private data are included. The embedded evidence is for portable review only; the normal site build still fetches evidence on demand.

A file URL is local: Copy idea link cannot produce a remotely shareable preview URL. Use the hosted build for shared deep links when preview hosting is available. The standalone file is not an alternative production publishing mechanism.

## Assessment still needed

Review whether the episode-based overview is a useful starting point, the amount of background fading, label density and the mobile reading flow. Topic-based landmarks can be assessed separately when reliable idea-to-topic membership is available. The registry is now based on an archive-wide inventory pass. It remains a bounded editorial interpretation rather than proof of exhaustive thematic coverage; recorded gaps and source-review levels are visible.

## Release performance validation

The normal built site reproduced the preview lag. The renderer batches connections into six paths by visual state, caches unchanged SVG attributes and node element references, recomputes connection highlighting only when selection/hover changes, and coalesces pointer/wheel updates to animation frames.

For the original 708-node release, in the same headless Chromium session, at 1440 × 1050, a sequence of 60 wheel zoom frames measured:

| Measurement | Original | Optimized |
| --- | ---: | ---: |
| Median event-to-next-frame interval | 65.9 ms | 17.2 ms |
| 95th percentile interval | 80.2 ms | 29.4 ms |
| SVG attribute mutations | 437,855 | 47,082 |

These are local comparative measurements, not a promise of a particular frame rate on every device. Browser regression checks verify default idea connections and optional complete source connections are rendered and selection highlights exactly its recorded connections, alongside navigation, evidence, mobile overflow and fallback checks.
