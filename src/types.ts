/** The colour keys every theme has, in the order they are written out. */
export const THEME_KEYS = [
  "bg",
  "surface",
  "surface2",
  "line",
  "text",
  "muted",
  "accent",
  "onAccent",
  "good",
  "goodText",
  "pb",
  "fast",
  "danger",
  "warning",
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

/** One hex colour (`#RRGGBB`) per key. This is what `generateTheme` returns. */
export type ThemeColours = Record<ThemeKey, string>;

export type ThemeMode = "dark" | "light";

export interface Theme {
  /** Display name, for a theme picker. */
  name: string;
  mode: ThemeMode;
  /** The id of the same theme in the other mode, if there is one. */
  pair?: string;
  colours: ThemeColours;
}

export interface FontToken {
  family: string;
  /** The full `font-family` value, with fallbacks. */
  stack: string;
  /** The weights the type scale uses. */
  weights: number[];
}

export interface TypeStyle {
  font: "display" | "body";
  size: string;
  lineHeight: string;
  weight: number;
  letterSpacing?: string;
}

export interface RaceColour {
  /** The forum's key, for example `fluoro_yellow`. */
  key: string;
  name: string;
  hex: string;
}

export interface Tokens {
  defaultTheme: string;
  defaultLightTheme: string;
  themes: Record<string, Theme>;
  font: { display: FontToken; body: FontToken };
  type: Record<string, TypeStyle>;
  space: Record<string, string>;
  radius: Record<string, string>;
  raceColours: RaceColour[];
}
