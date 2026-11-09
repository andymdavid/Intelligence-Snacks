import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.GRAPH_CHROMIUM_EXECUTABLE,
  headless: true,
  args: ["--no-sandbox"],
});
const base = process.env.GRAPH_PREVIEW_URL || "http://127.0.0.1:8794";
const checks = [],
  errors = [];
const assert = (ok, name) => {
  checks.push({ name, ok: !!ok });
  if (!ok) throw new Error(name);
};
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(`${base}/graph/`, { waitUntil: "networkidle" });
  const count = await page
    .locator("#knowledge-data")
    .evaluate((el) => JSON.parse(el.textContent).nodes.length);
  assert(
    (await page.locator("[data-node]").count()) === count,
    "all published nodes on map",
  );
  assert(
    await page.evaluate(() => {
      const model = JSON.parse(
        document.querySelector("#knowledge-data").textContent,
      );
      const segments = [
        ...document.querySelectorAll("[data-explorer-svg] path"),
      ].reduce(
        (sum, path) => sum + (path.getAttribute("d")?.match(/M/g)?.length || 0),
        0,
      );
      return segments === model.allConnections.length;
    }),
    "batched rendering preserves every published connection",
  );
  assert(
    (await page.locator("[data-index-node]").count()) === count,
    "complete accessible archive index",
  );
  assert(
    !(await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .some((entry) => entry.name.includes("details.json")),
    )),
    "evidence deferred until selection",
  );
  assert(
    (await page.locator("[data-label]:visible").count()) >= 15,
    "overview exposes readable landmarks",
  );
  await page.screenshot({ path: "/tmp/graph-explorer-overview.png" });
  const canonical = page.locator('[data-node="canonical:graph-memory"]');
  await canonical.focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction(
    () =>
      document.querySelector("#explorer-detail-title")?.textContent ===
      "Graph memory",
  );
  assert(
    new URL(page.url()).searchParams.get("node") === "canonical:graph-memory",
    "keyboard selection produces shareable address",
  );
  await page.waitForTimeout(400);
  assert(
    await page.evaluate(() => {
      const selected = new URL(location.href).searchParams.get("node");
      const model = JSON.parse(
        document.querySelector("#knowledge-data").textContent,
      );
      const expected = model.allConnections.filter(
        (edge) => edge.sourceId === selected || edge.targetId === selected,
      ).length;
      const actual = [
        ...document.querySelectorAll(
          '[data-explorer-svg] path[stroke-width="1.4"]',
        ),
      ].reduce(
        (sum, path) => sum + (path.getAttribute("d")?.match(/M/g)?.length || 0),
        0,
      );
      return expected > 0 && actual === expected;
    }),
    "selection highlights exactly its recorded connections",
  );
  await page.locator(".connection-list button").first().click();
  await page.waitForSelector("[data-detail-content] blockquote a");
  assert(
    (
      await page
        .locator("[data-detail-content] blockquote a")
        .first()
        .getAttribute("href")
    ).includes("#transcript-turn-"),
    "evidence links to exact transcript turn",
  );
  assert(
    await page
      .locator(".connection-list")
      .first()
      .evaluate(
        (el) =>
          el.compareDocumentPosition(document.querySelector("blockquote")) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    "connections precede source excerpts",
  );
  await page.locator("[data-back]").click();
  await page.waitForFunction(
    () =>
      document.querySelector("#explorer-detail-title")?.textContent ===
      "Graph memory",
  );
  assert(true, "back restores previous idea");
  await page.locator("[data-overview]").click();
  await page.waitForFunction(
    () => !new URL(location.href).searchParams.has("node"),
  );
  assert(
    await page.locator("[data-explorer-detail]").isHidden(),
    "overview clears selection",
  );
  await page.waitForTimeout(400);
  await canonical.click();
  assert(
    await page.locator("[data-explorer-detail]").isVisible(),
    "pointer selection works",
  );
  await page.locator("[data-overview]").click();
  await page.waitForTimeout(400);
  const before = await page
    .locator("[data-explorer-svg]>g")
    .getAttribute("transform");
  await page.locator('[data-zoom="1.35"]').click();
  await page.waitForTimeout(400);
  assert(
    before !==
      (await page.locator("[data-explorer-svg]>g").getAttribute("transform")),
    "zoom controls change camera",
  );
  const bounds = await page.locator("[data-explorer-svg]").boundingBox();
  await page.mouse.move(bounds.x + 100, bounds.y + 120);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 180, bounds.y + 170, { steps: 8 });
  await page.mouse.up();
  assert(
    await page.locator("[data-explorer-detail]").isHidden(),
    "drag does not select a node",
  );
  await page.locator("#explorer-search").fill("shared graph memory");
  assert(
    (await page.locator("[data-index-node]:visible").count()) > 0,
    "search retrieves archive ideas",
  );
  assert(
    await page
      .locator("[data-index-node]:visible")
      .first()
      .evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top < innerHeight;
      }),
    "desktop search results appear in the current viewport",
  );
  assert(
    (await page.locator("[data-search-status]").textContent()).includes(
      "Select a result",
    ),
    "search reports matching results beside the input",
  );
  await page.locator("[data-index-node]:visible a").first().focus();
  await page.keyboard.press("Enter");
  await page.waitForSelector("blockquote");
  assert(
    await page.locator("#explorer-index").isHidden(),
    "search result opens focused map",
  );
  await page.waitForTimeout(400);
  await page.screenshot({ path: "/tmp/graph-explorer-focus.png" });
  await page.locator("#explorer-search").fill("no-such-idea-xyz");
  assert(
    (await page.locator("[data-index-node]:visible").count()) === 0,
    "empty search is truthful",
  );
  await page.locator("#explorer-search").press("Escape");
  assert(
    await page.locator("#explorer-index").isHidden(),
    "Escape clears and closes search results",
  );
  const topicCount = await page.locator("[data-topic-pick]").count();
  assert(topicCount > 0, "topic families and subtopic breakdowns restored");
  await page
    .locator(".knowledge-mix details")
    .first()
    .locator("summary")
    .click();
  await page.locator("[data-topic-pick]").first().click();
  assert(
    await page.evaluate(() => {
      const topic = document.querySelector("[data-topic-filter]").value;
      const episodes = new Set(
        JSON.parse(document.querySelector("#topic-membership").textContent)[
          topic
        ],
      );
      const nodes = new Map(
        JSON.parse(
          document.querySelector("#knowledge-data").textContent,
        ).nodes.map((node) => [node.id, node]),
      );
      const matches = [
        ...document.querySelectorAll("[data-index-node]"),
      ].filter((row) => !row.hidden);
      return (
        matches.length > 0 &&
        matches.every((row) =>
          episodes.has(nodes.get(row.dataset.indexNode).episodeId),
        )
      );
    }),
    "topic breakdown links filter to matching source episodes",
  );
  await page.locator("#explorer-search").press("Escape");
  await page.locator("[data-list-toggle]").click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(150);
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth === innerWidth,
    ),
    "mobile has no horizontal overflow",
  );
  await page.locator("#explorer-search").fill("graph memory");
  assert(
    await page
      .locator("[data-index-node]:visible")
      .first()
      .evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top >= 0 && rect.top < innerHeight;
      }),
    "mobile search results appear in the current viewport",
  );
  await page.locator("#explorer-search").press("Enter");
  assert(
    await page.locator("[data-explorer-detail]").isVisible(),
    "Enter opens the first search result",
  );

  await page.screenshot({ path: "/tmp/graph-explorer-mobile.png" });
  const direct = await browser.newPage({ reducedMotion: "reduce" });
  await direct.goto(`${base}/graph/?node=canonical%3Agraph-memory`, {
    waitUntil: "networkidle",
  });
  assert(
    (await direct.locator("#explorer-detail-title").textContent()) ===
      "Graph memory",
    "direct shared selection works with reduced motion",
  );
  await direct.close();
  const failed = await browser.newPage();
  await failed.route("**/details.json", (route) => route.abort());
  await failed.goto(`${base}/graph/`, { waitUntil: "networkidle" });
  await failed.locator("#explorer-search").fill("shared graph memory");
  await failed.locator("[data-index-node]:visible a").first().click();
  await failed.waitForFunction(() =>
    document
      .querySelector("[data-detail-content]")
      ?.textContent.includes("Source excerpts could not load"),
  );
  assert(
    (await failed.locator(".connection-list button").count()) > 0,
    "failed evidence retains navigation and source fallback",
  );
  await failed.close();
  const plain = await browser.newPage({ javaScriptEnabled: false });
  await plain.goto(`${base}/graph/`);
  assert(
    (await plain.locator("[data-index-node]:visible").count()) === count,
    "no-JavaScript archive remains browsable",
  );
  await plain.close();
  assert(errors.length === 0, "no uncaught browser errors");
} finally {
  console.log(JSON.stringify(checks, null, 2));
  writeFileSync(
    "/tmp/graph-explorer-browser-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
