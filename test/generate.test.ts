import { describe, expect, it } from "vitest";
import { chroma, contrast, hexToHsl } from "../src/colour.ts";
import { MIN_LIGHTNESS_SEPARATION, contrastFailures } from "../src/contrast.ts";
import { generateTheme, pickRoles } from "../src/generate.ts";
import { themes } from "../src/tokens.ts";
import { THEME_KEYS } from "../src/types.ts";
import type { ThemeColours, ThemeMode } from "../src/types.ts";
import { FORUM_PALETTE } from "./canvas.ts";

const P = FORUM_PALETTE as Record<string, string> & {
  black: string; white: string; silver: string; red: string; orange: string; yellow: string; gold: string;
  green: string; light_blue: string; blue: string; purple: string; pink: string; fluoro_yellow: string;
  fluoro_green: string; fluoro_orange: string; fluoro_pink: string;
};
const MODES: ThemeMode[] = ["dark", "light"];
const HEX = /^#[0-9A-F]{6}$/;

const hueDistance = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};
const hue = (hex: string) => hexToHsl(hex).h;

/** Everything the brand promises of a generated theme. */
function expectSound(theme: ThemeColours, label: string) {
  expect(Object.keys(theme), label).toEqual([...THEME_KEYS]);
  for (const key of THEME_KEYS) {
    expect(theme[key], `${label} ${key}`).toMatch(HEX);
  }
  expect(contrastFailures(theme), label).toEqual([]);
  // Stricter than the shared checks: a generated theme's text also holds up on surface2.
  for (const key of ["text", "muted", "accent", "pb", "fast", "danger", "warning"] as const) {
    expect(contrast(theme[key], theme.surface2), `${label} ${key} on surface2`).toBeGreaterThanOrEqual(4.5);
  }
  // contrastFailures covers it, but spelled out: a personal best and a fastest lap differ in lightness.
  expect(contrast(theme.pb, theme.fast), `${label} pb against fast`).toBeGreaterThanOrEqual(MIN_LIGHTNESS_SEPARATION);
}

describe("generateTheme: contrast", () => {
  const inputs: Record<string, string[]> = {
    "0 colours": [],
    "1 colour": [P.blue],
    "2 colours": [P.red, P.blue],
    "3 colours": [P.fluoro_yellow, P.blue, P.light_blue],
    "all white": [P.white, P.white, P.white],
    "all neutral": [P.white, P.black, P.silver],
    "one colour three times": [P.purple, P.purple, P.purple],
    "very dark colours": ["#000033", "#330000", "#003300"],
    "very light colours": ["#FFFFCC", "#CCFFFF", "#FFCCFF"],
  };
  for (const [label, colours] of Object.entries(inputs)) {
    for (const mode of MODES) {
      it(`${label}, ${mode}`, () => {
        expectSound(generateTheme(colours, mode), `${label} ${mode}`);
      });
    }
  }

  it("holds for every 1, 2 and 3 colour pick from the forum's palette, dark and light", () => {
    const palette = Object.values(FORUM_PALETTE);
    let count = 0;
    for (const mode of MODES) {
      for (const a of palette) {
        expectSound(generateTheme([a], mode), `${a} ${mode}`);
        for (const b of palette) {
          expectSound(generateTheme([a, b], mode), `${a} ${b} ${mode}`);
          for (const c of palette) {
            expectSound(generateTheme([a, b, c], mode), `${a} ${b} ${c} ${mode}`);
            count++;
          }
        }
      }
    }
    expect(count).toBe(2 * 16 ** 3);
  });
});

describe("generateTheme: roles", () => {
  it("treats white, black and silver as neutral", () => {
    expect(pickRoles([P.white, P.black, P.silver])).toEqual({});
    expect(pickRoles([P.white, P.red, P.black])).toEqual(pickRoles([P.red]));
    for (const mode of MODES) {
      expect(generateTheme([P.white, P.red, P.black], mode)).toEqual(generateTheme([P.red], mode));
    }
  });

  it("falls back to Pit Lane when there is nothing chromatic (no colours, all white)", () => {
    for (const mode of MODES) {
      const pitLane = themes[mode === "dark" ? "pit-lane" : "pit-lane-light"]!.colours;
      const theme = generateTheme([], mode);
      expect(generateTheme([P.white, P.white, P.white], mode)).toEqual(theme);
      expect(generateTheme([P.silver, P.black], mode)).toEqual(theme);
      // The grounds and text are Pit Lane's own.
      for (const key of ["bg", "surface", "surface2", "line", "text", "muted", "good", "goodText"] as const) {
        expect(theme[key], `${mode} ${key}`).toBe(pitLane[key]);
      }
      // The accents are Pit Lane's too, moved in lightness only where a canvas value misses the
      // contrast rules (see BOARD_PENDING in tokens.test.ts). Once those are settled, they are equal.
      for (const key of ["accent", "pb", "fast", "danger", "warning"] as const) {
        expect(hueDistance(hue(theme[key]), hue(pitLane[key])), `${mode} ${key}`).toBeLessThan(3);
      }
    }
    expect(generateTheme([], "dark").accent).toBe("#FFC72C");
  });

  it("makes the colour with the most chroma the accent, wherever it is in the list", () => {
    expect(chroma(P.fluoro_pink)).toBeGreaterThan(chroma(P.gold));
    expect(pickRoles([P.gold, P.fluoro_pink]).accent).toBe("#FF1493");
    expect(pickRoles([P.fluoro_pink, P.gold]).accent).toBe("#FF1493");
    // Bright enough already: used as it is on a dark ground.
    expect(generateTheme([P.blue, P.yellow], "dark").accent).toBe("#FDD835");
    // On a light ground the accent keeps its hue and is darkened.
    const light = generateTheme([P.blue, P.yellow], "light");
    expect(hueDistance(hue(light.accent), hue(P.yellow))).toBeLessThan(3);
    expect(contrast(light.accent, light.bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("prefers the earlier colour when two are equally chromatic (main first)", () => {
    expect(chroma("#FF0000")).toBe(chroma("#0000FF"));
    expect(pickRoles(["#FF0000", "#0000FF"]).accent).toBe("#FF0000");
    expect(pickRoles(["#0000FF", "#FF0000"]).accent).toBe("#0000FF");
  });

  it("tints the background with the deepest remaining colour", () => {
    // Accent: fluoro yellow. Of blue and light blue, blue is deeper.
    const roles = pickRoles([P.fluoro_yellow, P.light_blue, P.blue]);
    expect(roles).toEqual({ accent: "#E6FF00", tint: "#1565C0", fast: "#4FC3F7" });

    const dark = generateTheme([P.fluoro_yellow, P.light_blue, P.blue], "dark");
    const darkBg = hexToHsl(dark.bg);
    expect(hueDistance(darkBg.h, hue(P.blue))).toBeLessThan(8);
    expect(darkBg.l).toBeGreaterThan(0.06);
    expect(darkBg.l).toBeLessThan(0.1);
    expect(darkBg.s).toBeLessThanOrEqual(0.43);

    const light = generateTheme([P.fluoro_yellow, P.light_blue, P.blue], "light");
    const lightBg = hexToHsl(light.bg);
    expect(hueDistance(lightBg.h, hue(P.blue))).toBeLessThan(8);
    expect(lightBg.l).toBeGreaterThan(0.96);
    expect(lightBg.l).toBeLessThan(0.98);
  });

  it("caps the background's saturation at 40%", () => {
    for (const colour of ["#FF0000", "#00FF00", "#0000FF", "#FF00FF"]) {
      const { bg, surface2 } = generateTheme(["#FFFF00", colour], "dark");
      // Rounding to 8-bit channels at 8% lightness moves saturation by a point or two.
      expect(hexToHsl(bg).s).toBeLessThanOrEqual(0.43);
      expect(hexToHsl(surface2).s).toBeLessThanOrEqual(0.42);
    }
  });

  it("uses the third colour as the highlight", () => {
    for (const mode of MODES) {
      const theme = generateTheme([P.fluoro_yellow, P.blue, P.light_blue], mode);
      expect(hueDistance(hue(theme.fast), hue(P.light_blue))).toBeLessThan(4);
    }
    // Already readable and distinct from pb: used as it is.
    expect(generateTheme([P.fluoro_yellow, P.purple, P.yellow], "dark").fast).toBe("#FDD835");
  });

  it("otherwise uses the accent's opposite hue as the highlight", () => {
    for (const mode of MODES) {
      for (const colours of [[P.blue], [P.blue, P.purple], [P.orange, P.white, P.black]]) {
        const theme = generateTheme(colours, mode);
        const accentHue = hue(pickRoles(colours).accent!);
        expect(hueDistance(hue(theme.fast), accentHue + 180), `${colours.join()} ${mode}`).toBeLessThan(4);
      }
    }
  });

  it("moves an opposite-hue highlight that would land on the personal-best green", () => {
    // Fluoro pink's opposite is green, the same as pb.
    for (const mode of MODES) {
      const theme = generateTheme([P.fluoro_pink], mode);
      expect(hueDistance(hue(theme.fast), hue(theme.pb))).toBeGreaterThanOrEqual(30);
    }
  });

  it("keeps pb green whatever the colours", () => {
    for (const mode of MODES) {
      for (const colours of [[P.red], [P.green, P.fluoro_green], [P.purple, P.pink, P.blue]]) {
        const pbHue = hue(generateTheme(colours, mode).pb);
        expect(pbHue).toBeGreaterThan(120);
        expect(pbHue).toBeLessThan(170);
      }
    }
  });

  it("puts readable text on the accent", () => {
    for (const mode of MODES) {
      for (const colour of Object.values(FORUM_PALETTE)) {
        const theme = generateTheme([colour], mode);
        expect(contrast(theme.onAccent, theme.accent)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("makes a dark ground for dark and a light ground for light", () => {
    const dark = generateTheme([P.red, P.blue], "dark");
    const light = generateTheme([P.red, P.blue], "light");
    expect(hexToHsl(dark.bg).l).toBeLessThan(0.12);
    expect(hexToHsl(dark.surface).l).toBeGreaterThan(hexToHsl(dark.bg).l);
    expect(hexToHsl(dark.surface2).l).toBeGreaterThan(hexToHsl(dark.surface).l);
    expect(hexToHsl(dark.line).l).toBeGreaterThan(hexToHsl(dark.surface2).l);
    expect(hexToHsl(light.bg).l).toBeGreaterThan(0.95);
    expect(light.surface).toBe("#FFFFFF");
    expect(hexToHsl(light.line).l).toBeLessThan(hexToHsl(light.surface2).l);
  });
});

describe("generateTheme: input handling", () => {
  it("is deterministic and leaves its input alone", () => {
    const colours = [P.fluoro_orange, P.blue, P.silver];
    const copy = [...colours];
    for (const mode of MODES) {
      const first = generateTheme(colours, mode);
      expect(generateTheme(colours, mode)).toEqual(first);
      expect(generateTheme([...colours], mode)).toEqual(first);
      expect(JSON.stringify(generateTheme(colours, mode))).toBe(JSON.stringify(first));
    }
    expect(colours).toEqual(copy);
  });

  it("returns a fresh object each time, so callers cannot change the built-in themes", () => {
    const theme = generateTheme([], "dark");
    theme.accent = "#000000";
    expect(themes["pit-lane"]!.colours.accent).toBe("#FFC72C");
    expect(generateTheme([], "dark").accent).toBe("#FFC72C");
  });

  it("defaults to dark, and to no colours", () => {
    expect(generateTheme([P.red])).toEqual(generateTheme([P.red], "dark"));
    expect(generateTheme()).toEqual(generateTheme([], "dark"));
  });

  it("reads lower case, 3-digit and bare hex the same", () => {
    expect(generateTheme(["#ff0000", "#0000FF"])).toEqual(generateTheme(["F00", "00f"]));
  });

  it("uses the first three colours only", () => {
    expect(generateTheme([P.red, P.blue, P.gold, P.fluoro_green])).toEqual(generateTheme([P.red, P.blue, P.gold]));
  });

  it("throws on something that is not a hex colour, or not a mode", () => {
    expect(() => generateTheme(["red"])).toThrow(RangeError);
    expect(() => generateTheme([P.red, "#12345"])).toThrow(RangeError);
    expect(() => generateTheme([P.red], "sepia" as ThemeMode)).toThrow(RangeError);
  });
});
