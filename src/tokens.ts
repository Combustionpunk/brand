import raw from "../tokens.json" with { type: "json" };
import type { Theme, Tokens } from "./types.ts";

/** Everything in `tokens.json`, typed. */
export const tokens: Tokens = raw as Tokens;

/** Every built-in theme, by id. */
export const themes: Record<string, Theme> = tokens.themes;

/** The built-in theme ids, in display order. */
export const themeIds: string[] = Object.keys(tokens.themes);

/** The default theme's id: Pit Lane. */
export const defaultTheme: string = tokens.defaultTheme;

/** The forum's race-colour palette. */
export const raceColours = tokens.raceColours;
