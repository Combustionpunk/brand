import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { contrast } from "../src/colour.ts";
import { MIN_TEXT_CONTRAST } from "../src/contrast.ts";
import {
  DISCOURSE_TEXT_SHADES,
  discourseVariables,
  forumVariables,
  readableTextShades,
} from "../src/discourse.ts";
import { FORUM_THEME_ATTRIBUTE, renderThemeScss } from "../src/discourse-theme.ts";
import { matchMyCarCss } from "../src/discourse-theme/forum.ts";
import { generateTheme } from "../src/generate.ts";
import { themeIds, themes, tokens } from "../src/tokens.ts";
import type { ThemeColours, ThemeMode } from "../src/types.ts";
import { CARS } from "./fixtures/cars.ts";

// Issue #13: Discourse derives its greys from `primary` and `secondary`. Some of those that carry text
// (dates, counts, "replies") fall under 4.5:1 on the page or the hover row. The forum overrides them.

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The pages the forum can show: every brand palette, and Match my car for each #12 sample in both modes. */
const cases: Array<[string, ThemeColours]> = [
  ...themeIds.map((id) => [`palette ${id}`, themes[id]!.colours] as [string, ThemeColours]),
  ...Object.entries(CARS).flatMap(([car, colours]) =>
    (["dark", "light"] as ThemeMode[]).map((mode) => [`Match my car: ${car}, ${mode}`, generateTheme(colours, mode)] as [string, ThemeColours]),
  ),
];

/**
 * The ladders whose order must survive: each step at least as far from the page as the one before.
 * They start at the background steps the overrides never touch (Discourse's own lightest steps,
 * `-50` and `-100`, are within a hair of each other and not always in order).
 */
const LADDERS = [
  ["--primary-low", "--primary-low-mid", "--primary-medium", "--primary-high", "--primary-very-high"],
  ["--primary-200", "--primary-300", "--primary-400", "--primary-500", "--primary-600", "--primary-700", "--primary-800", "--primary-900"],
];

const BACKGROUNDS = ["--secondary", "--d-hover"] as const;
const weakest = (vars: Record<string, string>, name: string) => Math.min(...BACKGROUNDS.map((bg) => contrast(vars[name]!, vars[bg]!)));

describe("DISCOURSE_TEXT_SHADES: the derived variables that carry text", () => {
  it("lists the grey text shades with a reason for each, and leaves the non-text ones out", () => {
    const names = Object.keys(DISCOURSE_TEXT_SHADES);
    for (const name of ["--primary-medium", "--primary-high", "--primary-very-high", "--primary-600", "--primary-700", "--primary-800", "--primary-900", "--primary-med-or-secondary-med", "--primary-med-or-secondary-high", "--primary-high-or-secondary-low", "--primary-low-mid-or-secondary-high"]) {
      expect(names, name).toContain(name);
    }
    // Borders, backgrounds, icons, drag handles and disabled controls: not text.
    for (const name of ["--primary-low", "--primary-very-low", "--primary-low-mid", "--primary-400", "--primary-500", "--d-hover", "--primary"]) {
      expect(names, name).not.toContain(name);
    }
    for (const [name, why] of Object.entries(DISCOURSE_TEXT_SHADES)) expect(why.length, name).toBeGreaterThan(10);
  });
});

describe("the forum's text shades, for every palette and Match my car sample", () => {
  for (const [label, colours] of cases) {
    it(`${label}: every text shade reaches 4.5:1 on the page and the hover row`, () => {
      const vars = forumVariables(colours);
      for (const name of Object.keys(DISCOURSE_TEXT_SHADES)) {
        for (const bg of BACKGROUNDS) {
          const ratio = contrast(vars[name]!, vars[bg]!);
          expect(ratio, `${name} on ${bg}: ${vars[name]} on ${vars[bg]}`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        }
      }
    });

    it(`${label}: keeps the shade order, low lighter than medium lighter than high`, () => {
      const vars = forumVariables(colours);
      for (const ladder of LADDERS) {
        const ratios = ladder.map((name) => contrast(vars[name]!, vars["--secondary"]!));
        for (let i = 1; i < ratios.length; i++) {
          expect(ratios[i]!, `${ladder[i]} (${ratios[i]!.toFixed(2)}) vs ${ladder[i - 1]} (${ratios[i - 1]!.toFixed(2)})`).toBeGreaterThanOrEqual(ratios[i - 1]!);
        }
      }
    });

    it(`${label}: changes only failing shades, and only as far as needed`, () => {
      const original = discourseVariables(colours);
      const overrides = readableTextShades(original);
      for (const [name, value] of Object.entries(overrides)) {
        expect(Object.keys(DISCOURSE_TEXT_SHADES), name).toContain(name);
        expect(value).toMatch(/^#[0-9A-F]{6}$/);
        // Just over the line, unless the shade order moved it (it then takes the colour of the step below it).
        const fixed = { ...original, ...overrides };
        const below = LADDERS.flatMap((ladder) => (ladder.includes(name) ? ladder.slice(0, ladder.indexOf(name)) : [])).map((n) => fixed[n]);
        if (below.includes(value)) continue;
        expect(weakest(original, name), `${name} already passed`).toBeLessThan(MIN_TEXT_CONTRAST);
        expect(weakest(fixed, name), `${name}: ${value}`).toBeLessThan(MIN_TEXT_CONTRAST + 0.25);
      }
      // A shade that passed stays as it was, unless the shade order moved it.
      const ordered = (name: string) => LADDERS.some((ladder) => ladder.includes(name) && overrides[ladder[ladder.indexOf(name) - 1]!] === overrides[name]);
      for (const name of Object.keys(DISCOURSE_TEXT_SHADES)) {
        if (weakest(original, name) >= MIN_TEXT_CONTRAST && !ordered(name)) expect(overrides[name], name).toBeUndefined();
      }
    });
  }

  it("darkens Pit Lane light's --primary-medium, which Discourse makes 3.11:1", () => {
    const original = discourseVariables(themes["pit-lane-light"]!.colours);
    expect(contrast(original["--primary-medium"]!, original["--secondary"]!)).toBeCloseTo(3.11, 1);
    const fixed = forumVariables(themes["pit-lane-light"]!.colours);
    expect(contrast(fixed["--primary-medium"]!, fixed["--secondary"]!)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
  });

  it("leaves every other Discourse variable as Discourse makes it", () => {
    for (const [, colours] of cases) {
      const original = discourseVariables(colours);
      const fixed = forumVariables(colours);
      expect(Object.keys(fixed).sort()).toEqual(Object.keys(original).sort());
      for (const name of Object.keys(original)) {
        if (!(name in DISCOURSE_TEXT_SHADES)) expect(fixed[name], name).toBe(original[name]);
      }
    }
  });
});

describe("where the overrides reach the forum", () => {
  const scss = renderThemeScss(tokens, readFileSync(resolve(root, "fonts/fonts.css"), "utf8"), readFileSync(resolve(root, "src/header/header.css"), "utf8"));
  const block = (id: string) => {
    const start = scss.indexOf(`html[${FORUM_THEME_ATTRIBUTE}="${id}"] {`);
    expect(start, id).toBeGreaterThan(-1);
    return scss.slice(start, scss.indexOf("}", start));
  };

  for (const id of themeIds) {
    it(`common.scss sets ${id}'s overrides in its palette block`, () => {
      const overrides = readableTextShades(discourseVariables(themes[id]!.colours));
      for (const [name, value] of Object.entries(overrides)) expect(block(id)).toContain(`${name}: ${value};`);
    });
  }

  it("the committed discourse/common/common.scss carries them (run pnpm build)", () => {
    const committed = readFileSync(resolve(root, "discourse/common/common.scss"), "utf8");
    const overrides = readableTextShades(discourseVariables(themes["pit-lane-light"]!.colours));
    expect(Object.keys(overrides)).toContain("--primary-medium");
    expect(committed).toContain(`--primary-medium: ${overrides["--primary-medium"]};`);
  });

  it("Match my car's CSS uses the readable shades", () => {
    const colours = CARS["light yellow"]!;
    const theme = generateTheme(colours, "light");
    const fixed = forumVariables(theme);
    const overrides = readableTextShades(discourseVariables(theme));
    expect(Object.keys(overrides).length).toBeGreaterThan(0);
    const css = matchMyCarCss(colours, "light");
    for (const name of Object.keys(overrides)) expect(css).toContain(`${name}: ${fixed[name]};`);
  });
});
