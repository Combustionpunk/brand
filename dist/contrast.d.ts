import type { ThemeColours, ThemeKey } from "./types.js";
/** Body text must reach this on its background (WCAG AA). */
export declare const MIN_TEXT_CONTRAST = 4.5;
/**
 * Status colours that sit side by side and must be told apart without relying on hue:
 * they need at least this contrast ratio between them, which means they differ in lightness.
 */
export declare const MIN_LIGHTNESS_SEPARATION = 1.25;
/**
 * Every foreground and background pair that carries text, for any theme.
 * Each must reach `MIN_TEXT_CONTRAST`.
 */
export declare const TEXT_PAIRS: ReadonlyArray<readonly [fg: ThemeKey, bg: ThemeKey]>;
/** Pairs that must also differ in lightness, by `MIN_LIGHTNESS_SEPARATION`. */
export declare const DISTINCT_PAIRS: ReadonlyArray<readonly [ThemeKey, ThemeKey]>;
export interface ContrastFailure {
    pair: readonly [ThemeKey, ThemeKey];
    ratio: number;
    required: number;
}
/** The pairs of a theme that miss their contrast requirement. Empty means the theme passes. */
export declare function contrastFailures(colours: ThemeColours): ContrastFailure[];
