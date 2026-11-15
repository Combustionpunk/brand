import type { Theme } from "./types.js";
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
export declare function toDiscourseScheme(id: string, theme: Theme): DiscourseScheme;
