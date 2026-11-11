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
});
