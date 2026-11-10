import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const html = readFileSync("public/game/index.html", "utf8");
const artwork = readFileSync("public/game/scene-art.js", "utf8");

type GameNode = { children: GameNode[]; why: { opts: [string, number][] } };
declare global {
  interface Window {
    dcDebug: {
      state: () => {
        S: { path: GameNode[]; whyLeaf: GameNode };
        L: { root: GameNode; paths: GameNode[][] };
      };
    };
  }
}

const tracks: MockAudio[] = [];
let deferPlayback = false;

class MockAudio extends EventTarget {
  paused = true;
  rejectPlayback?: (reason: Error) => void;

  constructor(readonly src: string) {
    super();
    tracks.push(this);
  }

  play() {
    this.paused = false;
    if (deferPlayback) {
      return new Promise<void>((_, reject) => {
        this.rejectPlayback = reject;
      });
    }
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
  }
  removeAttribute() {}
  load() {}
}

function click(selector: string) {
  const button = document.querySelector<HTMLElement>(selector);
  expect(button, selector).toBeTruthy();
  button!.click();
}

const tile = (index: number) => click(`[data-act="tile"][data-i="${index}"]`);
const up = (index: number) => click(`[data-act="up"][data-i="${index}"]`);
const state = () => window.dcDebug.state();
const played = () => tracks.map((track) => track.src);
const active = () => tracks.filter((track) => !track.paused).map((track) => track.src);
const bubble = () => document.querySelector<HTMLElement>("#bubble")!;

function begin() {
  click('[data-m="learn"]');
  click('[data-g="1"]');
}

function answer(correct: boolean) {
  const index = state().S.whyLeaf.why.opts.findIndex((option) => Boolean(option[1]) === correct);
  click(`[data-act="why"][data-i="${index}"]`);
}

function solveLevel() {
  const { root, paths } = state().L;
  for (const path of paths) {
    if (state().S.path.length > 1) up(0);
    let parent = root;
    for (const node of path) {
      tile(parent.children.indexOf(node));
      parent = node;
    }
    answer(true);
  }
  click('[data-act="next"]');
}

describe("Game audio", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0.25);
    vi.stubGlobal("Audio", MockAudio);
    deferPlayback = false;
    tracks.length = 0;
    localStorage.clear();

    const page = new DOMParser().parseFromString(html, "text/html");
    document.body.innerHTML = page.body.innerHTML;
    new Function(artwork)();
    new Function(page.body.querySelector("script")!.textContent!)();
  });

  afterEach(() => {
    window.dispatchEvent(new Event("pagehide"));
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("plays each district's dialogue once per explicit visit", () => {
    vi.advanceTimersByTime(30000);
    expect(played()).toEqual([]);
    begin();
    tile(0);
    vi.advanceTimersByTime(30000);
    expect(played()).toEqual([]);

    tile(1);
    expect(active()).toEqual(["audio/shopkeeper-fridge.wav"]);
    up(1);
    expect(active()).toEqual([]);
    tile(2);
    expect(active()).toEqual(["audio/mother-exams.wav"]);
    vi.advanceTimersByTime(5971);
    expect(active()).toEqual(["audio/neighbor-reports.wav"]);
    vi.advanceTimersByTime(30000);
    expect(active()).toEqual([]);
    expect(played()).toEqual([
      "audio/shopkeeper-fridge.wav",
      "audio/mother-exams.wav",
      "audio/neighbor-reports.wav",
    ]);

    up(1);
    tile(1);
    expect(active()).toEqual(["audio/shopkeeper-fridge.wav"]);
  });

  it("keeps the cupboard clip in the residential building through a same-dialogue render", () => {
    begin();
    const path = state().L.paths[0]!;
    let parent = state().L.root;
    for (const node of path) {
      tile(parent.children.indexOf(node));
      parent = node;
    }
    expect(active()).toEqual(["audio/cupboard-bump.wav"]);
    answer(false);
    expect(active()).toEqual(["audio/cupboard-bump.wav"]);
    expect(played().filter((src) => src.includes("cupboard"))).toHaveLength(1);
    answer(true);
    expect(active()).toEqual([]);
    vi.advanceTimersByTime(10000);
    expect(played()).not.toContain("audio/collision-drivers.wav");
  });

  it("plays the factory characters in order only in the factory scene of mission 3", () => {
    begin();
    solveLevel();
    solveLevel();
    expect(active()).toEqual([]);
    tile(0);
    tile(1);
    expect(active()).toEqual([]);
    up(1);
    tile(0);
    expect(active()).toEqual(["audio/factory-worker.wav"]);
    vi.advanceTimersByTime(5931);
    expect(active()).toEqual(["audio/factory-owner.wav"]);
    vi.advanceTimersByTime(6371);
    expect(active()).toEqual(["audio/factory-guard.wav"]);
    vi.advanceTimersByTime(30000);
    expect(active()).toEqual([]);
    expect(played().filter((src) => src.includes("factory"))).toHaveLength(3);
  });

  it("uses one collision recording across all three beats and cancels it on exit", () => {
    begin();
    tile(0);
    tile(0);
    tile(0);
    vi.advanceTimersByTime(1000);
    expect(played()).toEqual([]);
    up(1);
    tile(3);
    tile(0);
    vi.advanceTimersByTime(824);
    expect(played()).toEqual([]);
    vi.advanceTimersByTime(251);
    expect(active()).toEqual(["audio/collision-drivers.wav"]);
    expect(bubble().textContent).toContain("يا عم خد بالك!");
    vi.advanceTimersByTime(2700);
    expect(bubble().textContent).toContain("السواق التاني");
    vi.advanceTimersByTime(2800);
    expect(bubble().textContent).toContain("طب بصّ قدامك");
    expect(played()).toEqual(["audio/collision-drivers.wav"]);
    up(1);
    vi.advanceTimersByTime(20000);
    expect(active()).toEqual([]);
    expect(bubble().hidden).toBe(true);
  });

  it("ignores stale playback events and falls back to text when playback is denied", async () => {
    begin();
    tile(0);
    deferPlayback = true;
    tile(2);
    const stale = tracks[0]!;
    up(1);
    tile(1);
    const current = tracks[1]!;
    stale.dispatchEvent(new Event("playing"));
    stale.rejectPlayback!(new Error("aborted"));
    await Promise.resolve();
    expect(bubble().hidden).toBe(true);
    expect(active()).toEqual(["audio/shopkeeper-fridge.wav"]);

    current.rejectPlayback!(new Error("autoplay denied"));
    await Promise.resolve();
    expect(active()).toEqual([]);
    expect(bubble().textContent).toContain("صاحب المحل");
    vi.advanceTimersByTime(10000);
    expect(played()).toHaveLength(2);
  });

  it("mutes a live clip without replaying it when sound is enabled again", () => {
    begin();
    tile(0);
    tile(2);
    expect(active()).toEqual(["audio/mother-exams.wav"]);
    click("#mute");
    expect(active()).toEqual([]);
    expect(bubble().textContent).toContain("أم ياسين");
    click("#mute");
    expect(played()).toEqual(["audio/mother-exams.wav"]);
    vi.advanceTimersByTime(5971);
    expect(active()).toEqual(["audio/neighbor-reports.wav"]);
    window.dispatchEvent(new Event("pagehide"));
    expect(active()).toEqual([]);
    expect(bubble().hidden).toBe(true);
  });
});
