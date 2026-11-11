import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const root = resolve(testDir, "../..");
const gameHtml = readFileSync(join(root, "public/game/index.html"), "utf8");
const fixturePath = join(testDir, "fixtures/game-logic-baseline.json");
const baseline = existsSync(fixturePath)
  ? JSON.parse(readFileSync(fixturePath, "utf8"))
  : null;

const normalize = (value: string) => value.replace(/\r\n?/g, "\n").trim();
const sha256 = (value: string) =>
  createHash("sha256").update(normalize(value), "utf8").digest("hex");

function extractBetween(source: string, startMarker: string, endMarker: string) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (start < 0 || end < 0) throw new Error(`Protected block not found: ${startMarker}`);
  return source.slice(start, end);
}

function extractBalancedFunction(source: string, functionStart: number) {
  const open = source.indexOf("{", functionStart);
  if (open < 0) throw new Error("Function opening brace not found");

  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = open; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(functionStart, index + 1);
    }
  }

  throw new Error("Function closing brace not found");
}

export function extractNamedFunction(source: string, name: string) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Function not found: ${name}`);
  return extractBalancedFunction(source, start);
}

function extractClickRouter(source: string) {
  const marker = "game.addEventListener('click',function(e)";
  const start = source.indexOf(marker);
  if (start < 0) throw new Error("Click action router not found");
  return extractBalancedFunction(source, start);
}

function extractLevelRules(name: string) {
  const fn = extractNamedFunction(gameHtml, name);
  const match = fn.match(/title:'[^']+',opt:(\d+),budget:(\d+),time:(\d+)/);
  if (!match) throw new Error(`Numeric rules not found for ${name}`);
  return { opt: Number(match[1]), budget: Number(match[2]), time: Number(match[3]) };
}

const protectedFunctions = [
  "why",
  "plant",
  "flatDim",
  "refreshFlat",
  "recalc",
  "assemble",
  "level1",
  "level2",
  "level3",
  "level4",
  "startLevel",
  "starsFor",
  "lose",
  "win",
  "openTile",
  "answerWhy",
  "fixLeaf",
];

describe("analytical game baseline", () => {
  it("keeps the analytical data and all player-facing case copy identical to the approved baseline", () => {
    expect(baseline, "game-logic-baseline.json must exist").not.toBeNull();
    if (!baseline) return;

    const dataAndCopy = extractBetween(
      gameHtml,
      "/* ---------- building the data ---------- */",
      "/* ---------- state ---------- */",
    );
    expect(sha256(dataAndCopy)).toBe(baseline.dataCopySha256);
  });

  it("keeps decomposition, scoring, fix, win, loss, and action-routing functions identical to the approved baseline", () => {
    expect(baseline, "game-logic-baseline.json must exist").not.toBeNull();
    if (!baseline) return;

    const actualFunctions = Object.fromEntries(
      protectedFunctions.map((name) => [name, sha256(extractNamedFunction(gameHtml, name))]),
    );
    expect(actualFunctions).toEqual(baseline.functions);
    expect(sha256(extractClickRouter(gameHtml))).toBe(baseline.clickRouterSha256);
  });

  it("keeps every protected numeric rule identical to the approved baseline", () => {
    expect(baseline, "game-logic-baseline.json must exist").not.toBeNull();
    if (!baseline) return;

    const penalty = gameHtml.match(/var PENALTY=(\d+);/)?.[1];
    const starsFormula = normalize(extractNamedFunction(gameHtml, "starsFor"));
    const scoreFormula = gameHtml.match(/G\.pts\[G\.li\]=([^;]+);/)?.[1];
    expect({
      penalty: Number(penalty),
      levels: {
        level1: extractLevelRules("level1"),
        level2: extractLevelRules("level2"),
        level3: extractLevelRules("level3"),
        level4: extractLevelRules("level4"),
      },
      starsFormula,
      scoreFormula,
    }).toEqual(baseline.numericRules);
  });
});
