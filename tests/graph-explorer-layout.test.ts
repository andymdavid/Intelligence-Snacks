import { expect, test } from "bun:test";
import {
  positionArchive,
  type ExplorerNode,
} from "../src/lib/graph-explorer-layout";
import { canonicalPublicGraph } from "../src/lib/public-graph-data";
import { buildKnowledgeModel } from "../src/lib/graph-model";
const model = buildKnowledgeModel(canonicalPublicGraph());
const sourceNodes = model.nodes as ExplorerNode[];
test("layout preserves every public identity with finite coordinates", () => {
  const nodes = positionArchive(sourceNodes);
  expect(nodes.map((node) => node.id)).toEqual(
    model.nodes.map((node) => node.id),
  );
  expect(
    nodes.every(
      (node) =>
        Number.isFinite(node.x) && Number.isFinite(node.y) && node.radius > 0,
    ),
  ).toBe(true);
  expect(new Set(nodes.map((node) => `${node.x},${node.y}`)).size).toBe(
    nodes.length,
  );
});
test("layout is reproducible independently of input order and adds no relationships", () => {
  const first = new Map(
    positionArchive(sourceNodes).map((node) => [
      node.id,
      [node.x, node.y, node.colour],
    ]),
  );
  const second = positionArchive([...sourceNodes].reverse());
  for (const node of second)
    expect([node.x, node.y, node.colour]).toEqual(first.get(node.id)!);
  expect(model.nodes.every((node) => !("x" in node))).toBe(true);
});
