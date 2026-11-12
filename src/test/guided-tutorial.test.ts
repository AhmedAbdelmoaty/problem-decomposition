import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(testDir, "../..");
const html = readFileSync(join(root, "public/game/index.html"), "utf8");
const runtime = readFileSync(join(root, "public/game/guided-tutorial.js"), "utf8");
const css = readFileSync(join(root, "public/game/guided-tutorial.css"), "utf8");

describe("guided analytical onboarding", () => {
  it("loads a separate accessible tutorial layer with the approved start action", () => {
    expect(html).toContain('href="guided-tutorial.css"');
    expect(html).toContain('src="guided-tutorial.js"');
    expect(html).toContain("ابدأ التحليل");
    expect(runtime).toContain('role="dialog"');
    expect(runtime).toContain('aria-live="polite"');
  });

  it("keeps guidance generic and drives real gameplay controls", () => {
    expect(runtime).toContain("اقرأ الأدلة قبل ما تختار");
    expect(runtime).toContain("اختار بُعد التفكيك اللي الأدلة بتوجّهك ليه");
    expect(runtime).toContain("data-act=\"guess\"");
    expect(runtime).toContain("data-act=\"tile\"");
    expect(runtime).toContain("data-act=\"why\"");
    expect(runtime).toContain("DCTutorialBridge");
  });

  it("provides spotlight, pointer, responsive placement, and reduced motion", () => {
    expect(css).toContain(".dc-coach-cutout");
    expect(css).toContain(".dc-coach-pointer");
    expect(css).toContain(".dc-briefing");
    expect(css).toContain("@media(max-width:700px)");
    expect(css).toContain("@media(prefers-reduced-motion:reduce)");
  });

  it("keeps the whole case readable and scrollable while only blocking wrong guided clicks", () => {
    expect(css).not.toContain("body.dc-tutorial-open{overflow:hidden}");
    expect(css).toContain(".dc-coach-shade{position:absolute");
    expect(css).toContain("pointer-events:none");
    expect(runtime).toContain("document.addEventListener('click',interceptGuidedClicks,true)");
    expect(runtime).toContain("event.preventDefault();event.stopImmediatePropagation()");
    expect(runtime).toContain("rect.bottom<0||rect.top>window.innerHeight");
  });

  it("finishes the rehearsal by starting a fresh timed challenge", () => {
    expect(runtime).toContain("ابدأ التحدي");
    expect(runtime).toContain("startChallenge");
    expect(runtime).toContain("dc_guided_onboarding_v1");
  });
});
