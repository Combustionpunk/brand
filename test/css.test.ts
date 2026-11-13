import { describe, expect, it } from "vitest";
import { cssVarName, renderTokensCss, themeToCss, themeToVars } from "../src/css.ts";
import { generateTheme } from "../src/generate.ts";
import { themeIds, themes, tokens } from "../src/tokens.ts";
import { THEME_KEYS } from "../src/types.ts";

const css = renderTokensCss(tokens);

/** The body of the first block whose selector is exactly `selector`. */
function block(source: string, selector: string): string {
  const start = source.indexOf(`${selector} {`);
  expect(start, `block ${selector}`).toBeGreaterThanOrEqual(0);
  const open = source.indexOf("{", start);
  return source.slice(open + 1, source.indexOf("}", open));
}

describe("CSS variable names", () => {
  it("are --rm-<key>, in kebab case", () => {
    expect(cssVarName("accent")).toBe("--rm-accent");
    expect(cssVarName("onAccent")).toBe("--rm-on-accent");
    expect(cssVarName("goodText")).toBe("--rm-good-text");
    expect(cssVarName("surface2")).toBe("--rm-surface2");
  });
});

describe("themeToCss", () => {
  const theme = themes["pit-lane"]!.colours;

  it("writes one declaration per key", () => {
    const out = themeToCss(theme);
    for (const key of THEME_KEYS) {
      expect(out).toContain(`${cssVarName(key)}: ${theme[key]};`);
    }
    expect(out.match(/--rm-/g)).toHaveLength(THEME_KEYS.length);
    expect(out).not.toContain("{");
  });

  it("wraps the declarations in a rule when given a selector", () => {
    const out = themeToCss(theme, '[data-theme="custom"]');
    expect(out.startsWith('[data-theme="custom"] {')).toBe(true);
    expect(out.trimEnd().endsWith("}")).toBe(true);
    expect(block(out, '[data-theme="custom"]')).toContain("--rm-accent: #FFC72C;");
  });

  it("works on a generated theme, and sets color-scheme from the ground", () => {
    const dark = themeToCss(generateTheme(["#d32f2f", "#1565c0"], "dark"));
    const light = themeToCss(generateTheme(["#d32f2f", "#1565c0"], "light"));
    expect(dark).toContain("color-scheme: dark;");
    expect(light).toContain("color-scheme: light;");
  });

  it("themeToVars gives the same values as an object, for inline styles", () => {
    const vars = themeToVars(theme);
    expect(Object.keys(vars)).toHaveLength(THEME_KEYS.length);
    expect(vars["--rm-on-accent"]).toBe("#17181B");
  });
});

describe("tokens.css", () => {
  it("makes :root Pit Lane", () => {
    const root = block(css, ":root");
    for (const key of THEME_KEYS) {
      expect(root).toContain(`${cssVarName(key)}: ${themes["pit-lane"]!.colours[key]};`);
    }
    expect(root).toContain("color-scheme: dark;");
  });

  it("has a [data-theme] block for every theme, after :root", () => {
    for (const id of themeIds) {
      const selector = `[data-theme="${id}"]`;
      const body = block(css, selector);
      for (const key of THEME_KEYS) {
        expect(body, `${id} ${key}`).toContain(`${cssVarName(key)}: ${themes[id]!.colours[key]};`);
      }
      expect(body).toContain(`color-scheme: ${themes[id]!.mode};`);
      expect(css.indexOf(selector)).toBeGreaterThan(css.indexOf(":root {"));
    }
  });

  it("maps to Pit Lane light under prefers-color-scheme: light, only when no theme is chosen", () => {
    const start = css.indexOf("@media (prefers-color-scheme: light)");
    expect(start).toBeGreaterThan(0);
    const media = css.slice(start);
    const body = block(media, ":root:not([data-theme])");
    for (const key of THEME_KEYS) {
      expect(body).toContain(`${cssVarName(key)}: ${themes["pit-lane-light"]!.colours[key]};`);
    }
    expect(body).toContain("color-scheme: light;");
    // It comes before the [data-theme] blocks would matter: a chosen theme never matches it.
    expect(media).not.toContain(":root {");
  });

  it("carries the fonts, type scale, spacing, radii and race colours on :root", () => {
    const root = block(css, ":root");
    expect(root).toContain(`--rm-font-display: ${tokens.font.display.stack};`);
    expect(root).toContain(`--rm-font-body: ${tokens.font.body.stack};`);
    expect(root).toContain("--rm-type-title-size: 2rem;");
    expect(root).toContain("--rm-type-title-weight: 500;");
    expect(root).toContain("--rm-type-body-line: 1.375rem;");
    expect(root).toContain("--rm-type-title: 500 2rem/2.375rem var(--rm-font-display);");
    expect(root).toContain("--rm-space-4: 1rem;");
    expect(root).toContain("--rm-radius-md: 6px;");
    expect(root).toContain("--rm-race-fluoro-yellow: #e6ff00;");
    for (const colour of tokens.raceColours) {
      expect(root).toContain(`--rm-race-${colour.key.replace(/_/g, "-")}: ${colour.hex};`);
    }
  });

  it("offers tabular figures for timing numbers", () => {
    expect(block(css, ".rm-figures")).toContain("font-variant-numeric: tabular-nums;");
  });

  it("only uses the --rm- prefix", () => {
    for (const name of css.match(/--[a-z][a-z0-9-]*/g) ?? []) {
      expect(name.startsWith("--rm-"), name).toBe(true);
    }
  });
});
