import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type FeelWindow = Window &
  typeof globalThis & {
    DCFeel?: { start: () => void; sync: () => void; destroy: () => void };
    dcDebug?: { state: () => unknown };
  };

const testDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(testDir, "../..");
const runtimePath = join(root, "public/game/game-feel.js");
const gameHtmlPath = join(root, "public/game/index.html");
const feelCssPath = join(root, "public/game/game-feel.css");

function loadRuntime() {
  const source = readFileSync(runtimePath, "utf8");
  window.eval(source);
  return (window as FeelWindow).DCFeel;
}

function setDebugState(state: unknown | (() => unknown)) {
  (window as FeelWindow).dcDebug = {
    state: typeof state === "function" ? (state as () => unknown) : () => state,
  };
}

function renderCityScene() {
  const html = readFileSync(gameHtmlPath, "utf8").replace(/\r\n?/g, "\n");
  const body = html.match(/function drawSky\(srcZone\)\{([\s\S]*?)\n  \}\n\n  function drawShop/)?.[1];
  if (!body) throw new Error("drawSky body not found");
  document.body.innerHTML = '<svg id="sky" viewBox="0 0 360 250"></svg>';
  const sky = document.querySelector("#sky") as SVGElement;
  const draw = new Function("sky", "L", "G", "ri", "FW", "ZNAMES", "srcZone", body);
  draw(
    sky,
    null,
    { li: 0 },
    (max: number) => Math.max(0, Math.floor(max / 2)),
    ["#FFC247", "#FF8FB1", "#8FE3FF"],
    ["المصانع", "وسط البلد", "السكني", "الميناء", "الجامعة"],
    null,
  );
  return sky;
}

describe("game feel presentation runtime", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main class="app">
        <section id="game"><div class="stage"></div></section>
        <div class="bubble"></div>
      </main>`;
  });

  afterEach(() => {
    (window as FeelWindow).DCFeel?.destroy();
    delete (window as FeelWindow).DCFeel;
    delete (window as FeelWindow).dcDebug;
    vi.restoreAllMocks();
  });

  it("starts once and marks every rendered stage without duplicate listeners", async () => {
    setDebugState(Object.freeze({
      G: Object.freeze({ view: "play", li: 1, mode: "learn" }),
      S: Object.freeze({ secLeft: 30 }),
      L: Object.freeze({ city: true }),
    }));
    const listenerSpy = vi.spyOn(document, "addEventListener");
    const runtime = loadRuntime();

    runtime?.start();
    runtime?.start();

    expect(listenerSpy.mock.calls.filter(([type]) => type === "click")).toHaveLength(1);
    expect(document.querySelector(".stage")).toHaveAttribute("data-feel-ready", "true");

    document.querySelector("#game")!.innerHTML = '<div class="stage"></div>';
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 0));
    expect(document.querySelector(".stage")).toHaveAttribute("data-feel-ready", "true");
  });

  it("projects stable presentation attributes from read-only gameplay state", () => {
    const state = Object.freeze({
      G: Object.freeze({ view: "why", li: 2, mode: "race" }),
      S: Object.freeze({ secLeft: 8 }),
      L: Object.freeze({ city: true }),
    });
    setDebugState(() => state);
    const runtime = loadRuntime();

    expect(() => runtime?.sync()).not.toThrow();
    expect(document.querySelector(".app")).toHaveAttribute("data-feel-view", "why");
    expect(document.querySelector(".app")).toHaveAttribute("data-feel-level", "3");
    expect(document.querySelector(".app")).toHaveAttribute("data-feel-pressure", "critical");
    expect((state.G as { view: string }).view).toBe("why");
    expect((state.S as { secLeft: number }).secLeft).toBe(8);
  });

  it("uses idle and active pressure states without inventing gameplay state", () => {
    let state = { G: { view: "home", li: 0, mode: null }, S: {}, L: null };
    setDebugState(() => state);
    const runtime = loadRuntime();
    runtime?.sync();
    expect(document.querySelector(".app")).toHaveAttribute("data-feel-pressure", "idle");

    state = { G: { view: "play", li: 0, mode: "learn" }, S: {}, L: { city: true } };
    runtime?.sync();
    expect(document.querySelector(".app")).toHaveAttribute("data-feel-pressure", "active");
  });

  it("renders a layered city while preserving every clickable zone", () => {
    const sky = renderCityScene();

    expect(sky.querySelector('.sky-layer[data-feel-layer="far"]')).not.toBeNull();
    expect(sky.querySelector('.city-back[data-feel-layer="far"]')).not.toBeNull();
    expect(sky.querySelector('.city-mid[data-feel-layer="mid"]')).not.toBeNull();
    expect(sky.querySelector('.street-life[data-feel-layer="front"]')).not.toBeNull();
    expect(sky.querySelector('.power-grid[data-feel-layer="play"]')).not.toBeNull();
    expect(sky.querySelector('.city-front[data-feel-layer="front"]')).not.toBeNull();
    expect([...sky.querySelectorAll(".zone")].map((zone) => zone.getAttribute("data-z"))).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
    ]);

    const css = readFileSync(feelCssPath, "utf8");
    expect(css).toContain(".sky-layer,.city-back,.city-mid,.street-life,.power-grid,.city-front,.bats");
    expect(css).toContain("pointer-events:none");
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
  });

  it("keeps navigation neutral and emits one wrong-attempt effect without blocking controls", () => {
    let state = {
      G: { view: "play", li: 0, mode: "learn" },
      S: { used: 0, fixed: [], whyMiss: false, good: false, msg: "", secLeft: 30 },
      L: { city: true },
    };
    document.querySelector("#game")!.innerHTML = '<div class="stage"></div><button>اختيار</button>';
    setDebugState(() => state);
    const runtime = loadRuntime();
    runtime?.sync();
    const app = document.querySelector(".app")!;

    state = { ...state, S: { ...state.S, used: 1 } };
    runtime?.sync();
    expect(app).not.toHaveClass("feel-wrong");
    expect(app).not.toHaveClass("feel-fix");

    state = { ...state, S: { ...state.S, used: 2, msg: "خسرت تفكيكة" } };
    runtime?.sync();
    const eventId = app.getAttribute("data-feel-event-id");
    expect(app).toHaveClass("feel-wrong");
    expect(app).toHaveAttribute("data-feel-event", "wrong");
    expect(document.querySelector("button")).toBeEnabled();

    runtime?.sync();
    expect(app).toHaveAttribute("data-feel-event-id", eventId);
  });

  it("distinguishes proven fixes, wins, and losses as non-blocking presentation events", () => {
    let state = {
      G: { view: "play", li: 0, mode: "learn" },
      S: { used: 1, fixed: [], whyMiss: false, good: false, msg: "", secLeft: 30 },
      L: { city: true },
    };
    document.querySelector("#game")!.innerHTML = '<div class="stage"></div><button>التالي</button>';
    setDebugState(() => state);
    const runtime = loadRuntime();
    runtime?.sync();
    const app = document.querySelector(".app")!;

    state = { ...state, S: { ...state.S, fixed: [{ where: "حي", cause: "سبب" }], good: true } };
    runtime?.sync();
    expect(app).toHaveClass("feel-fix");
    expect(app).toHaveAttribute("data-feel-event", "fix");

    state = { ...state, G: { ...state.G, view: "won" } };
    runtime?.sync();
    expect(app).toHaveClass("feel-win");
    expect(app).toHaveAttribute("data-feel-event", "win");
    expect(document.querySelector("button")).toBeEnabled();

    state = { ...state, G: { ...state.G, view: "lost" } };
    runtime?.sync();
    expect(app).toHaveClass("feel-loss");
    expect(app).toHaveAttribute("data-feel-event", "loss");
    expect(document.querySelector("button")).toBeEnabled();
  });
});
