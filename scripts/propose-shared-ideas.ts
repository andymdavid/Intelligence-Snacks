import { canonicalPublicGraph } from "../src/lib/public-graph-data";
import { proposeSharedIdeaPairs } from "../src/lib/shared-idea-candidates";
const data = canonicalPublicGraph();
console.log(
  JSON.stringify(
    {
      method:
        "title-and-summary TF-IDF cosine; cross-episode; editorial review required",
      threshold: 0.22,
      records: data.knowledge.nodes.length,
      automaticPublication: false,
      candidates: proposeSharedIdeaPairs(data.knowledge.nodes),
    },
    null,
    2,
  ),
);
