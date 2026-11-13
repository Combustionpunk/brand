import type { Theme, Tokens } from "./types.js";
/** Everything in `tokens.json`, typed. */
export declare const tokens: Tokens;
/** Every built-in theme, by id. */
export declare const themes: Record<string, Theme>;
/** The built-in theme ids, in display order. */
export declare const themeIds: string[];
/** The default theme's id: Pit Lane. */
export declare const defaultTheme: string;
/** The forum's race-colour palette. */
export declare const raceColours: import("./types.js").RaceColour[];
