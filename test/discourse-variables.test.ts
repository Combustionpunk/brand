import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrast } from "../src/colour.ts";
import { MIN_TEXT_CONTRAST } from "../src/contrast.ts";
import { discourseVariables, toDiscourseScheme } from "../src/discourse.ts";
import { generateTheme } from "../src/generate.ts";
import { themes } from "../src/tokens.ts";
import type { ThemeMode } from "../src/types.ts";
import { CARS } from "./fixtures/cars.ts";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * The `:root` custom properties in a stylesheet Discourse compiled for a palette. The fixtures
 * are the dev forum's color_definitions for RC Misfits: Pit Lane and Pit Lane light (17 Nov 2026),
 * with core's colour transformations and the chat and events plugins'.
 */
function fixture(id: string): Map<string, string> {
  const css = readFileSync(resolve(here, `fixtures/discourse/color_definitions_${id}.css`), "utf8");
  const props = new Map<string, string>();
  for (const [, name, value] of css.matchAll(/(--[\w-]+):\s*([^;}]*)/g)) {
    if (!props.has(name!)) props.set(name!, value!.trim());
  }
  return props;
}

type Rgba = [number, number, number, number];

/** `#fff`, `#ffffff`, `rgb(10%, 20%, 30%)`, `rgba(.., 0.7)`, `rgb(1, 2, 3)` or a bare `1, 2, 3`, in 0-255 and alpha 0-1. */
function parseColour(value: string): Rgba | undefined {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const digits = hex[1]!.length === 3 ? hex[1]!.replace(/./g, "$&$&") : hex[1]!;
    const n = parseInt(digits, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  const fn = /^(?:rgba?\()?\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+))?\s*\)?$/.exec(v);
  if (!fn) return undefined;
  const channel = (c: string) => (c.endsWith("%") ? (parseFloat(c) * 255) / 100 : parseFloat(c));
  return [channel(fn[1]!), channel(fn[2]!), channel(fn[3]!), fn[4] === undefined ? 1 : parseFloat(fn[4])];
}

/** Variables that are the same in every palette, fonts, or light-dark() helpers with generated names. */
const isConstant = (name: string, value: string) =>
  value.includes("var(") ||
  /^--[0-9a-f]{8}-csstools/.test(name) ||
  /^--(google|instagram|facebook|cas|twitter|github|discord|gold|silver|bronze)(-hover)?$/.test(name) ||
  /font-family/.test(name) ||
  ["--always-black-rgb", "--shadow-docked-composer"].includes(name) ||
  name.startsWith("--fc-");

describe("discourseVariables", () => {
  for (const id of ["pit-lane", "pit-lane-light"]) {
    it(`gives what Discourse itself compiles for ${id}, to within one step per channel`, () => {
      const compiled = fixture(id);
      const ours = discourseVariables(themes[id]!.colours);

      const wanted = [...compiled].filter(([name, value]) => !isConstant(name, value)).map(([name]) => name);
      expect(wanted.length).toBeGreaterThan(100);
      expect(wanted.filter((name) => !(name in ours))).toEqual([]);

      for (const name of wanted) {
        const expected = compiled.get(name)!;
        const actual = ours[name]!;
        const a = parseColour(actual);
        const e = parseColour(expected);
        if (e === undefined || a === undefined) {
          expect(actual.replace(/\s+/g, " "), name).toBe(expected.replace(/\s+/g, " "));
          continue;
        }
        for (let i = 0; i < 3; i++) expect(Math.abs(a[i]! - e[i]!), `${name}: ${actual} vs ${expected}`).toBeLessThanOrEqual(1);
        expect(a[3], name).toBeCloseTo(e[3]!, 2);
      }
    });
  }

  it("starts from the same base colours as the brand's palettes", () => {
    const vars = discourseVariables(themes["synthwave"]!.colours);
    const { colors } = toDiscourseScheme("synthwave", themes["synthwave"]!);
    for (const name of ["primary", "secondary", "tertiary", "quaternary", "header_background", "header_primary", "highlight", "danger", "success", "love"]) {
      expect(vars[`--${name}`], name).toBe(`#${colors[name as keyof typeof colors]}`);
    }
    expect(vars["--d-hover"]).toBe(`#${colors.hover}`);
    expect(vars["--d-selected"]).toBe(`#${colors.selected}`);
  });

  it("says whether the scheme is light or dark, as Discourse does", () => {
    expect(discourseVariables(themes["pit-lane"]!.colours)["--scheme-type"]).toBe("dark");
    expect(discourseVariables(themes["pit-lane-light"]!.colours)["--scheme-type"]).toBe("light");
  });
});

describe("Match my car on the forum: readable whatever the race colours", () => {
  for (const [car, colours] of Object.entries(CARS)) {
    for (const mode of ["dark", "light"] as ThemeMode[]) {
      it(`${car}, ${mode}`, () => {
        const v = discourseVariables(generateTheme(colours, mode));
        expect(v["--scheme-type"]).toBe(mode);
        const pairs: Array<[string, string]> = [
          // Text on the page, the top bar and the rows of dropdowns, menus and the sidebar.
          ["--primary", "--secondary"],
          ["--primary", "--header_background"],
          ["--header_primary", "--header_background"],
          ["--primary", "--d-hover"],
          ["--primary", "--d-selected"],
          // Links, and the text of primary buttons on the accent.
          ["--tertiary", "--secondary"],
          ["--secondary", "--tertiary"],
          ["--quaternary", "--secondary"],
          ["--danger", "--secondary"],
          ["--success", "--secondary"],
          ["--love", "--secondary"],
        ];
        for (const [fg, bg] of pairs) {
          const ratio = contrast(v[fg]!, v[bg]!);
          expect(ratio, `${fg} on ${bg}: ${v[fg]} on ${v[bg]}`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        }
      });
    }
  }
});
