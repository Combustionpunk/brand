import type { Theme, ThemeColours } from "./types.js";
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
export declare const DISCOURSE_MAPPING: {
    readonly primary: "text";
    readonly secondary: "bg";
    readonly tertiary: "accent";
    readonly quaternary: "fast";
    readonly header_background: "surface";
    readonly header_primary: "text";
    readonly highlight: "accent";
    readonly danger: "danger";
    readonly success: "pb";
    readonly love: "danger";
};
export type DiscourseColourName = keyof typeof DISCOURSE_MAPPING;
/**
 * Discourse's two row colours: the row under the pointer and the chosen row, in dropdowns, menus
 * and the sidebar. A scheme that leaves them out gets Discourse's own light values (`F2F2F2` and
 * `D1F0FF`), which are unreadable under the light text of a dark theme.
 */
export declare const DISCOURSE_ROW_COLOURS: readonly ["hover", "selected"];
export type DiscourseRowColour = (typeof DISCOURSE_ROW_COLOURS)[number];
/** How far `selected` moves from the page background towards the accent. */
export declare const SELECTED_ACCENT_SHARE = 0.2;
/**
 * The row colours for a theme, as `#RRGGBB`. Text on them is the theme's `text`.
 *
 * | Discourse | From | Why |
 * |---|---|---|
 * | `hover` | `line` | A step away from the page that shows in light and dark themes alike. |
 * | `selected` | `bg` mixed 20% towards `accent` | The page tinted with the theme's accent. |
 */
export declare function discourseRowColours(colours: ThemeColours): Record<DiscourseRowColour, string>;
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
export declare function toDiscourseScheme(id: string, theme: Theme): DiscourseScheme;
/**
 * Which brand theme Discourse is showing, from its live colours (`--primary`, `--secondary`...),
 * or `undefined` if the scheme is not exactly one of the brand's (for example, an admin changed it).
 * Values may be given with or without `#`, in either case, and in short form (`#fff`).
 * Only the mapped colours are compared: `hover` and `selected` follow from them.
 */
export declare function schemeIdFromColours(colours: Partial<Record<string, string>>, schemes?: Record<string, Theme>): string | undefined;
