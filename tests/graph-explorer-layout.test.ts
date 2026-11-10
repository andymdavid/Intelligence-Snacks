import { expect, test } from "bun:test";
import {
  positionArchive,
  type ExplorerNode,
} from "../src/lib/graph-explorer-layout";
import { canonicalPublicGraph } from "../src/lib/public-graph-data";
import { buildKnowledgeModel } from "../src/lib/graph-model";
const model = buildKnowledgeModel(canonicalPublicGraph());
const sourceNodes = model.nodes as ExplorerNode[];
const connections = model.links.map(link => ({sourceId:link.source, targetId:link.target}));
test("layout preserves every public identity with finite coordinates", () => {
  const nodes = positionArchive(sourceNodes, connections);
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
    positionArchive(sourceNodes, connections).map((node) => [
      node.id,
      [node.x, node.y, node.colour],
    ]),
  );
  const second = positionArchive([...sourceNodes].reverse(), [...connections].reverse());
  for (const node of second)
    expect([node.x, node.y, node.colour]).toEqual(first.get(node.id)!);
  expect(model.nodes.every((node) => !("x" in node))).toBe(true);
});

test("shared themes remain separated and source connections affect only theme placement", () => {
  const connected = positionArchive(sourceNodes, connections);
  const unconnected = new Map(positionArchive(sourceNodes).map(node => [node.id,node]));
  const themes = connected.filter(node => node.kind === "canonical");
  for (const [i, node] of themes.entries()) {
    for (const other of themes.slice(i+1)) expect(Math.hypot(node.x-other.x,node.y-other.y)).toBeGreaterThan(100);
  }
  expect(themes.some(node => Math.hypot(node.x-unconnected.get(node.id)!.x,node.y-unconnected.get(node.id)!.y)>50)).toBe(true);
  for (const node of connected.filter(node => node.kind !== "canonical")) {
    expect([node.x,node.y]).toEqual([unconnected.get(node.id)!.x,unconnected.get(node.id)!.y]);
  }
});
test("repeating an observation from one episode does not bias a shared theme's source anchor", () => {
  const hub=sourceNodes.find(node=>node.kind==="canonical")!;
  const incident=connections.find(edge=>edge.sourceId===hub.id||edge.targetId===hub.id)!;
  const first=positionArchive(sourceNodes,connections).find(node=>node.id===hub.id)!;
  const repeated=positionArchive(sourceNodes,[...connections,...Array(50).fill(incident)]).find(node=>node.id===hub.id)!;
  expect([first.x,first.y]).toEqual([repeated.x,repeated.y]);
});
