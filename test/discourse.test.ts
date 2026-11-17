import { describe, expect, it } from "vitest";
import { contrast, mix } from "../src/colour.ts";
import { MIN_TEXT_CONTRAST } from "../src/contrast.ts";
import { DISCOURSE_MAPPING, DISCOURSE_ROW_COLOURS, toDiscourseScheme } from "../src/discourse.ts";
import { themeIds, themes } from "../src/tokens.ts";

const NAMES = [
  "primary",
  "secondary",
  "tertiary",
  "quaternary",
  "header_background",
  "header_primary",
  "highlight",
  "danger",
  "success",
  "love",
];

describe("Discourse colour schemes", () => {
  it("maps every Discourse colour name to a theme key", () => {
    expect(Object.keys(DISCOURSE_MAPPING)).toEqual(NAMES);
    expect(DISCOURSE_MAPPING).toMatchObject({
      primary: "text",
      secondary: "bg",
      tertiary: "accent",
      header_background: "surface",
      header_primary: "text",
      danger: "danger",
    });
  });

  for (const id of themeIds) {
    it(`${id}: a scheme with Discourse's names and bare hex values`, () => {
      const theme = themes[id]!;
      const scheme = toDiscourseScheme(id, theme);
      expect(scheme.id).toBe(id);
      expect(scheme.name).toBe(`RC Misfits: ${theme.name}`);
      expect(scheme.dark).toBe(theme.mode === "dark");
      expect(Object.keys(scheme.colors)).toEqual([...NAMES, ...DISCOURSE_ROW_COLOURS]);
      for (const name of NAMES) {
        const key = DISCOURSE_MAPPING[name as keyof typeof DISCOURSE_MAPPING];
        expect(scheme.colors[name as keyof typeof scheme.colors]).toBe(theme.colours[key].slice(1));
        expect(scheme.colors[name as keyof typeof scheme.colors]).toMatch(/^[0-9A-F]{6}$/);
      }
    });
  }

  // Discourse fills a missing `hover` or `selected` with its own light values (F2F2F2 and D1F0FF),
  // which put light text on a near-white row in a dark palette (dev-forum test, 17 Nov 2026).
  describe("hover and selected rows (dropdowns, menus, the sidebar)", () => {
    it("names Discourse's two row colours", () => {
      expect(DISCOURSE_ROW_COLOURS).toEqual(["hover", "selected"]);
    });

    for (const id of themeIds) {
      const theme = themes[id]!;
      const { colors } = toDiscourseScheme(id, theme);
      const hover = `#${colors.hover}`;
      const selected = `#${colors.selected}`;

      it(`${id}: defines both as bare hex`, () => {
        expect(colors.hover).toMatch(/^[0-9A-F]{6}$/);
        expect(colors.selected).toMatch(/^[0-9A-F]{6}$/);
      });

      it(`${id}: the theme's text is readable on both`, () => {
        expect(contrast(theme.colours.text, hover)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
        expect(contrast(theme.colours.text, selected)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST);
      });

      it(`${id}: both stay on the page's side of light and dark`, () => {
        // Nearer the background than the text: never a light row in a dark palette, or the reverse.
        for (const row of [hover, selected]) {
          expect(contrast(row, theme.colours.bg)).toBeLessThan(contrast(row, theme.colours.text));
        }
      });

      it(`${id}: both can be seen against the page, and told apart`, () => {
        expect(contrast(hover, theme.colours.bg)).toBeGreaterThanOrEqual(1.15);
        expect(contrast(selected, theme.colours.bg)).toBeGreaterThanOrEqual(1.15);
        expect(colors.hover).not.toBe(colors.selected);
      });

      it(`${id}: hover is the theme's line colour and selected is the page tinted with the accent`, () => {
        expect(hover).toBe(theme.colours.line.toUpperCase());
        expect(selected).toBe(mix(theme.colours.bg, theme.colours.accent, 0.2));
      });
    }
  });
});
