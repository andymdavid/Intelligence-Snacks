# Reviewing cross-episode ideas

Episodes and source claims retain their identities. The public Ideas view projects only concepts, claims, examples, questions and reviewed topic hubs. Episodes, people and Snacks remain available in the Episodes view and source details.

## Find candidates

Run `bun scripts/propose-idea-connections.ts > /tmp/idea-candidates.json` after a new source export. This scans all accepted public idea nodes across episodes. It changes no records and outputs proposed candidates only. Shared words are a discovery heuristic, not confidence, endorsement, equivalence, or a publication decision. The default output is 20 leads; an optional numeric argument changes the limit up to 200.

## Review and publish

Read the full source excerpts for both nodes and, where needed, the surrounding transcript. Ask how one idea extends, parallels, complements, supports, contradicts, exemplifies or enables the other. Do not force a connection; do not infer agreement from similar wording or merge claims with different scope.

Accepted interpretations belong in `src/data/graph-relationships.json`, outside the replaceable Studio export. Record stable source node IDs, exact transcript revisions, evidence IDs from both endpoints, an explanation that preserves differences, reviewer, review method and date. This pilot uses `agent-editorial-review`; it must not be described as human review. Proposals are excluded from the public model. Schema, missing evidence, and stale source revisions fail publication for explicit re-review. A new export cannot silently repoint these relationships.

Run the idea graph tests, graph checks, build and browser checks before publishing. Review the relationship explanation and both sources through the public detail panel. A topic hub groups discussions; it does not assert that their claims are equivalent. Changes to hub mentions use the existing concept review process.

## Interpret the discovery signals

Shared topic reach counts distinct episodes linked directly to a reviewed hub, not repeated mentions, host degree or component size. Recent coverage counts represented episodes among the latest five published episode numbers. “Recent discussions” are a sample from that window, not a measure of trend, novelty or importance. This pilot covers graph memory and agent harnesses; it is not a ranking of all archive themes. Broader emergence analysis requires wider reviewed grouping and a comparison over time, including declining or contradicting evidence.
