import type { ThemeColours, ThemeMode } from "./types.js";
/** Below this chroma a colour is neutral: white, black, silver and other greys. */
export declare const NEUTRAL_CHROMA = 0.12;
/** The part each colour plays. All are optional: an empty set gives Pit Lane. */
export interface ThemeRoles {
    /** Buttons, links and the selected state. */
    accent?: string;
    /** Tints the background. Without it the background takes a hint of the accent. */
    tint?: string;
    /** The fastest-lap highlight. Without it, the accent's opposite hue. */
    fast?: string;
}
/**
 * Sorts up to three colours into roles:
 * - white, black and silver (low chroma) are neutral and take no role, and repeats count once;
 * - the accent is the colour with the most chroma (the earlier one wins a tie);
 * - the tint is the deepest (darkest) colour left;
 * - the highlight is the one after that.
 */
export declare function pickRoles(colours?: readonly string[]): ThemeRoles;
/**
 * `danger` and `warning` for a set of grounds: readable on each of them, and different in
 * lightness from each other. The built-in themes' values in `tokens.json` were chosen with this.
 */
export declare function statusColours(grounds: readonly string[], mode: ThemeMode, accent?: string): Pick<ThemeColours, "danger" | "warning">;
/**
 * Builds a theme from colours whose roles are already decided. `generateTheme` is
 * `themeFromRoles(pickRoles(colours), mode)`. The light versions of the dark-only built-in themes
 * come from this, given the dark theme's accent, background and highlight.
 */
export declare function themeFromRoles(roles: ThemeRoles, mode?: ThemeMode): ThemeColours;
/**
 * "Match my car" and "club colours": a complete theme from up to three hex colours, main first.
 *
 * - White, black and silver are neutral.
 * - The accent is the colour with the most chroma.
 * - The deepest remaining colour tints the background (saturation capped at 40%).
 * - The highlight (`fast`) is the third colour, else the accent's opposite hue.
 * - `pb` is a fixed green.
 * - Accent, `fast`, `pb`, `text`, `muted`, `danger` and `warning` are adjusted in lightness until
 *   each reaches 4.5:1 on `bg`, `surface` and `surface2`.
 * - `pb` and `fast`, and `danger` and `warning`, also differ in lightness.
 * - With no chromatic colour at all (none given, or all white), the result is Pit Lane, with
 *   lightness adjusted where Pit Lane itself misses the rules above.
 *
 * Only the first three colours are used. Throws a `RangeError` for a value that is not a hex
 * colour or a mode that is not `"dark"` or `"light"`.
 */
export declare function generateTheme(colours?: readonly string[], mode?: ThemeMode): ThemeColours;
