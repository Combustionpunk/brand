import { mix } from "./colour.ts";
import type { Theme, ThemeColours, ThemeKey } from "./types.ts";
import { themes as defaultThemes } from "./tokens.ts";

/**
 * Which theme key fills each of Discourse's colour-scheme names.
 *
 * | Discourse | Token | Why |
 * |---|---|---|
 * | `primary` | `text` | Discourse's text colour. |
 * | `secondary` | `bg` | Discourse's page background. |
 * | `tertiary` | `accent` | Links and primary buttons. |
 * | `quaternary` | `fast` | The second highlight colour. |
 * | `header_background` | `surface` | The top bar sits on the raised surface. |
 * | `header_primary` | `text` | Text and icons in the top bar. |
 * | `highlight` | `accent` | Search hits and the selected post. |
 * | `danger` | `danger` | Errors and delete buttons. |
 * | `success` | `pb` | The theme's bright green. |
 * | `love` | `danger` | The like heart: the theme's red. |
 */
export const DISCOURSE_MAPPING = {
  primary: "text",
  secondary: "bg",
  tertiary: "accent",
  quaternary: "fast",
  header_background: "surface",
  header_primary: "text",
  highlight: "accent",
  danger: "danger",
  success: "pb",
  love: "danger",
} as const satisfies Record<string, ThemeKey>;

export type DiscourseColourName = keyof typeof DISCOURSE_MAPPING;

/**
 * Discourse's two row colours: the row under the pointer and the chosen row, in dropdowns, menus
 * and the sidebar. A scheme that leaves them out gets Discourse's own light values (`F2F2F2` and
 * `D1F0FF`), which are unreadable under the light text of a dark theme.
 */
export const DISCOURSE_ROW_COLOURS = ["hover", "selected"] as const;

export type DiscourseRowColour = (typeof DISCOURSE_ROW_COLOURS)[number];

/** How far `selected` moves from the page background towards the accent. */
export const SELECTED_ACCENT_SHARE = 0.2;

/**
 * The row colours for a theme, as `#RRGGBB`. Text on them is the theme's `text`.
 *
 * | Discourse | From | Why |
 * |---|---|---|
 * | `hover` | `line` | A step away from the page that shows in light and dark themes alike. |
 * | `selected` | `bg` mixed 20% towards `accent` | The page tinted with the theme's accent. |
 */
export function discourseRowColours(colours: ThemeColours): Record<DiscourseRowColour, string> {
  return {
    hover: colours.line,
    selected: mix(colours.bg, colours.accent, SELECTED_ACCENT_SHARE),
  };
}

export interface DiscourseScheme {
  /** The brand theme's id. */
  id: string;
  /** The scheme's name on the forum. */
  name: string;
  /** Whether this is a dark scheme. */
  dark: boolean;
  /** Discourse colour name to hex, without the `#`, as Discourse stores it. */
  colors: Record<DiscourseColourName | DiscourseRowColour, string>;
}

/** A Discourse colour scheme for a theme: the contents of `dist/discourse/<id>.json`. */
export function toDiscourseScheme(id: string, theme: Theme): DiscourseScheme {
  const names = Object.keys(DISCOURSE_MAPPING) as DiscourseColourName[];
  const bare = (hex: string) => hex.replace(/^#/, "").toUpperCase();
  const rows = discourseRowColours(theme.colours);
  return {
    id,
    name: `RC Misfits: ${theme.name}`,
    dark: theme.mode === "dark",
    colors: Object.fromEntries([
      ...names.map((name) => [name, bare(theme.colours[DISCOURSE_MAPPING[name]])]),
      ...DISCOURSE_ROW_COLOURS.map((name) => [name, bare(rows[name])]),
    ]) as DiscourseScheme["colors"],
  };
}

/**
 * `RRGGBB` in upper case from any hex form CSS allows, or `undefined`: `#fff`, `fff`, `#ffff`,
 * `#FFFFFF`, `#ffffffff`. Sass may shorten `#FFFFFF` to `#fff` when it compiles Discourse's colour
 * variables. A colour that is at all see-through is not a brand colour, so it gives `undefined`.
 */
function normaliseHex(value: string | undefined): string | undefined {
  const hex = (value ?? "").trim().replace(/^#/, "").toUpperCase();
  if (!/^(?:[0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/.test(hex)) return undefined;
  const long = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join("") : hex;
  if (long.length === 8 && !long.endsWith("FF")) return undefined;
  return long.slice(0, 6);
}

/**
 * Which brand theme Discourse is showing, from its live colours (`--primary`, `--secondary`...),
 * or `undefined` if the scheme is not exactly one of the brand's (for example, an admin changed it).
 * Values may be given with or without `#`, in either case, and in short form (`#fff`).
 * Only the mapped colours are compared: `hover` and `selected` follow from them.
 */
export function schemeIdFromColours(
  colours: Partial<Record<string, string>>,
  schemes: Record<string, Theme> = defaultThemes,
): string | undefined {
  const names = Object.keys(DISCOURSE_MAPPING) as DiscourseColourName[];
  for (const [id, theme] of Object.entries(schemes)) {
    const { colors } = toDiscourseScheme(id, theme);
    if (names.every((name) => normaliseHex(colours[name]) === colors[name])) {
      return id;
    }
  }
  return undefined;
}
