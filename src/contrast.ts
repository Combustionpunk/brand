import { contrast } from "./colour.ts";
import type { ThemeColours, ThemeKey } from "./types.ts";

/** Body text must reach this on its background (WCAG AA). */
export const MIN_TEXT_CONTRAST = 4.5;

/**
 * Status colours that sit side by side and must be told apart without relying on hue:
 * they need at least this contrast ratio between them, which means they differ in lightness.
 */
export const MIN_LIGHTNESS_SEPARATION = 1.25;

/**
 * Every foreground and background pair that carries text, for any theme.
 * Each must reach `MIN_TEXT_CONTRAST`.
 */
export const TEXT_PAIRS: ReadonlyArray<readonly [fg: ThemeKey, bg: ThemeKey]> = [
  ["text", "bg"],
  ["text", "surface"],
  ["text", "surface2"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["onAccent", "accent"],
  ["goodText", "good"],
  ["pb", "bg"],
  ["pb", "surface"],
  ["fast", "bg"],
  ["fast", "surface"],
  ["danger", "bg"],
  ["danger", "surface"],
  ["warning", "bg"],
  ["warning", "surface"],
];

/** Pairs that must also differ in lightness, by `MIN_LIGHTNESS_SEPARATION`. */
export const DISTINCT_PAIRS: ReadonlyArray<readonly [ThemeKey, ThemeKey]> = [["danger", "warning"]];

export interface ContrastFailure {
  pair: readonly [ThemeKey, ThemeKey];
  ratio: number;
  required: number;
}

/** The pairs of a theme that miss their contrast requirement. Empty means the theme passes. */
export function contrastFailures(colours: ThemeColours): ContrastFailure[] {
  const failures: ContrastFailure[] = [];
  const check = (pair: readonly [ThemeKey, ThemeKey], required: number) => {
    const ratio = contrast(colours[pair[0]], colours[pair[1]]);
    if (ratio < required) {
      failures.push({ pair, ratio: Math.round(ratio * 100) / 100, required });
    }
  };
  for (const pair of TEXT_PAIRS) {
    check(pair, MIN_TEXT_CONTRAST);
  }
  for (const pair of DISTINCT_PAIRS) {
    check(pair, MIN_LIGHTNESS_SEPARATION);
  }
  return failures;
}
