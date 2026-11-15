/// <reference lib="dom" />
import type { ThemeKey } from "./types.js";
/** The sites that can be the current one. */
export type SiteId = "forum" | "tracks" | "timing";
/** The links in the bar, in order. */
export type LinkId = "forum" | "meetings" | "tracks" | "timing";
/** The site name shown in the accent colour after "RC MISFITS". */
export declare const SITE_NAMES: Record<SiteId, string>;
/** The four links, their labels, the attribute that overrides each URL, and the live URL. */
export declare const LINKS: ReadonlyArray<{
    id: LinkId;
    label: string;
    attribute: string;
    defaultUrl: string;
}>;
/** Under this viewport width (px) the links fold into the menu button. Matches header.css. */
export declare const PHONE_BREAKPOINT = 640;
/**
 * Every foreground and background colour pair the header uses, with the contrast each needs.
 * The tests check these for every theme and for generator output.
 */
export declare const HEADER_COLOUR_PAIRS: ReadonlyArray<{
    fg: ThemeKey;
    bg: ThemeKey;
    min: number;
    use: string;
}>;
export interface HeaderOptions {
    /** The current site: "forum", "tracks" or "timing". Anything else highlights nothing. */
    site?: string | null;
    /** The signed-in username; empty or missing means signed out. */
    user?: string | null;
    signInUrl?: string | null;
    signOutUrl?: string | null;
    /** Overrides for the link URLs. */
    urls?: Partial<Record<LinkId, string | null>>;
    /** The id of the folding panel, so the menu button can point at it. */
    menuId: string;
}
/** A URL that is http(s), protocol-relative or relative, else null (so `javascript:` and the like never render). */
export declare function safeUrl(value: string | null | undefined): string | null;
/** The header's markup, as `<rm-header>` renders it. */
export declare function renderHeader(options: HeaderOptions): string;
declare const Base: typeof HTMLElement;
/**
 * `<rm-header>`. Sign in and Sign out send a cancelable `rm-sign-in` / `rm-sign-out` event
 * (bubbling) before following their link; an app that calls `preventDefault()` on it handles it itself.
 * `sign-out-url` is only for a URL that is safe to GET: an app whose sign-out is a POST leaves it off
 * and handles `rm-sign-out`.
 */
export declare class RmHeader extends Base {
    #private;
    static observedAttributes: string[];
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "rm-header": RmHeader;
    }
}
/** Registers `<rm-header>`, once. Importing this module already does this in a browser. */
export declare function defineHeader(): void;
export {};
