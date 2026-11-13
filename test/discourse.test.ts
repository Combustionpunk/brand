import { describe, expect, it } from "vitest";
import { DISCOURSE_MAPPING, toDiscourseScheme } from "../src/discourse.ts";
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
      expect(Object.keys(scheme.colors)).toEqual(NAMES);
      for (const name of NAMES) {
        const key = DISCOURSE_MAPPING[name as keyof typeof DISCOURSE_MAPPING];
        expect(scheme.colors[name as keyof typeof scheme.colors]).toBe(theme.colours[key].slice(1));
        expect(scheme.colors[name as keyof typeof scheme.colors]).toMatch(/^[0-9A-F]{6}$/);
      }
    });
  }
});
