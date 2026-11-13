import { contrast } from "./colour.ts";
import { THEME_KEYS } from "./types.ts";
import type { ThemeColours, ThemeMode, Tokens } from "./types.ts";

const kebab = (name: string) => name.replace(/_/g, "-").replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** The CSS custom property for a token: `onAccent` is `--rm-on-accent`. */
export function cssVarName(key: string): string {
  return `--rm-${kebab(key)}`;
}

/** Whether a theme's ground is dark or light, read from its `bg`. */
export function themeMode(colours: ThemeColours): ThemeMode {
  return contrast(colours.bg, "#000000") < contrast(colours.bg, "#FFFFFF") ? "dark" : "light";
}

/** A theme as `{ "--rm-bg": "#17181B", ... }`, for an inline `style`. */
export function themeToVars(colours: ThemeColours): Record<string, string> {
  return Object.fromEntries(THEME_KEYS.map((key) => [cssVarName(key), colours[key]]));
}

function declarations(colours: ThemeColours): string[] {
  return [`color-scheme: ${themeMode(colours)};`, ...THEME_KEYS.map((key) => `${cssVarName(key)}: ${colours[key]};`)];
}

/**
 * A theme as CSS, for a generated theme ("Match my car", club colours).
 *
 * - `themeToCss(theme)` gives the declarations on one line, ready for a `style` attribute.
 * - `themeToCss(theme, selector)` gives a whole rule, for a `<style>` element:
 *   `themeToCss(theme, '[data-theme="custom"]')`.
 */
export function themeToCss(colours: ThemeColours, selector?: string): string {
  const lines = declarations(colours);
  if (selector === undefined) {
    return lines.join(" ");
  }
  return `${selector} {\n${lines.map((line) => `  ${line}`).join("\n")}\n}\n`;
}

/** The whole of `dist/tokens.css`. */
export function renderTokensCss(tokens: Tokens): string {
  const rule = (selector: string, lines: string[], indent = "") =>
    `${indent}${selector} {\n${lines.map((line) => `${indent}  ${line}`).join("\n")}\n${indent}}\n`;

  const shared: string[] = [
    `--rm-font-display: ${tokens.font.display.stack};`,
    `--rm-font-body: ${tokens.font.body.stack};`,
  ];
  for (const [name, style] of Object.entries(tokens.type)) {
    const prefix = `--rm-type-${kebab(name)}`;
    shared.push(`${prefix}-size: ${style.size};`);
    shared.push(`${prefix}-line: ${style.lineHeight};`);
    shared.push(`${prefix}-weight: ${style.weight};`);
    if (style.letterSpacing !== undefined) {
      shared.push(`${prefix}-tracking: ${style.letterSpacing};`);
    }
    shared.push(`${prefix}: ${style.weight} ${style.size}/${style.lineHeight} var(--rm-font-${style.font});`);
  }
  for (const [name, value] of Object.entries(tokens.space)) {
    shared.push(`--rm-space-${kebab(name)}: ${value};`);
  }
  for (const [name, value] of Object.entries(tokens.radius)) {
    shared.push(`--rm-radius-${kebab(name)}: ${value};`);
  }
  for (const colour of tokens.raceColours) {
    shared.push(`--rm-race-${kebab(colour.key)}: ${colour.hex};`);
  }

  const dark = tokens.themes[tokens.defaultTheme]!;
  const light = tokens.themes[tokens.defaultLightTheme]!;

  const parts: string[] = [
    "/* RC Misfits brand tokens. Generated from tokens.json by `pnpm build`: do not edit. */\n",
    `/* The default theme: ${dark.name}. */\n` + rule(":root", [...declarations(dark.colours), ...shared]),
    `/* No theme chosen and the device asks for light: ${light.name}. */\n` +
      `@media (prefers-color-scheme: light) {\n` +
      rule(":root:not([data-theme])", declarations(light.colours), "  ") +
      `}\n`,
    "/* A chosen theme: <html data-theme=\"...\">. */",
  ];
  for (const [id, theme] of Object.entries(tokens.themes)) {
    parts.push(`/* ${theme.name} */\n` + rule(`[data-theme="${id}"]`, declarations(theme.colours)));
  }
  parts.push(
    "/* Timing numbers: figures of equal width, so columns line up and digits do not jump. */\n" +
      rule(".rm-figures", ["font-variant-numeric: tabular-nums;", 'font-feature-settings: "tnum" 1;']),
  );
  return parts.join("\n");
}
