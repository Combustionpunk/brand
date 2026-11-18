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
/** The most `selected` moves from the page background towards the accent. */
export declare const SELECTED_ACCENT_SHARE = 0.2;
/**
 * The row colours for a theme, as `#RRGGBB`. Text on them is the theme's `text`; links are its `accent`.
 *
 * | Discourse | From | Why |
 * |---|---|---|
 * | `hover` | `line`, moved towards `bg` in 1% steps until `accent` and `text` reach 4.5:1 on it | A step away from the page that shows in light and dark themes alike. Only Synthwave, Garage and Red Line (dark) move today (#15). |
 * | `selected` | `bg` mixed up to 20% towards `accent`, in 0.5% steps, as far as `accent` still reaches 4.5:1 on it | The page tinted with the theme's accent, with links readable on it (#15). |
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
/**
 * Every colour variable Discourse defines from a palette, for a theme: `--primary`, `--d-hover`,
 * `--primary-low`, `--tertiary-rgb`, `--scheme-type` and the rest, as `#RRGGBB` (or `r, g, b` for
 * the `-rgb` ones). Set them all and the whole forum changes, as if the theme were a palette.
 * Variables that are the same for every palette (brand colours of other sites, `--gold`) and those
 * defined as `var(...)` of these are left out: they follow by themselves.
 */
export declare function discourseVariables(colours: ThemeColours): Record<string, string>;
/**
 * The derived variables that carry text on the page and on the rows of lists and menus, and why.
 * Found by where core's stylesheets use them as `color:` (core at 3aff54f, 17 Nov 2026).
 *
 * Left out on purpose: `--primary-low-mid` (and `-400`, `-500`), which
 * core uses for icons, drag handles, borders, placeholders and disabled controls, none of them
 * text that WCAG asks 4.5:1 of; darkening it to 4.5:1 would also push `-medium` and `-high` darker
 * and flatten the ladder. And `--primary-low`, `--primary-very-low` and the `secondary-*` shades
 * on their own, which are backgrounds and borders.
 */
export declare const DISCOURSE_TEXT_SHADES: Readonly<Record<string, string>>;
/**
 * The text shades of `vars` (from `discourseVariables`) that miss 4.5:1 on the page, the hover
 * row or the selected row, each moved towards `--primary` just far enough, as `#RRGGBB`. Shades that pass are left out.
 * The ladders keep their order: a step that would end up nearer the page than the one before it
 * takes that step's colour.
 */
export declare function readableTextShades(vars: Record<string, string>): Record<string, string>;
/** `discourseVariables` with the readable text shades: what the forum sets for a theme. */
export declare function forumVariables(colours: ThemeColours): Record<string, string>;
