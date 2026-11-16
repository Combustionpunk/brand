import { type DiscourseColourName } from "./discourse.js";
import type { ThemeKey, Tokens } from "./types.js";
/**
 * The attribute on `<html>` that names the brand theme on the forum. Not `data-theme`, to keep
 * clear of Discourse's `data-theme-id` and of other components. The component's script sets it from the member's colour scheme.
 */
export declare const FORUM_THEME_ATTRIBUTE = "data-rm-theme";
/** The repo the component comes from. */
export declare const ABOUT_URL = "https://github.com/Combustionpunk/brand";
/**
 * For a colour scheme that is not exactly a brand theme (one an admin made or changed),
 * the `--rm-*` colours come from Discourse's own colour variables instead.
 */
export declare const DISCOURSE_FALLBACK: Record<ThemeKey, string>;
/** Discourse's numbers that should line up: counts, dates, badges, and the brand's own class. */
export declare const TABULAR_SELECTORS: string[];
/** Theme ids in the order the forum lists them: the default, the default light, then the rest. */
export declare function discourseSchemeOrder(tokens: Tokens): string[];
export interface FontAsset {
    /** The SCSS variable Discourse gives the uploaded file: `$rm-oswald-latin`. */
    variable: string;
    /** The file name in fonts/ and discourse/assets/. */
    file: string;
}
/** The woff2 files fonts.css uses, each with its Discourse asset variable. */
export declare function fontAssets(fontsCss: string): FontAsset[];
export interface AboutJson {
    name: string;
    component: true;
    about_url: string;
    license_url: string;
    authors: string;
    assets: Record<string, string>;
    color_schemes: Record<string, Record<DiscourseColourName, string>>;
}
/** The component's `about.json`. */
export declare function renderAboutJson(tokens: Tokens, fontsCss: string): AboutJson;
/** The component's `common/common.scss`: fonts, tokens, the header's CSS and Discourse's fonts and figures. */
export declare function renderThemeScss(tokens: Tokens, fontsCss: string, headerCss: string): string;
