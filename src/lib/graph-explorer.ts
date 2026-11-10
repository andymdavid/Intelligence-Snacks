import {
  positionArchive,
  type ExplorerNode,
  type PositionedNode,
} from "./graph-explorer-layout";
type Edge = {
  sourceId: string;
  targetId: string;
  relationshipType: string;
  explanation?: string;
  reviewMethod?: string;
  reviewer?: string;
  reviewedAt?: string;
};
type Evidence = {
  excerpt: string;
  speaker?: string;
  sourceHref?: string;
  timestamp?: string;
};
import {
  rankArchive,
  topicVisibleIds,
  connectionVisible,
  structuralRelationships as structural,
} from "./graph-explorer-discovery";
export function initialiseExplorer() {
  const data = document.querySelector("#knowledge-data");
  if (!data) return;
  const model = JSON.parse(data.textContent || "{}") as {
    nodes: ExplorerNode[];
    allConnections: Edge[];
  };
  const nodes = positionArchive(model.nodes, model.allConnections),
    byId = new Map(nodes.map((node) => [node.id, node]));
  const edges = model.allConnections.filter(
    (edge) => byId.has(edge.sourceId) && byId.has(edge.targetId),
  );
  const $ = <T extends Element = HTMLElement>(selector: string) =>
    document.querySelector<T>(selector)!;
  const map = $("[data-explorer-map]"),
    svg = $<SVGSVGElement>("[data-explorer-svg]"),
    stage = $(".explorer-stage"),
    panel = $<HTMLElement>("[data-explorer-detail]"),
    content = $("[data-detail-content]"),
    search = $<HTMLInputElement>("#explorer-search"),
    index = $<HTMLElement>("#explorer-index"),
    tooltip = $<HTMLElement>("[data-tooltip]"),
    status = $("[data-explorer-status]");
  const topicFilter = $<HTMLSelectElement>("[data-topic-filter]");
  const sourceLinks = $<HTMLInputElement>("[data-source-links]");
  const membership = JSON.parse(
    $("#topic-membership").textContent || "{}",
  ) as Record<string, string[]>;
  let visibleIds = new Set(nodes.map((node) => node.id)),
    scopeRevision = 0;
  let expandedConcepts = false;
  function updateConceptBrowser() {
    const buttons = [
      ...document.querySelectorAll<HTMLButtonElement>("[data-concept-pick]"),
    ];
    buttons.forEach(
      (button) =>
        (button.hidden = !visibleIds.has(button.dataset.conceptPick!)),
    );
    const toggle = $<HTMLButtonElement>("[data-concepts-toggle]");
    toggle.textContent = "Shared ideas";
    toggle.setAttribute("aria-expanded", String(expandedConcepts));
    $(".explorer-concepts").toggleAttribute("hidden", !expandedConcepts);
  }
  function applyScope() {
    visibleIds = topicVisibleIds(
      nodes,
      edges,
      topicFilter.value
        ? new Set(membership[topicFilter.value] || [])
        : undefined,
    );
    scopeRevision++;
    hovered = null;
    tooltip.hidden = true;
    for (const node of nodes) {
      const group = dotElements.get(node.id)!;
      attribute(group, "display", visibleIds.has(node.id) ? "" : "none");
      attribute(
        group,
        "tabindex",
        visibleIds.has(node.id) && ["episode", "canonical"].includes(node.kind)
          ? "0"
          : "-1",
      );
    }
    updateConceptBrowser();
    $("[data-concept-empty]").toggleAttribute(
      "hidden",
      nodes.some(
        (node) => node.kind === "canonical" && visibleIds.has(node.id),
      ),
    );
    const ideaCount = edges.filter(
      (edge) =>
        visibleIds.has(edge.sourceId) &&
        visibleIds.has(edge.targetId) &&
        !structural.has(edge.relationshipType),
    ).length;
    $("[data-map-count]").textContent =
      `${visibleIds.size} nodes · ${ideaCount} idea connections`;
    $("[data-clear-topic]").toggleAttribute("hidden", !topicFilter.value);
    $("[data-scope-description]").textContent = topicFilter.value
      ? `Episodes covering ${topicFilter.selectedOptions[0]!.textContent}. Ideas retain their source episode's membership; this is not a topic label for every claim.`
      : "All published nodes. Source links show episode membership and speaker attribution, rather than idea relationships.";
  }
  const ns = "http://www.w3.org/2000/svg";
  function s<K extends keyof SVGElementTagNameMap>(
    tag: K,
    attributes: Record<string, string> = {},
  ) {
    const el = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes))
      el.setAttribute(name, value);
    return el;
  }
  // Avoid invalidating SVG paint for attributes whose values have not changed.
  const attributes = new WeakMap<Element, Map<string, string>>();
  function attribute(element: Element, name: string, value: string) {
    let cache = attributes.get(element);
    if (!cache) attributes.set(element, (cache = new Map()));
    if (cache.get(name) === value) return;
    cache.set(name, value);
    element.setAttribute(name, value);
  }
  function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    text = "",
    className = "",
  ) {
    const item = document.createElement(tag);
    item.textContent = text;
    if (className) item.className = className;
    return item;
  }
  const world = s("g"),
    lines = s("g"),
    dots = s("g"),
    labels = s("g", { "pointer-events": "none" });
  world.append(lines, dots, labels);
  svg.append(world);
  const incident = new Map(nodes.map((node) => [node.id, [] as Edge[]]));
  for (const edge of edges) {
    incident.get(edge.sourceId)!.push(edge);
    incident.get(edge.targetId)!.push(edge);
  }
  // Batch connections by visual state rather than repainting thousands of SVG lines.
  const edgeSegments = edges.map((edge) => {
    const source = byId.get(edge.sourceId)!,
      target = byId.get(edge.targetId)!;
    return `M${source.x},${source.y}L${target.x},${target.y}`;
  });
  const edgePaths = new Map<string, SVGPathElement>();
  for (const kind of ["context", "idea"]) {
    for (const state of ["background", "active", "hover"]) {
      const path = s("path", {
        fill: "none",
        stroke: kind === "context" ? "#d9dcd7" : "#9caaa4",
        "stroke-width": state === "active" ? "1.4" : ".7",
        "vector-effect": "non-scaling-stroke",
        "pointer-events": "none",
      });
      lines.append(path);
      edgePaths.set(`${kind}:${state}`, path);
    }
  }
  const dotElements = new Map<string, SVGGElement>();
  const labelElements = new Map<string, SVGTextElement>();
  const hitElements = new Map<string, SVGCircleElement>();
  const circleElements = new Map<string, SVGCircleElement>();
  let selected: string | null = null,
    hovered: string | null = null,
    camera = { x: 0, y: 0, k: 0.4 },
    width = 1,
    height = 1,
    animation = 0;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let detailsPromise: Promise<
    Record<string, { evidence: Evidence[]; reviewMethod?: string }>
  > | null = null;
  const selectedNeighbours = () =>
    new Set(
      selected
        ? [
            selected,
            ...incident
              .get(selected)!
              .map((edge) =>
                edge.sourceId === selected ? edge.targetId : edge.sourceId,
              )
              .filter((id) => visibleIds.has(id)),
          ]
        : [],
    );
  for (const node of nodes) {
    const group = s("g", {
      "data-node": node.id,
      transform: `translate(${node.x},${node.y})`,
      tabindex:
        node.kind === "episode" || node.kind === "canonical" ? "0" : "-1",
      role: "button",
      "aria-label": node.title,
    });
    const hit = s("circle", { r: "12", fill: "transparent", "data-hit": "" });
    const circle = s("circle", {
      r: String(node.radius),
      fill: node.colour,
      stroke: "white",
      "stroke-width": "1",
      "vector-effect": "non-scaling-stroke",
      "pointer-events": "none",
    });
    group.append(hit, circle);
    hitElements.set(node.id, hit);
    circleElements.set(node.id, circle);
    dots.append(group);
    dotElements.set(node.id, group);
    const label = s("text", {
      fill: "#171c18",
      "font-family": "Neue Montreal, Arial, sans-serif",
      "font-weight": "500",
      "paint-order": "stroke",
      stroke: "white",
      "stroke-linejoin": "round",
      "data-label": node.id,
    });
    label.textContent =
      node.title.length > 35 ? node.title.slice(0, 33) + "…" : node.title;
    labels.append(label);
    labelElements.set(node.id, label);
    group.addEventListener("click", (event) => {
      event.stopPropagation();
      select(node.id, true);
    });
    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(node.id, true);
      }
    });
    group.addEventListener("pointerenter", () => {
      hovered = node.id;
      schedulePaint();
    });
    group.addEventListener("pointermove", (event) => {
      tooltip.hidden = false;
      tooltip.textContent = node.title;
      const bounds = map.getBoundingClientRect();
      tooltip.style.left = `${Math.max(0, Math.min(width - 270, event.clientX - bounds.left + 14))}px`;
      tooltip.style.top = `${Math.max(0, Math.min(height - 65, event.clientY - bounds.top + 15))}px`;
    });
    group.addEventListener("pointerleave", () => {
      hovered = null;
      tooltip.hidden = true;
      schedulePaint();
    });
  }
  let paintedSelected: string | null | undefined,
    paintedHovered: string | null | undefined,
    related = new Set<string>(),
    hoverRelated: Set<string> | null = null,
    ranked = nodes,
    paintedScope = -1;
  const textMetrics = document.createElement("canvas").getContext("2d");
  const labelWidths = new Map<string, number>();
  function measureLabel(text: string, fontSize: number) {
    const key = `${fontSize}:${text}`;
    if (!labelWidths.has(key)) {
      if (textMetrics)
        textMetrics.font = `500 ${fontSize}px "Neue Montreal", Arial, sans-serif`;
      labelWidths.set(
        key,
        textMetrics
          ? textMetrics.measureText(text).width
          : text.length * fontSize * 0.6,
      );
    }
    return labelWidths.get(key)!;
  }
  let pendingPaint = 0;
  function schedulePaint() {
    if (!pendingPaint)
      pendingPaint = requestAnimationFrame(() => {
        pendingPaint = 0;
        paint();
      });
  }
  function paint() {
    attribute(
      world,
      "transform",
      `translate(${width / 2 - camera.x * camera.k},${height / 2 - camera.y * camera.k}) scale(${camera.k})`,
    );
    const focusChanged =
      selected !== paintedSelected ||
      hovered !== paintedHovered ||
      paintedScope !== scopeRevision;
    if (focusChanged) {
      paintedScope = scopeRevision;
      paintedSelected = selected;
      paintedHovered = hovered;
      related = selectedNeighbours();
      hoverRelated = hovered
        ? new Set([
            hovered,
            ...incident
              .get(hovered)!
              .map((edge) =>
                edge.sourceId === hovered ? edge.targetId : edge.sourceId,
              ),
          ])
        : null;
      const batches = new Map<string, string[]>();
      edges.forEach((edge, i) => {
        const touchesSelection =
          !!selected &&
          (edge.sourceId === selected || edge.targetId === selected);
        if (
          !connectionVisible(
            edge,
            visibleIds,
            sourceLinks.checked || touchesSelection,
          )
        )
          return;
        const kind = structural.has(edge.relationshipType) ? "context" : "idea";
        const state =
          selected && (edge.sourceId === selected || edge.targetId === selected)
            ? "active"
            : hovered &&
                (edge.sourceId === hovered || edge.targetId === hovered)
              ? "hover"
              : "background";
        const key = `${kind}:${state}`;
        if (!batches.has(key)) batches.set(key, []);
        batches.get(key)!.push(edgeSegments[i]!);
      });
      for (const [key, path] of edgePaths) {
        attribute(path, "d", (batches.get(key) || []).join(""));
        attribute(
          path,
          "stroke",
          key.endsWith(":active")
            ? key.startsWith("context:")
              ? "#738a80"
              : "#386d60"
            : key.startsWith("context:")
              ? "#b6c2bb"
              : "#829b90",
        );
        attribute(
          path,
          "opacity",
          key.endsWith(":active")
            ? "1"
            : key.endsWith(":hover")
              ? ".65"
              : selected
                ? ".07"
                : key.startsWith("context:")
                  ? ".10"
                  : hovered
                    ? ".025"
                    : ".32",
        );
      }
      ranked = [...nodes].sort(
        (a, b) =>
          Number(b.id === selected || b.id === hovered) -
            Number(a.id === selected || a.id === hovered) ||
          Number(related.has(b.id)) - Number(related.has(a.id)) ||
          Number(b.kind === "canonical") - Number(a.kind === "canonical") ||
          Number(b.kind === "episode") - Number(a.kind === "episode") ||
          (b.degree || 0) - (a.degree || 0),
      );
    }
    const placed: { x: number; y: number; w: number; h: number }[] = [];
    let overviewLabels = 0;
    const overview = !selected && camera.k < 0.65;
    const labelBudget = width < 600 ? 6 : 14;
    for (const node of ranked) {
      const group = dotElements.get(node.id)!,
        label = labelElements.get(node.id)!;
      if (!visibleIds.has(node.id)) {
        attribute(label, "display", "none");
        continue;
      }
      const isFocus = node.id === selected || node.id === hovered;
      const active = related.has(node.id);
      if (focusChanged)
        attribute(
          group,
          "opacity",
          selected && !active
            ? ".12"
            : hoverRelated && !hoverRelated.has(node.id)
              ? ".35"
              : !sourceLinks.checked &&
                  ["root", "host", "contributor"].includes(node.kind) &&
                  !isFocus
                ? ".2"
                : "1",
        );
      attribute(
        hitElements.get(node.id)!,
        "r",
        String(Math.max(node.radius, 8 / camera.k)),
      );
      attribute(
        circleElements.get(node.id)!,
        "r",
        String(isFocus ? Math.max(node.radius, 7 / camera.k) : node.radius),
      );
      const sx = (node.x - camera.x) * camera.k + width / 2,
        sy = (node.y - camera.y) * camera.k + height / 2;
      const eligible =
        isFocus ||
        (selected
          ? active
          : node.kind === "canonical" ||
            (node.kind === "episode" && (!overview || sourceLinks.checked)) ||
            (camera.k > 1.05 && node.kind === "concept"));
      if (
        !eligible ||
        (overview && !isFocus && overviewLabels >= labelBudget)
      ) {
        attribute(label, "display", "none");
        continue;
      }
      const text =
        node.title.length > 35 ? node.title.slice(0, 33) + "…" : node.title;
      const fontSize = isFocus ? 14 : 12;
      const labelWidth = measureLabel(text, fontSize);
      const gap = Math.max(node.radius * camera.k, 5) + 7;
      // Try both sides and vertical placements before hiding a colliding label.
      const candidates = [
        { x: sx + gap, y: sy - 9 },
        { x: sx - gap - labelWidth, y: sy - 9 },
        { x: sx - labelWidth / 2, y: sy - gap - 18 },
        { x: sx - labelWidth / 2, y: sy + gap },
      ];
      const position = candidates.find(
        (p) =>
          p.x > 5 &&
          p.x + labelWidth < width - 5 &&
          p.y > 50 &&
          p.y + 18 < height - 65 &&
          !placed.some(
            (other) =>
              p.x < other.x + other.w + 10 &&
              p.x + labelWidth + 10 > other.x &&
              p.y < other.y + other.h + 5 &&
              p.y + 18 + 5 > other.y,
          ),
      );
      const visible =
        eligible &&
        !!position &&
        (isFocus || !overview || overviewLabels < labelBudget);
      attribute(label, "display", visible ? "" : "none");
      if (visible && position) {
        placed.push({ ...position, w: labelWidth, h: 18 });
        if (!isFocus) overviewLabels++;
        attribute(
          label,
          "x",
          String((position.x - width / 2) / camera.k + camera.x),
        );
        attribute(
          label,
          "y",
          String((position.y + 13 - height / 2) / camera.k + camera.y),
        );
        attribute(label, "font-size", String(fontSize / camera.k));
        attribute(label, "stroke-width", String(4 / camera.k));
        attribute(label, "opacity", selected && !active ? ".15" : "1");
      }
    }
  }
  function move(target: typeof camera, animate = true) {
    cancelAnimationFrame(animation);
    if (!animate || reduced.matches) {
      camera = target;
      paint();
      return;
    }
    const start = { ...camera },
      time = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - time) / 340),
        e = 1 - Math.pow(1 - t, 3);
      camera = {
        x: start.x + (target.x - start.x) * e,
        y: start.y + (target.y - start.y) * e,
        k: start.k + (target.k - start.k) * e,
      };
      paint();
      if (t < 1) animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
  }
  function fit(ids?: Set<string>, animate = true) {
    const picked = nodes.filter(
      (node) => visibleIds.has(node.id) && (!ids || ids.has(node.id)),
    );
    if (!picked.length) {
      paint();
      return;
    }
    const xs = picked.map((node) => node.x),
      ys = picked.map((node) => node.y);
    const minX = Math.min(...xs) - 75,
      maxX = Math.max(...xs) + 180,
      minY = Math.min(...ys) - 100,
      maxY = Math.max(...ys) + 100;
    // Fit into the exposed graph area without changing the map's dimensions.
    const mapBounds = map.getBoundingClientRect();
    const cardBounds = panel.getBoundingClientRect();
    const phone = window.matchMedia("(max-width: 650px)").matches;
    const availableWidth =
      selected && !phone
        ? Math.max(160, cardBounds.left - mapBounds.left - 24)
        : width;
    const availableHeight =
      selected && phone
        ? Math.max(160, cardBounds.top - mapBounds.top - 20)
        : height;
    const zoom = Math.max(
      0.12,
      Math.min(
        ids ? 1.8 : 0.85,
        (availableWidth - 50) / (maxX - minX),
        (availableHeight - 80) / (maxY - minY),
      ),
    );
    move(
      {
        x: (minX + maxX) / 2 + (width - availableWidth) / 2 / zoom,
        y: (minY + maxY) / 2 + (height - availableHeight) / 2 / zoom,
        k: zoom,
      },
      animate,
    );
  }

  function updateUrl(id: string | null, push: boolean) {
    const url = new URL(location.href);
    if (id) url.searchParams.set("node", id);
    else url.searchParams.delete("node");
    if (topicFilter.value) url.searchParams.set("topic", topicFilter.value);
    else url.searchParams.delete("topic");
    if (sourceLinks.checked) url.searchParams.set("context", "all");
    else url.searchParams.delete("context");
    if (push) history.pushState({ explorer: true }, "", url);
    else history.replaceState(history.state, "", url);
  }
  function select(id: string | null, push = false) {
    if (id && !byId.has(id)) {
      status.textContent = "That idea is not in this published archive.";
      id = null;
    }
    if (id && !visibleIds.has(id)) {
      topicFilter.value = "";
      applyScope();
      filterIndex();
    }
    selected = id;
    document
      .querySelectorAll<HTMLButtonElement>("[data-concept-pick]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.conceptPick === id),
        ),
      );
    tooltip.hidden = true;
    panel.hidden = !id;
    stage.classList.toggle("has-selection", !!id);
    $("[data-map-mode]").textContent = id
      ? "Following a connection"
      : topicFilter.value
        ? `Episodes covering ${topicFilter.selectedOptions[0]!.textContent}`
        : "";
    $("[data-map-hint]").textContent = id
      ? "Select another node to keep exploring"
      : "Select a theme · zoom for episode labels";
    $<HTMLButtonElement>("[data-back]").disabled =
      !new URL(location.href).searchParams.has("node") && !id;
    updateUrl(id, push);
    width = map.clientWidth;
    height = map.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    if (id) {
      renderDetail(byId.get(id)!);
      if (window.matchMedia("(min-width: 651px)").matches && !document.fullscreenElement && !stage.classList.contains("is-fullscreen") && panel.getBoundingClientRect().top < 72) {
        stage.scrollIntoView({block:"start",behavior:"instant"});
      }
      fit(selectedNeighbours());
      status.textContent = `Selected: ${byId.get(id)!.title}`;
    } else {
      content.replaceChildren();
      fit();
      status.textContent = topicFilter.value
        ? `Showing ${visibleIds.size} nodes in episodes covering ${topicFilter.selectedOptions[0]!.textContent}`
        : "";
    }
  }
  async function renderDetail(node: PositionedNode) {
    panel.scrollTop = 0;
    content.replaceChildren();
    const displayTitle =
      node.kind === "episode"
        ? node.title.replace(/^Episode\s+\d+\s*[·:\-]\s*/i, "")
        : node.title;
    const title = el("h2", displayTitle);
    title.id = "explorer-detail-title";
    title.tabIndex = -1;
    content.append(
      el(
        "p",
        node.kind === "episode"
          ? `Episode ${node.episodeNumber}`
          : `${node.episodeNumber ? `Episode ${node.episodeNumber} · ` : ""}${node.kind === "canonical" ? (node.comparisonType === "perspectives" ? "Shared theme · different perspectives" : "Shared theme · recurring discussion") : node.kind}`,
        "eyebrow",
      ),
      title,
      ...(node.summary && node.summary.trim() !== displayTitle.trim()
        ? [el("p", node.summary, "detail-summary")]
        : []),
    );
    if (node.kind === "canonical")
      content.append(
        el(
          "p",
          `${node.episodeCount} episodes · Editorial review by Lara (agent). Follow each source to assess the distinct claims.`,
        ),
      );
    const actions = el("div", "", "detail-actions");
    if (node.href && !node.href.startsWith("/graph")) {
      const source = el(
        "a",
        node.kind === "snack" ? "Read the Snack ↗" : "Open source ↗",
        "text-link",
      );
      source.href = node.href;
      actions.append(source);
    }
    const share = el("button", "Copy idea link", "text-link");
    share.type = "button";
    share.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        share.textContent = "Link copied";
      } catch {
        status.textContent = "Copy the current address to share this idea.";
        share.textContent = "Use address bar to copy";
      }
    });
    actions.append(share);
    content.append(actions);
    const allEdges = incident.get(node.id) || [];
    const semantic = allEdges.filter(
        (edge) => !structural.has(edge.relationshipType),
      ),
      context = allEdges.filter((edge) =>
        structural.has(edge.relationshipType),
      );
    function connectionSection(list: Edge[], name: string) {
      if (!list.length) return;
      content.append(el("h3", `${name} · ${list.length}`));
      const ul = el("ul", "", "connection-list");
      const ordered = [...list].sort((a, b) => {
        const neighbour = (edge: Edge) =>
          byId.get(edge.sourceId === node.id ? edge.targetId : edge.sourceId)!;
        return (
          Number(neighbour(a).kind === "root") -
          Number(neighbour(b).kind === "root")
        );
      });
      for (const edge of ordered) {
        const target = byId.get(
          edge.sourceId === node.id ? edge.targetId : edge.sourceId,
        )!;
        const row = el("li");
        row.append(
          el(
            "span",
            structural.has(edge.relationshipType)
              ? target.kind === "episode"
                ? "Source episode"
                : ["host", "contributor"].includes(target.kind)
                  ? "Speaker"
                  : target.kind === "root"
                    ? "Archive"
                    : target.kind === "snack"
                      ? "Snack"
                      : "Observation"
              : edge.relationshipType.replaceAll("-", " "),
            "eyebrow",
          ),
        );
        const button = el("button", target.title);
        button.type = "button";
        button.addEventListener("click", () => {
          select(target.id, true);
          $("#explorer-detail-title").scrollIntoView({ block: "nearest" });
        });
        row.append(button);
        if (topicFilter.value && !visibleIds.has(target.id))
          row.append(
            el("p", "Outside this topic selection. Opens across the archive."),
          );
        if (edge.explanation) row.append(el("p", edge.explanation));
        if (edge.reviewMethod)
          row.append(
            el(
              "p",
              `Review: ${edge.reviewMethod.replaceAll("-", " ")}${edge.reviewer ? ` · ${edge.reviewer}` : ""}`,
            ),
          );
        ul.append(row);
      }
      content.append(ul);
    }
    connectionSection(semantic, "Idea connections");
    connectionSection(
      context,
      node.kind === "episode" ? "In this episode" : "Sources & people",
    );
    const evidenceSection = el("section");
    content.append(evidenceSection);
    if (node.evidenceCount) {
      evidenceSection.append(
        el("h3", "Source evidence"),
        el("p", "Loading source excerpts…"),
      );
      try {
        detailsPromise ||= fetch(new URL("details.json", location.href))
          .then((response) => {
            if (!response.ok) throw new Error("Could not load evidence");
            return response.json();
          })
          .catch((error) => {
            detailsPromise = null;
            throw error;
          });
        const details = await detailsPromise;
        if (selected !== node.id) return;
        const record = details[node.id];
        evidenceSection.replaceChildren(el("h3", "Source evidence"));
        if (record?.reviewMethod)
          evidenceSection.append(el("p", record.reviewMethod));
        for (const evidence of record?.evidence || []) {
          const quote = el("blockquote");
          const excerpt = el(
            "span",
            evidence.excerpt.length > 600
              ? evidence.excerpt.slice(0, 600) + "…"
              : evidence.excerpt,
          );
          quote.append(excerpt);
          if (evidence.excerpt.length > 600) {
            const expand = el("button", "Show full excerpt", "text-link");
            expand.type = "button";
            expand.addEventListener("click", () => {
              const full = expand.textContent === "Show full excerpt";
              excerpt.textContent = full
                ? evidence.excerpt
                : evidence.excerpt.slice(0, 600) + "…";
              expand.textContent = full ? "Show less" : "Show full excerpt";
            });
            quote.append(expand);
          }
          quote.append(
            el("cite", evidence.speaker || "Speaker not identified"),
          );
          if (evidence.sourceHref) {
            const a = el(
              "a",
              evidence.timestamp
                ? `Read transcript at ${evidence.timestamp} ↗`
                : "Read source transcript ↗",
            );
            a.href = evidence.sourceHref;
            quote.append(a);
          }
          evidenceSection.append(quote);
        }
        if (!record?.evidence?.length)
          evidenceSection.append(
            el(
              "p",
              "No source excerpt is available for this record. Open its source to read the discussion.",
            ),
          );
      } catch {
        if (selected === node.id)
          evidenceSection.replaceChildren(
            el("h3", "Source evidence"),
            el(
              "p",
              "Source excerpts could not load. Open the source above, or select this idea again to retry.",
            ),
          );
      }
    }
    if (selected !== node.id) return;
    if (node.kind === "canonical")
      content.append(
        el("p", "Select a linked discussion to inspect its source evidence."),
      );
    if (!allEdges.length)
      content.append(el("p", "No recorded connections yet."));
  }
  const rows = [...document.querySelectorAll<HTMLElement>("[data-index-node]")];
  function showIndex(show: boolean) {
    index.hidden = !show;
    $("[data-list-toggle]").setAttribute("aria-expanded", String(show));
  }
  function filterIndex() {
    const words = search.value.trim().split(/\s+/).filter(Boolean);
    const episodeIds = topicFilter.value
      ? new Set(membership[topicFilter.value] || [])
      : null;
    const ordered = rankArchive(nodes, search.value).filter((node) =>
      visibleIds.has(node.id),
    );
    const matching = new Set(ordered.map((node) => node.id));
    for (const row of rows) row.hidden = !matching.has(row.dataset.indexNode!);
    const byRow = new Map(rows.map((row) => [row.dataset.indexNode!, row]));
    const list = $("#explorer-results");
    const fragment = document.createDocumentFragment();
    for (const node of ordered) fragment.append(byRow.get(node.id)!);
    list.append(fragment);
    list.scrollTop = 0;
    const count = ordered.length;
    showIndex(!!words.length || !!episodeIds);
    const label = `${count} ${count === 1 ? "result" : "results"}`;
    $("[data-result-count]").textContent = label;
    $("[data-search-status]").textContent =
      words.length || episodeIds
        ? `${label}${episodeIds ? " in episodes covering " + topicFilter.selectedOptions[0]!.textContent : ""}${count ? ". Select a result to explore it." : ". Try another search or topic."}`
        : "";
    status.textContent = `${count} matching archive records`;
  }
  search.addEventListener("input", () => {
    filterIndex();
    if (!index.hidden)
      search.scrollIntoView({ block: "start", behavior: "instant" });
  });
  function changeTopic() {
    applyScope();
    filterIndex();
    select(null, true);
  }
  topicFilter.addEventListener("change", changeTopic);
  $("[data-clear-topic]").addEventListener("click", () => {
    topicFilter.value = "";
    changeTopic();
  });
  sourceLinks.addEventListener("change", () => {
    scopeRevision++;
    paint();
    updateUrl(selected, true);
  });
  $("[data-concepts-toggle]").addEventListener("click", () => {
    expandedConcepts = !expandedConcepts;
    updateConceptBrowser();
  });
  document
    .querySelectorAll<HTMLButtonElement>("[data-concept-pick]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        expandedConcepts = false;
        updateConceptBrowser();
        select(button.dataset.conceptPick!, true);
      }),
    );
  search.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (index.hidden) return;
      [...document.querySelectorAll<HTMLElement>("[data-index-node]")]
        .find((row) => !row.hidden)
        ?.querySelector<HTMLAnchorElement>("[data-pick]")
        ?.click();
    } else if (event.key === "Escape") {
      search.value = "";
      topicFilter.value = "";
      applyScope();
      filterIndex();
      select(null, true);
      showIndex(false);
    }
  });
  document
    .querySelectorAll<SVGAElement>("[data-topic-chart-link]")
    .forEach((link) => {
      const mixTooltip =
        document.querySelector<HTMLElement>("[data-mix-tooltip]");
      const showMixTooltip = () => {
        if (!mixTooltip) return;
        mixTooltip.textContent = link.dataset.topicLabel || "";
        mixTooltip.hidden = false;
        link.setAttribute("aria-describedby", "mix-tooltip");
      };
      const hideMixTooltip = () => {
        if (mixTooltip) mixTooltip.hidden = true;
        link.removeAttribute("aria-describedby");
      };
      link.addEventListener("pointerenter", showMixTooltip);
      link.addEventListener("pointerleave", hideMixTooltip);
      link.addEventListener("focus", showMixTooltip);
      link.addEventListener("blur", hideMixTooltip);
      link.addEventListener("keydown", (event) => {
        if (event.key === "Escape") hideMixTooltip();
      });
      link.addEventListener("click", (event) => {
        hideMixTooltip();
        const family = document.getElementById(
          `mix-${link.dataset.topicChartLink}`,
        ) as HTMLDetailsElement | null;
        if (!family) return;
        event.preventDefault();
        family.open = true;
        family.querySelector("summary")?.focus({ preventScroll: true });
        family.scrollIntoView({
          block: "start",
          behavior: reduced.matches ? "instant" : "smooth",
        });
      });
    });
  document
    .querySelectorAll<HTMLButtonElement>("[data-topic-pick]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        topicFilter.value = button.dataset.topicPick!;
        search.value = "";
        changeTopic();
        stage.scrollIntoView({
          block: "start",
          behavior: reduced.matches ? "instant" : "smooth",
        });
        search.focus({ preventScroll: true });
      });
    });
  document.querySelectorAll<HTMLAnchorElement>("[data-pick]").forEach((a) =>
    a.addEventListener("click", (event) => {
      event.preventDefault();
      select(a.dataset.pick!, true);
      showIndex(false);
      search.value = "";
      filterIndex();
      showIndex(false);
      $("#explorer-detail-title").focus({ preventScroll: true });
      stage.scrollIntoView({
        block: "start",
        behavior: reduced.matches ? "instant" : "smooth",
      });
    }),
  );
  $("[data-list-toggle]").addEventListener("click", () => {
    showIndex(!!index.hidden);
    if (!index.hidden)
      index.scrollIntoView({
        block: "start",
        behavior: reduced.matches ? "instant" : "smooth",
      });
  });
  $("[data-overview]").addEventListener("click", () => {
    topicFilter.value = "";
    search.value = "";
    applyScope();
    filterIndex();
    showIndex(false);
    select(null, true);
  });
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      select(null, true);
      $<HTMLButtonElement>("[data-overview]").focus({ preventScroll: true });
    }
  });
  $("[data-close]").addEventListener("click", () => {
    select(null, true);
    $<HTMLButtonElement>("[data-overview]").focus();
  });
  $("[data-back]").addEventListener("click", () => {
    if (history.state?.explorer) history.back();
    else select(null, true);
  });
  function restoreLocation() {
    const params = new URL(location.href).searchParams;
    topicFilter.value = params.get("topic") || "";
    sourceLinks.checked = params.get("context") === "all";
    search.value = "";
    applyScope();
    filterIndex();
    showIndex(false);
    select(params.get("node"));
  }
  window.addEventListener("popstate", restoreLocation);
  document
    .querySelectorAll<HTMLButtonElement>("[data-zoom]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        move({
          ...camera,
          k: Math.max(
            0.12,
            Math.min(4, camera.k * Number(button.dataset.zoom)),
          ),
        }),
      ),
    );
  svg.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      cancelAnimationFrame(animation);
      const bounds = svg.getBoundingClientRect(),
        x = event.clientX - bounds.left - width / 2,
        y = event.clientY - bounds.top - height / 2;
      const k = Math.max(
        0.12,
        Math.min(4, camera.k * Math.exp(-event.deltaY * 0.0015)),
      );
      camera = {
        x: camera.x + x / camera.k - x / k,
        y: camera.y + y / camera.k - y / k,
        k,
      };
      schedulePaint();
    },
    { passive: false },
  );
  const pointers = new Map<number, { x: number; y: number }>();
  let drag: {
      x: number;
      y: number;
      cx: number;
      cy: number;
      distance: number;
      k: number;
    } | null = null,
    moved = false;
  svg.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    cancelAnimationFrame(animation);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointers.values()];
    drag = {
      x: event.clientX,
      y: event.clientY,
      cx: camera.x,
      cy: camera.y,
      distance:
        points.length === 2
          ? Math.hypot(points[0]!.x - points[1]!.x, points[0]!.y - points[1]!.y)
          : 0,
      k: camera.k,
    };
    moved = false;
  });
  svg.addEventListener("pointermove", (event) => {
    if (!drag || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const points = [...pointers.values()],
        distance = Math.hypot(
          points[0]!.x - points[1]!.x,
          points[0]!.y - points[1]!.y,
        );
      if (drag.distance)
        camera.k = Math.max(
          0.12,
          Math.min(4, (drag.k * distance) / drag.distance),
        );
      moved = true;
    } else {
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) > 4) moved = true;
      camera.x = drag.cx - dx / camera.k;
      camera.y = drag.cy - dy / camera.k;
    }
    if (moved && !svg.hasPointerCapture(event.pointerId))
      svg.setPointerCapture(event.pointerId);
    tooltip.hidden = true;
    schedulePaint();
  });
  function release(event: PointerEvent) {
    pointers.delete(event.pointerId);
    drag = null;
    if (svg.hasPointerCapture(event.pointerId))
      svg.releasePointerCapture(event.pointerId);
  }
  svg.addEventListener("pointerup", release);
  svg.addEventListener("pointercancel", release);
  svg.addEventListener(
    "click",
    (event) => {
      if (moved) {
        event.stopImmediatePropagation();
        moved = false;
      }
    },
    { capture: true },
  );
  const fullscreenButton = $<HTMLButtonElement>("[data-fullscreen]");
  let expandedMap = false;
  let priorFocus: HTMLElement | null = null;
  const inertElements: HTMLElement[] = [];
  function syncFullscreen() {
    const active =
      document.fullscreenElement === stage ||
      stage.classList.contains("is-fullscreen");
    const fullscreenLabel = active ? "Exit fullscreen" : "Enter fullscreen";
    fullscreenButton.setAttribute("aria-label", fullscreenLabel);
    fullscreenButton.title = fullscreenLabel;
    fullscreenButton.setAttribute("aria-pressed", String(active));
    if (!active && expandedMap) {
      inertElements.splice(0).forEach((item) => (item.inert = false));
      stage.removeAttribute("role");
      stage.removeAttribute("aria-modal");
      stage.removeAttribute("aria-label");
      document.documentElement.style.overflow = priorOverflow;
      priorFocus?.focus({ preventScroll: true });
    }
    expandedMap = active;
  }
  let priorOverflow = "";
  function fallbackFullscreen() {
    stage.classList.add("is-fullscreen");
    stage.setAttribute("role", "dialog");
    stage.setAttribute("aria-modal", "true");
    stage.setAttribute("aria-label", "Archive graph");
    for (
      let element: HTMLElement | null = stage;
      element?.parentElement;
      element = element.parentElement
    ) {
      for (const sibling of element.parentElement.children) {
        if (
          sibling !== element &&
          sibling instanceof HTMLElement &&
          !sibling.inert
        ) {
          sibling.inert = true;
          inertElements.push(sibling);
        }
      }
    }
    document.documentElement.style.overflow = "hidden";
    syncFullscreen();
    fullscreenButton.focus();
  }
  async function exitFullscreen() {
    if (document.fullscreenElement === stage) await document.exitFullscreen();
    stage.classList.remove("is-fullscreen");
    syncFullscreen();
  }
  fullscreenButton.addEventListener("click", async () => {
    if (expandedMap) {
      await exitFullscreen();
      return;
    }
    priorFocus = document.activeElement as HTMLElement;
    priorOverflow = document.documentElement.style.overflow;
    try {
      if (!stage.requestFullscreen) throw new Error("Use expanded view");
      await stage.requestFullscreen();
      syncFullscreen();
      fullscreenButton.focus();
    } catch {
      fallbackFullscreen();
    }
  });
  document.addEventListener("fullscreenchange", syncFullscreen);
  stage.addEventListener(
    "keydown",
    (event) => {
      const options = $<HTMLDetailsElement>(".explorer-options");
      if (event.key === "Escape" && options.open) {
        options.open = false;
        options.querySelector<HTMLElement>("summary")?.focus();
        event.preventDefault(); event.stopPropagation(); return;
      }
      if (!expandedMap) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        void exitFullscreen();
      }
      if (event.key === "Tab" && stage.classList.contains("is-fullscreen")) {
        const focusable = [
          ...stage.querySelectorAll<HTMLElement>(
            'button, a[href], [tabindex="0"]',
          ),
        ].filter(
          (item) => item.getClientRects().length && !item.closest("[hidden]"),
        );
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    },
    { capture: true },
  );
  map.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      select(null, true);
      $<HTMLButtonElement>("[data-overview]").focus();
    }
  });
  new ResizeObserver(() => {
    width = map.clientWidth;
    height = map.clientHeight;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    if (selected) fit(selectedNeighbours(), false);
    else fit(undefined, false);
  }).observe(map);
  restoreLocation();
  document.fonts.ready.then(() => {
    labelWidths.clear();
    schedulePaint();
  });
}
