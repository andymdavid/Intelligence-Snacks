import { chromium } from "playwright-core";
import { spawnSync } from "node:child_process";
const base = process.env.AGENT_PREVIEW_URL || "http://127.0.0.1:8796";
const checks = [];
const assert = (ok, name) => {
  checks.push({ name, ok: !!ok });
  if (!ok) throw new Error(name);
};
const get = async (path) => {
  const r = await fetch(new URL(path, base));
  assert(r.ok, `GET ${path}`);
  return r;
};
const browser = await chromium.launch({
  executablePath: process.env.GRAPH_CHROMIUM_EXECUTABLE,
  headless: true,
  args: ["--no-sandbox"],
});
try {
  const response = await get("/api/knowledge/v1/index.json");
  const index = await response.json();
  assert(
    response.headers.get("content-type")?.includes("json"),
    "index is served as JSON",
  );
  assert(
    response.headers.get("access-control-allow-origin") === "*",
    "public research JSON supports cross-origin GET",
  );
  assert(
    index.counts.ideas === 47 &&
      index.counts.observations === 526 &&
      index.counts.publishedIdeaPages === 8,
    "index advertises actual accepted coverage and published guide scope",
  );
  assert(
    response.headers.get("x-robots-tag") === "noindex",
    "machine exports leave search indexing to canonical HTML pages",
  );
  const unknown = await fetch(
    new URL("/api/knowledge/v1/ideas/not-a-real-theme.json", base),
  );
  assert(unknown.status === 404, "unknown record returns 404");
  const post = await fetch(new URL("/api/knowledge/v1/index.json", base), {
    method: "POST",
  });
  assert(post.status === 405, "research interface rejects writes");
  const noJS = await browser.newPage({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 1000 },
  });
  const sitemap = await (await get("/sitemap.xml")).text(),
    llms = await (await get("/llms.txt")).text();
  for (const entry of index.entries.filter(
    (e) => e.kind === "shared-idea" && e.citationUrl,
  )) {
    const path = new URL(entry.citationUrl).pathname;
    await noJS.goto(new URL(path, base).href, { waitUntil: "networkidle" });
    assert(
      (await noJS.locator("h1").textContent()) === entry.title,
      `${entry.title} is readable without JavaScript`,
    );
    assert(
      (await noJS.locator('link[rel="canonical"]').getAttribute("href")) ===
        entry.citationUrl,
      `${entry.title} has its own canonical URL`,
    );
    assert(
      (await noJS.locator(".idea-source").count()) >= 2,
      `${entry.title} exposes multiple source discussions`,
    );
    const schemas = await noJS
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    assert(
      schemas.some((s) => JSON.parse(s)["@type"] === "Article"),
      `${entry.title} has matching article metadata`,
    );
    assert(
      sitemap.includes(entry.citationUrl) && llms.includes(entry.citationUrl),
      `${entry.title} appears in discovery indexes`,
    );
    const record = await (await get(new URL(entry.url).pathname)).json();
    assert(
      record.id === entry.id.slice(10) &&
        record.contentRevision === index.contentRevision,
      `${entry.title} record and index agree`,
    );
    for (const source of record.sources) {
      const r = await (
        await get(new URL(source.observation.recordUrl).pathname)
      ).json();
      assert(
        r.id === source.observation.id &&
          r.transcriptRevisionId === source.observation.transcriptRevisionId,
        "source record preserves its identity and transcript revision",
      );
    }
    const quotes = await noJS
      .locator(".idea-source blockquote footer>a")
      .evaluateAll((as) => as.map((a) => a.href));
    for (const url of quotes) {
      const parsed = new URL(url);
      await noJS.goto(new URL(parsed.pathname, base).href, {
        waitUntil: "domcontentloaded",
      });
      if (parsed.hash)
        assert(
          (await noJS.locator(parsed.hash).count()) === 1,
          "cited transcript turn exists",
        );
    }
    const text = await (await get(`${path.slice(0, -1)}.md`)).text();
    assert(
      text.includes(entry.title) && text.includes(entry.citationUrl),
      "plain text retains title and canonical citation",
    );
  }
  for (const slug of ['attention-bottleneck', 'bounded-authority', 'mature-tool-reuse']) {
    await noJS.goto(new URL(`/ideas/${slug}/`, base).href);
    await noJS.setViewportSize({ width: 390, height: 844 });
    assert(await noJS.locator('.reading-notes h2').count() === 3, `${slug} has a question-led reading guide`);
    assert(await noJS.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${slug} fits mobile width`);
    const references = await noJS.locator('.reading-citations a').evaluateAll(as => as.map(a => a.hash));
    for (const hash of references) assert(await noJS.locator(hash).count() === 1, `${slug} reading note resolves to its evidence`);
    if (slug === 'attention-bottleneck') assert((await noJS.locator('.idea-source cite').allTextContents()).includes('Multiple speakers — see transcript'), 'mixed-speaker passage has neutral attribution');
    await noJS.screenshot({ path: `/tmp/agent-${slug}-mobile.png` });
  }
  await noJS.setViewportSize({ width: 1440, height: 1000 });
  const searchPage = await browser.newPage();
  await searchPage.goto(new URL('/search/?q=bounded%20authority', base).href, { waitUntil: 'networkidle' });
  assert(await searchPage.locator('.search-result[href="/ideas/bounded-authority/"]').count() === 1, 'ordinary archive search finds the new authority guide');
  await searchPage.close();
  await noJS.goto(new URL("/ideas/graph-memory/", base).href);
  await noJS.screenshot({ path: "/tmp/agent-guide-desktop.png" });
  await noJS.setViewportSize({ width: 390, height: 844 });
  await noJS.screenshot({ path: "/tmp/agent-guide-mobile.png" });
  assert(
    await noJS.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "mobile guide has no horizontal overflow",
  );
  await noJS.goto(new URL("/for-agents/", base).href);
  assert(
    (await noJS.locator("h1").textContent()) === "Follow the evidence.",
    "agent documentation renders",
  );
  assert(
    await noJS.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "mobile agent docs have no page overflow",
  );
  const client = spawnSync(
    process.execPath,
    ["public/agents/research.mjs", "persistent agent work", base],
    { encoding: "utf8" },
  );
  assert(
    client.status === 0,
    "reference client runs against deployed-style server",
  );
  const result = JSON.parse(client.stdout);
  assert(
    result.results.length > 0 &&
      result.results.some((r) => r.sources.some((s) => s.evidence.length > 0)),
    "reference client returns source-backed results",
  );
  const graph = await browser.newPage({ reducedMotion: "reduce" });
  await graph.goto(new URL("/graph/?node=canonical:graph-memory", base).href, {
    waitUntil: "networkidle",
  });
  assert(
    (await graph
      .locator('[data-detail-content] a[href="/ideas/graph-memory/"]')
      .count()) === 1,
    "graph selection links to its pilot reading page",
  );
  await graph.close();
  const theme = await (
    await get("/api/knowledge/v1/ideas/graph-memory.json")
  ).json();
  const episodePath = new URL(theme.sources[0].observation.episode.url)
    .pathname;
  await noJS.goto(new URL(episodePath, base).href);
  assert(
    (await noJS
      .locator(
        '.episode-shared-ideas a[href="https://intelligencesnacks.com/ideas/graph-memory/"]',
      )
      .count()) === 1,
    "source episode links to the related pilot guide",
  );
  console.log(
    JSON.stringify(
      { checks: checks.length, failures: checks.filter((c) => !c.ok) },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
