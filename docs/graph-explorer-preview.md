# Graph explorer design preview

This branch replaces `/graph/` only in its own build. The existing live website is the comparison baseline. Do not merge or deploy it as a transition without design review. No new production route or graph data is introduced.

## Review

- Overview: all 708 published nodes and 2,185 recorded connections; source episodes act as labelled landmarks.
- Hover for a title, select an episode/idea, follow connections, inspect evidence, return with Back or Overview.
- Search covers the entire published archive; Browse the archive supplies keyboard and no-JavaScript navigation.
- Selection is represented by `?node=...` and supports browser history and direct loading.
- Mobile selection presents details beneath the map. Mouse drag, wheel zoom, touch pan/pinch and explicit zoom controls are supported; animated camera moves respect reduced motion.
- Existing site fonts, header, colour tokens and editorial controls are reused.

Grouping is explicitly by source episode, not inferred concepts. All nodes and links use the existing accepted public graph, including its existing automated extraction/review policy. `Idea connections` and `Archive context` are separated in the panel. No new recurrence, emergence or semantic claims are generated.

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

Review whether the episode-based overview is a useful starting point, the amount of background fading, label density and the mobile reading flow. Topic-based landmarks can be assessed separately when reliable idea-to-topic membership is available. The current data only has two curated shared concepts; this design does not manufacture more hubs to fill the map.
