import type { ThemeColours, ThemeMode, Tokens } from "./types.js";
/** The CSS custom property for a token: `onAccent` is `--rm-on-accent`. */
export declare function cssVarName(key: string): string;
/** Whether a theme's ground is dark or light, read from its `bg`. */
export declare function themeMode(colours: ThemeColours): ThemeMode;
/** A theme as `{ "--rm-bg": "#17181B", ... }`, for an inline `style`. */
export declare function themeToVars(colours: ThemeColours): Record<string, string>;
/** A theme's declarations: `color-scheme` and one `--rm-*` per key. */
export declare function themeDeclarations(colours: ThemeColours): string[];
/**
 * A theme as CSS, for a generated theme ("Match my car", club colours).
 *
 * - `themeToCss(theme)` gives the declarations on one line, ready for a `style` attribute.
 * - `themeToCss(theme, selector)` gives a whole rule, for a `<style>` element:
 *   `themeToCss(theme, '[data-theme="custom"]')`.
 */
export declare function themeToCss(colours: ThemeColours, selector?: string): string;
/** The declarations every theme shares: fonts, type styles, spacing, radii and race colours. */
export declare function sharedDeclarations(tokens: Tokens): string[];
/** The whole of `dist/tokens.css`. */
export declare function renderTokensCss(tokens: Tokens): string;
