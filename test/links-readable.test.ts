import { describe, expect, it } from "vitest";
import { contrast, mix } from "../src/colour.ts";
import { MIN_TEXT_CONTRAST } from "../src/contrast.ts";
import { DISCOURSE_TEXT_SHADES, SELECTED_ACCENT_SHARE, forumVariables, toDiscourseScheme } from "../src/discourse.ts";
import { generateTheme } from "../src/generate.ts";
import { themeIds, themes } from "../src/tokens.ts";
import type { ThemeColours, ThemeMode } from "../src/types.ts";
import { CARS } from "./fixtures/cars.ts";

// Issue #15: links (`accent`, Discourse's `--tertiary`) and every text shade must reach 4.5:1 on the
// page, the hover row (`--d-hover`) and the selected row (`--d-selected`).

/** Every light palette's accent before #15, and the Board's examples of where they should land. */
const ACCENT_BEFORE: Record<string, string> = {
  "pit-lane-light": "#946700",
  "synthwave-light": "#C2187A",
  "garage-light": "#C04400",
  "fluoro-light": "#6A7500",
  "racing-green-light": "#846B1C",
  "works-blue-light": "#816901",
  "red-line-light": "#DE0400",
  "sunset-light": "#996100",
  ice: "#0275BA",
};
const BOARD_EXAMPLES: Record<string, string> = { "pit-lane-light": "#7F5A05", "red-line-light": "#C70704", ice: "#0467A3" };

/** The dark palettes whose links missed 4.5:1 on the hover row: the forum's hover moves nearer the page instead. */
const HOVER_MOVED = ["synthwave", "garage", "red-line"];

const ROWS = ["--secondary", "--d-hover", "--d-selected"] as const;

const cases: Array<[string, ThemeColours]> = [
  ...themeIds.map((id) => [`palette ${id}`, themes[id]!.colours] as [string, ThemeColours]),
  ...Object.entries(CARS).flatMap(([car, colours]) =>
    (["dark", "light"] as ThemeMode[]).map((mode) => [`Match my car: ${car}, ${mode}`, generateTheme(colours, mode)] as [string, ThemeColours]),
  ),
];

describe("links and text on the page, the hover row and the selected row", () => {
  for (const [label, colours] of cases) {
    it(`${label}: the link and every text shade reach 4.5:1 on all three`, () => {
      const vars = forumVariables(colours);
      for (const fg of ["--tertiary", "--primary", ...Object.keys(DISCOURSE_TEXT_SHADES)]) {
        for (const bg of ROWS) {
          const ratio = contrast(vars[fg]!, vars[bg]!);
          expect(ratio, `${fg} on ${bg}: ${vars[fg]} on ${vars[bg]}`).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        }
      }
    });

    it(`${label}: both rows can still be seen against the page`, () => {
      const vars = forumVariables(colours);
      expect(contrast(vars["--d-hover"]!, vars["--secondary"]!)).toBeGreaterThanOrEqual(1.15);
      expect(contrast(vars["--d-selected"]!, vars["--secondary"]!)).toBeGreaterThanOrEqual(1.15);
      expect(vars["--d-hover"]).not.toBe(vars["--d-selected"]);
    });
  }
});

describe("light palettes: the accent darkened towards the text, by the smallest step that passes", () => {
  for (const [id, before] of Object.entries(ACCENT_BEFORE)) {
    const { colours } = themes[id]!;

    it(`${id}: ${before} missed 4.5:1 on the hover row; ${colours.accent} is 1% steps towards the text, and one step less fails`, () => {
      expect(contrast(before, colours.line)).toBeLessThan(MIN_TEXT_CONTRAST);
      const step = Array.from({ length: 101 }, (_, k) => k).find((k) => mix(before, colours.text, k / 100) === colours.accent);
      expect(step, `${colours.accent} is not on the way from ${before} to ${colours.text}`).toBeDefined();
      const grounds = [colours.bg, colours.surface, colours.surface2, colours.line];
      for (const ground of grounds) expect(contrast(colours.accent, ground)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      const lessOne = mix(before, colours.text, (step! - 1) / 100);
      expect(grounds.some((ground) => contrast(lessOne, ground) < MIN_TEXT_CONTRAST), `${lessOne} already passed`).toBe(true);
    });

    it(`${id}: white text on accent buttons improves`, () => {
      expect(contrast(colours.onAccent, colours.accent)).toBeGreaterThanOrEqual(contrast(colours.onAccent, before));
      expect(contrast(colours.onAccent, colours.accent)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });

    it(`${id}: its hover row is the theme's line colour, unchanged`, () => {
      expect(`#${toDiscourseScheme(id, themes[id]!).colors.hover}`).toBe(colours.line);
    });
  }

  for (const [id, example] of Object.entries(BOARD_EXAMPLES)) {
    it(`${id}: lands on the Board's example, ${example}`, () => {
      expect(themes[id]!.colours.accent).toBe(example);
    });
  }

  it("covers every light palette", () => {
    expect(Object.keys(ACCENT_BEFORE).sort()).toEqual(themeIds.filter((id) => themes[id]!.mode === "light").sort());
  });
});

describe("dark palettes: accents kept; the hover row moves nearer the page only where links need it", () => {
  for (const id of themeIds.filter((id) => themes[id]!.mode === "dark")) {
    const { colours } = themes[id]!;
    const hover = `#${toDiscourseScheme(id, themes[id]!).colors.hover}`;
    if (!HOVER_MOVED.includes(id)) {
      it(`${id}: hover stays the line colour`, () => expect(hover).toBe(colours.line));
      continue;
    }
    it(`${id}: hover is the line moved towards the page by the smallest 1% step that passes, and stays visible`, () => {
      expect(contrast(colours.accent, colours.line)).toBeLessThan(MIN_TEXT_CONTRAST);
      const step = Array.from({ length: 101 }, (_, k) => k).find((k) => mix(colours.line, colours.bg, k / 100) === hover);
      expect(step).toBeDefined();
      expect(contrast(colours.accent, hover)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      expect(contrast(colours.accent, mix(colours.line, colours.bg, (step! - 1) / 100))).toBeLessThan(MIN_TEXT_CONTRAST);
      expect(contrast(hover, colours.bg)).toBeGreaterThanOrEqual(1.25);
    });
  }
});

describe("the selected row: the page tinted with the accent, no more than links allow", () => {
  for (const id of themeIds) {
    const { colours } = themes[id]!;
    it(`${id}: up to ${SELECTED_ACCENT_SHARE * 100}% towards the accent, and links pass on it`, () => {
      const selected = `#${toDiscourseScheme(id, themes[id]!).colors.selected}`;
      const shares = Array.from({ length: 201 }, (_, k) => k / 1000).filter((share) => mix(colours.bg, colours.accent, share) === selected);
      expect(shares.length, `${selected} is not a tint of ${colours.bg}`).toBeGreaterThan(0);
      expect(Math.min(...shares)).toBeLessThanOrEqual(SELECTED_ACCENT_SHARE);
      expect(contrast(colours.accent, selected)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      expect(contrast(selected, colours.bg)).toBeGreaterThanOrEqual(1.2);
    });
  }
});

describe("Match my car, light: the accent also reaches 4.5:1 on the line (the forum's hover row)", () => {
  for (const [car, picks] of Object.entries(CARS)) {
    it(car, () => {
      const theme = generateTheme(picks, "light");
      expect(contrast(theme.accent, theme.line)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
    });
  }
});
