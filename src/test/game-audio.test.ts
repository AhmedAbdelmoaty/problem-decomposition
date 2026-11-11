// @ts-nocheck
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(testDir, "../..");
const gameHtmlPath = join(root, "public/game/index.html");
const gameHtml = readFileSync(gameHtmlPath, "utf8");
const gameHtmlLf = gameHtml.replace(/\r\n?/g, "\n");
const feelCss = readFileSync(join(root, "public/game/game-feel.css"), "utf8");

describe("game audio assets", () => {
  it("ships every recorded dialogue file referenced by the game", () => {
    const files = [...gameHtml.matchAll(/file:'([^']+\.(?:mp3|wav))'/g)].map((match) => match[1]);

    expect(files.length).toBeGreaterThan(0);
    expect(files.filter((file) => !existsSync(join(root, "public/game/audio", file)))).toEqual([]);
  });

  it("ships every reused game sound effect", () => {
    const samplesBlock = gameHtml.match(/var SAMPLES=\{([^}]+)\}/)?.[1] ?? "";
    const files = [...samplesBlock.matchAll(/'([^']+\.ogg)'/g)].map((match) => match[1]);

    expect(files.length).toBeGreaterThan(0);
    expect(files.filter((file) => !existsSync(join(root, "public/assets/behind-dots/audio", file)))).toEqual([]);
  });

  it("maps every spoken bubble to a recorded voice and a character", () => {
    const voiceKeys = new Set(
      [...gameHtml.matchAll(/^\s+(\w+):\{file:'[^']+',ms:\d+\}/gm)].map((match) => match[1]),
    );
    const audioKeys = [...gameHtml.matchAll(/audio:'(\w+)'/g)].map((match) => match[1]);
    const characterBlock = gameHtml.match(/var CHAR=\{([\s\S]*?)\n  \};/)?.[1] ?? "";
    const characterKeys = new Set(
      [...characterBlock.matchAll(/^\s+(\w+):\{/gm)].map((match) => match[1]),
    );
    const roleKeys = [...gameHtml.matchAll(/role:'(\w+)'/g)].map((match) => match[1]);

    expect(audioKeys.filter((key) => !voiceKeys.has(key))).toEqual([]);
    expect(roleKeys.filter((key) => !characterKeys.has(key))).toEqual([]);
  });

  it("renders the male intensive-care speaker as a male hospital doctor", () => {
    const dialogue = gameHtml.match(
      /\{who:'([^']+)',role:'(\w+)',t:'[^']+',audio:'cityHospitalCare'\}/,
    );
    const role = dialogue?.[2] ?? "";
    const characterBlock = gameHtml.match(/var CHAR=\{([\s\S]*?)\n  \};/)?.[1] ?? "";
    const character = characterBlock.match(new RegExp(`^\\s+${role}:\\{([^}]+)\\}`, "m"));

    expect(dialogue?.[1]).toBe("دكتور المستشفى");
    expect(character?.[1]).toMatch(/(?:^|,)f:0(?:,|$)/);
  });

  it("renders animatable character parts and speaks only for the recorded voice duration", () => {
    const characterData = gameHtmlLf.match(/var CHAR=(\{[\s\S]*?\n  \});/)?.[1];
    const characterFunction = gameHtmlLf.match(/function characterSvg\(role\)\{[\s\S]*?\n  \}\n  var DR=/)?.[0]
      .replace(/\n  var DR=$/, "");
    expect(characterData).toBeTruthy();
    expect(characterFunction).toBeTruthy();
    if (!characterData || !characterFunction) return;

    const renderCharacter = new Function(
      "role",
      `var CHAR=${characterData};${characterFunction};return characterSvg(role);`,
    ) as (role: string) => string;
    document.body.innerHTML = renderCharacter("angryResident");

    expect(document.querySelector(".character-svg.mood-angry")).not.toBeNull();
    expect(document.querySelector(".character-body")).not.toBeNull();
    expect(document.querySelector(".character-eyes")).not.toBeNull();
    expect(document.querySelector(".character-mouth")).not.toBeNull();
    expect(feelCss).toContain('.app[data-voice-playing="true"] .character-mouth');
    expect(gameHtml).toContain("var duration=o.audio?VOICE[o.audio].ms:5000;");
  });
});
