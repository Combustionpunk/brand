import { describe, expect, it } from "vitest";
import { contrast } from "../src/colour.ts";
import { MIN_TEXT_CONTRAST, contrastFailures } from "../src/contrast.ts";
import { themeFromRoles } from "../src/generate.ts";
import { defaultTheme, raceColours, themeIds, themes, tokens } from "../src/tokens.ts";
import { THEME_KEYS } from "../src/types.ts";
import { CANVAS, CANVAS_KEYS, DARK_ONLY, FORUM_PALETTE } from "./canvas.ts";

const HEX = /^#[0-9A-F]{6}$/;

/**
 * Canvas values that miss the contrast rules: 4.5:1 for text and accents, and a difference in
 * lightness between pb and fast. The issue says to use the canvas values exactly, and changing a
 * colour is a Board decision, so they are listed here instead of being changed. See the question
 * on issue #1. When the Board settles a value, delete its entry: the test then enforces the rule.
 */
const BOARD_PENDING: Record<string, string[]> = {
  "pit-lane": ["pb/fast"],
  "pit-lane-light": ["accent/bg", "accent/surface", "onAccent/accent", "pb/bg", "pb/surface"],
  synthwave: ["pb/fast"],
  "synthwave-light": ["pb/bg", "pb/fast"],
  garage: ["pb/fast"],
  "racing-green": ["pb/fast"],
  "red-line": ["pb/fast"],
  ice: ["accent/bg", "pb/bg", "pb/surface"],
};

describe("tokens.json themes", () => {
  it("has the Board's canvas values exactly", () => {
    for (const canvas of CANVAS) {
      const theme = themes[canvas.id];
      expect(theme, canvas.id).toBeDefined();
      expect(theme!.name).toBe(canvas.name);
      for (const key of CANVAS_KEYS) {
        expect(theme!.colours[key], `${canvas.id} ${key}`).toBe(canvas.colours[key]);
      }
    }
  });

  it("gives every theme exactly the theme keys, as #RRGGBB", () => {
    for (const id of themeIds) {
      const colours = themes[id]!.colours;
      expect(Object.keys(colours), id).toEqual([...THEME_KEYS]);
      for (const key of THEME_KEYS) {
        expect(colours[key], `${id} ${key}`).toMatch(HEX);
      }
    }
  });

  it("defaults to Pit Lane, with Pit Lane light for light mode", () => {
    expect(defaultTheme).toBe("pit-lane");
    expect(themes["pit-lane"]!.mode).toBe("dark");
    expect(tokens.defaultLightTheme).toBe("pit-lane-light");
    expect(themes["pit-lane-light"]!.mode).toBe("light");
  });

  it("marks each theme dark or light, and its ground agrees", () => {
    for (const id of themeIds) {
      const { mode, colours } = themes[id]!;
      const darkGround = contrast(colours.bg, "#000000") < contrast(colours.bg, "#FFFFFF");
      expect(mode, id).toBe(darkGround ? "dark" : "light");
    }
  });

  it("pairs dark and light versions both ways", () => {
    for (const id of themeIds) {
      const { pair, mode } = themes[id]!;
      if (pair === undefined) {
        continue;
      }
      expect(themes[pair], `${id} pairs with ${pair}`).toBeDefined();
      expect(themes[pair]!.pair).toBe(id);
      expect(themes[pair]!.mode).not.toBe(mode);
    }
  });

  it("has a light version of every dark-only canvas theme, from the generator's light mode", () => {
    for (const id of DARK_ONLY) {
      const dark = themes[id]!;
      const light = themes[`${id}-light`];
      expect(light, `${id}-light`).toBeDefined();
      expect(light!.mode).toBe("light");
      expect(dark.pair).toBe(`${id}-light`);
      // If the Board hand-tunes one of these, take it out of DARK_ONLY in test/canvas.ts.
      expect(light!.colours).toEqual(
        themeFromRoles({ accent: dark.colours.accent, tint: dark.colours.bg, fast: dark.colours.fast }, "light"),
      );
    }
    expect(themeIds).toHaveLength(CANVAS.length + DARK_ONLY.length);
  });
});

describe("contrast of every built-in theme", () => {
  for (const id of themeIds) {
    it(`${id}: text and accents reach 4.5:1, and the pairs to tell apart differ in lightness`, () => {
      const failures = contrastFailures(themes[id]!.colours);
      expect(failures.map((f) => f.pair.join("/")).sort()).toEqual([...(BOARD_PENDING[id] ?? [])].sort());
      // The pending pairs still reach the large-text minimum, 3:1.
      for (const failure of failures.filter((f) => f.required === MIN_TEXT_CONTRAST)) {
        expect(failure.ratio, `${id} ${failure.pair.join("/")}`).toBeGreaterThanOrEqual(3);
      }
    });
  }

  it("only excuses canvas themes", () => {
    for (const id of Object.keys(BOARD_PENDING)) {
      expect(CANVAS.map((c) => c.id)).toContain(id);
    }
  });
});

describe("the other tokens", () => {
  it("has the forum's 16 race colours, same keys and hexes, in the forum's order", () => {
    expect(raceColours).toHaveLength(16);
    expect(Object.fromEntries(raceColours.map((c) => [c.key, c.hex]))).toEqual(FORUM_PALETTE);
    expect(raceColours.map((c) => c.key)).toEqual(Object.keys(FORUM_PALETTE));
    for (const colour of raceColours) {
      expect(colour.name).not.toBe("");
    }
  });

  it("uses Oswald for headings and Inter for body text and figures", () => {
    expect(tokens.font.display.family).toBe("Oswald");
    expect(tokens.font.body.family).toBe("Inter");
    expect(tokens.font.display.stack.startsWith("Oswald,")).toBe(true);
    expect(tokens.font.body.stack.startsWith("Inter,")).toBe(true);
    for (const name of ["figure", "figure-lg", "figure-xl", "body"]) {
      expect(tokens.type[name]!.font, name).toBe("body");
    }
    for (const name of ["display", "title", "heading"]) {
      expect(tokens.type[name]!.font, name).toBe("display");
    }
  });

  it("has a type scale whose styles use a known font and one of its weights", () => {
    expect(Object.keys(tokens.type).length).toBeGreaterThan(0);
    for (const [name, style] of Object.entries(tokens.type)) {
      const font = tokens.font[style.font];
      expect(font, name).toBeDefined();
      expect(font.weights, name).toContain(style.weight);
      expect(style.size, name).toMatch(/^\d+(\.\d+)?rem$/);
      expect(style.lineHeight, name).toMatch(/^\d+(\.\d+)?rem$/);
    }
  });

  it("has spacing and radii", () => {
    expect(Object.keys(tokens.space).length).toBeGreaterThan(0);
    for (const value of Object.values(tokens.space)) {
      expect(value).toMatch(/^\d+(\.\d+)?rem$/);
    }
    expect(Object.keys(tokens.radius)).toEqual(["sm", "md", "lg", "full"]);
  });
});
