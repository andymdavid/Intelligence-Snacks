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
      return (
        segments ===
        model.allConnections.filter(
          (edge) =>
            ![
              "contains",
              "hosted-by",
              "features",
              "hosted",
              "contributed-to",
              "contributed",
              "develops",
              "publishes",
            ].includes(edge.relationshipType),
        ).length
      );
    }),
    "default map renders idea connections without source-link clutter",
  );
  await page.locator("[data-source-links]").check();
  assert(
    await page.evaluate(() => {
      const model = JSON.parse(
        document.querySelector("#knowledge-data").textContent,
      );
      return (
        [...document.querySelectorAll("[data-explorer-svg] path")].reduce(
          (sum, p) => sum + (p.getAttribute("d")?.match(/M/g)?.length || 0),
          0,
        ) === model.allConnections.length
      );
    }),
    "source links can be restored without losing any connections",
  );
  await page.locator("[data-source-links]").uncheck();
  assert(
    (await page.locator("[data-concept-pick]:visible").count()) === 10,
    "ten reviewed cross-episode hubs available as landmarks",
  );
  assert(
    (await page.locator("[data-index-node]").count()) === count,
    "complete accessible archive index",
  );
  await page.locator("#explorer-search").fill("graph memory");
  assert(
    (await page
      .locator("[data-index-node]:visible")
      .first()
      .getAttribute("data-index-node")) === "canonical:graph-memory",
    "exact shared-idea title ranks before incidental summary matches",
  );
  await page.locator("#explorer-search").press("Escape");
  await page.locator("[data-topic-filter]").selectOption("bitcoin");
  await page.waitForTimeout(400);
  const filteredCount = await page.locator("[data-node]:visible").count();
  assert(
    filteredCount > 0 && filteredCount < count,
    "topic selection visibly narrows map nodes",
  );
  assert(
    new URL(page.url()).searchParams.get("topic") === "bitcoin",
    "topic scope is shareable in the address",
  );
  await page.reload();
  assert(
    (await page.locator("[data-topic-filter]").inputValue()) === "bitcoin" &&
      (await page.locator("[data-node]:visible").count()) === filteredCount,
    "reloading preserves topic map scope",
  );
  await page.locator("[data-clear-topic]").click();
  await page.waitForTimeout(400);
  assert(
    (await page.locator("[data-node]:visible").count()) === count,
    "clearing topic restores full map",
  );
  await page.goBack();
  assert(
    (await page.locator("[data-topic-filter]").inputValue()) === "bitcoin" &&
      (await page.locator("[data-node]:visible").count()) === filteredCount,
    "browser Back restores topic and visible nodes",
  );
  await page.locator("[data-overview]").click();
  await page.waitForTimeout(400);
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
  assert(
    await page.locator("[data-mix-chart]").isVisible(),
    "Knowledge mix donut renders before opening a row",
  );
  assert(
    await page.evaluate(() => {
      const rows = [...document.querySelectorAll("[data-topic-family]")];
      return (
        rows.length > 0 &&
        rows.every(
          (row) =>
            !row.open &&
            row.querySelector("[data-topic-bar]").checkVisibility(),
        )
      );
    }),
    "all family bars remain visible with breakdowns collapsed",
  );
  assert(
    await page.evaluate(() => {
      const segments = [...document.querySelectorAll("[data-topic-segment]")];
      const total = segments.reduce(
        (sum, segment) => sum + Number(segment.dataset.share),
        0,
      );
      return (
        Math.abs(total - 1) < 1e-8 &&
        segments.every((segment) => {
          const width = parseFloat(
            document.querySelector(
              `[data-topic-bar="${segment.dataset.topicSegment}"]`,
            ).style.width,
          );
          return Math.abs(width - Number(segment.dataset.share) * 100) < 0.001;
        })
      );
    }),
    "donut and family bars represent identical primary-topic shares summing to 100 percent",
  );
  const chartLink = page.locator("[data-topic-chart-link]").last();
  await chartLink.focus();
  await page.keyboard.press("Enter");
  const chartTopic = await chartLink.getAttribute("data-topic-chart-link");
  assert(
    await page
      .locator(`[data-topic-family="${chartTopic}"]`)
      .evaluate((row) => row.open),
    "keyboard chart selection opens the corresponding breakdown",
  );
  await page.locator(`[data-topic-family="${chartTopic}"] summary`).click();
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
      const ids = new Set(
        [...nodes.values()]
          .filter((node) => episodes.has(node.episodeId))
          .map((node) => node.id),
      );
      const model = JSON.parse(
        document.querySelector("#knowledge-data").textContent,
      );
      for (const edge of model.allConnections)
        if (
          nodes.get(edge.sourceId)?.kind === "canonical" &&
          ids.has(edge.targetId)
        )
          ids.add(edge.sourceId);
      const visible = [...document.querySelectorAll("[data-node]")].filter(
        (node) => node.getAttribute("display") !== "none",
      );
      return (
        matches.length > 0 &&
        matches.every((row) => ids.has(row.dataset.indexNode)) &&
        visible.length === ids.size &&
        visible.every((node) => ids.has(node.dataset.node))
      );
    }),
    "topic breakdown filters both map and results to matching episodes and linked hubs",
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
  assert(
    (await page.locator("[data-mix-chart]").isVisible()) &&
      (await page.locator("[data-topic-bar]").first().isVisible()),
    "mobile chart and collapsed family bars render",
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
  assert(
    (await plain.locator("[data-mix-chart]").isVisible()) &&
      (await plain.locator("[data-topic-bar]").first().isVisible()),
    "Knowledge mix donut and family bars remain visible without JavaScript",
  );
  await plain.close();
  const scoped = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  scoped.on("pageerror", (e) => errors.push(e.message));
  await scoped.goto(`${base}/graph/`);
  const journey = await scoped.evaluate(() => {
    const model = JSON.parse(
        document.querySelector("#knowledge-data").textContent,
      ),
      byId = new Map(model.nodes.map((n) => [n.id, n]));
    const membership = JSON.parse(
      document.querySelector("#topic-membership").textContent,
    );
    for (const [topic, episodes] of Object.entries(membership)) {
      const ids = new Set(episodes);
      for (const hub of model.nodes.filter((n) => n.kind === "canonical")) {
        const mentions = model.allConnections
          .filter((e) => e.sourceId === hub.id)
          .map((e) => byId.get(e.targetId));
        const outside = mentions.find((n) => !ids.has(n.episodeId));
        if (outside && mentions.some((n) => ids.has(n.episodeId)))
          return {
            topic,
            hub: hub.id,
            target: outside.id,
            title: outside.title,
          };
      }
    }
  });
  assert(
    !!journey,
    "reviewed hubs expose source discussions across topic scopes",
  );
  await scoped.goto(
    `${base}/graph/?topic=${journey.topic}&node=${journey.hub}`,
  );
  await scoped.waitForSelector("#explorer-detail-title");
  assert(
    (await scoped.locator("[data-detail-content]").textContent()).includes(
      "Outside this topic selection",
    ),
    "out-of-scope connections announce that they open across the archive",
  );
  await scoped
    .getByRole("button", { name: journey.title, exact: true })
    .click();
  assert(
    (await scoped.locator("[data-topic-filter]").inputValue()) === "" &&
      new URL(scoped.url()).searchParams.get("node") === journey.target,
    "following an outside source visibly clears topic scope",
  );
  await scoped.goBack();
  assert(
    (await scoped.locator("[data-topic-filter]").inputValue()) ===
      journey.topic &&
      new URL(scoped.url()).searchParams.get("node") === journey.hub,
    "Back restores the scoped shared concept after an outside connection",
  );
  await scoped.locator("[data-source-links]").check();
  await scoped.reload();
  assert(
    (await scoped.locator("[data-source-links]").isChecked()) &&
      new URL(scoped.url()).searchParams.get("context") === "all",
    "source-link choice is preserved by shared URLs and reload",
  );
  await scoped.close();
  assert(errors.length === 0, "no uncaught browser errors");
} finally {
  console.log(JSON.stringify(checks, null, 2));
  writeFileSync(
    "/tmp/graph-explorer-browser-results.json",
    JSON.stringify({ checks, errors }, null, 2),
  );
  await browser.close();
}
