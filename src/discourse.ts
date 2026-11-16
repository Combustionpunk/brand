import type { Theme, ThemeKey } from "./types.ts";
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

export interface DiscourseScheme {
  /** The brand theme's id. */
  id: string;
  /** The scheme's name on the forum. */
  name: string;
  /** Whether this is a dark scheme. */
  dark: boolean;
  /** Discourse colour name to hex, without the `#`, as Discourse stores it. */
  colors: Record<DiscourseColourName, string>;
}

/** A Discourse colour scheme for a theme: the contents of `dist/discourse/<id>.json`. */
export function toDiscourseScheme(id: string, theme: Theme): DiscourseScheme {
  const names = Object.keys(DISCOURSE_MAPPING) as DiscourseColourName[];
  return {
    id,
    name: `RC Misfits: ${theme.name}`,
    dark: theme.mode === "dark",
    colors: Object.fromEntries(
      names.map((name) => [name, theme.colours[DISCOURSE_MAPPING[name]].replace(/^#/, "").toUpperCase()]),
    ) as Record<DiscourseColourName, string>,
  };
}

const normaliseHex = (value: string | undefined) =>
  (value ?? "").trim().replace(/^#/, "").toUpperCase();

/**
 * Which brand theme Discourse is showing, from its live colours (`--primary`, `--secondary`...),
 * or `undefined` if the scheme is not exactly one of the brand's (for example, an admin changed it).
 * Values may be given with or without `#`, in either case.
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
