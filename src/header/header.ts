/// <reference lib="dom" />
/**
 * The shared top bar used on every RC Misfits site: `<rm-header>`, a framework-free custom element.
 *
 *   <rm-header site="tracks" user="Yeti" sign-out-url="/auth/logout"></rm-header>
 *
 * It renders into its own light DOM (no shadow root), styled by `header.css`, which uses only
 * the theme tokens, so it follows the page's `data-theme`. Importing this module defines the element.
 */
import logoSvg from "../../assets/logo/rc-misfits-logo.svg?raw";
import type { ThemeKey } from "../types.ts";

/** The sites that can be the current one. */
export type SiteId = "forum" | "tracks" | "timing";

/** The links in the bar, in order. */
export type LinkId = "forum" | "meetings" | "tracks" | "timing";

/** The site name shown in the accent colour after "RC MISFITS". */
export const SITE_NAMES: Record<SiteId, string> = {
  forum: "Forum",
  tracks: "Track Studio",
  timing: "Timing",
};

/** The four links, their labels, the attribute that overrides each URL, and the live URL. */
export const LINKS: ReadonlyArray<{ id: LinkId; label: string; attribute: string; defaultUrl: string }> = [
  { id: "forum", label: "Forum", attribute: "forum-url", defaultUrl: "https://forum.rcmisfits.org/" },
  { id: "meetings", label: "Meetings", attribute: "meetings-url", defaultUrl: "https://forum.rcmisfits.org/c/meetings" },
  { id: "tracks", label: "Tracks", attribute: "tracks-url", defaultUrl: "https://tracks.rcmisfits.org/" },
  { id: "timing", label: "Timing", attribute: "timing-url", defaultUrl: "https://timing.rcmisfits.org/" },
];

/** Under this viewport width (px) the links fold into the menu button. Matches header.css. */
export const PHONE_BREAKPOINT = 640;

/**
 * Every foreground and background colour pair the header uses, with the contrast each needs.
 * The tests check these for every theme and for generator output.
 */
export const HEADER_COLOUR_PAIRS: ReadonlyArray<{ fg: ThemeKey; bg: ThemeKey; min: number; use: string }> = [
  { fg: "text", bg: "surface", min: 4.5, use: "links, the wordmark, Sign in / Sign out, the menu icon" },
  { fg: "accent", bg: "surface", min: 4.5, use: "the site name, the current site, the focus outline" },
  { fg: "muted", bg: "surface", min: 4.5, use: "the username" },
  { fg: "line", bg: "surface", min: 1, use: "borders (decorative, so no minimum)" },
];

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

const LOGO_SRC = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;
// The logo master is 2463 x 1041.
const LOGO_WIDTH = 95;
const LOGO_HEIGHT = 40;

const MENU_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A URL that is http(s), protocol-relative or relative, else null (so `javascript:` and the like never render). */
export function safeUrl(value: string | null | undefined): string | null {
  const url = value?.trim();
  if (!url) {
    return null;
  }
  return /^(https?:)?\/\//i.test(url) || /^(\/|\.\.?\/|[?#])/.test(url) ? url : null;
}

const isSite = (site: string | null | undefined): site is SiteId =>
  site != null && Object.prototype.hasOwnProperty.call(SITE_NAMES, site);

/** The header's markup, as `<rm-header>` renders it. */
export function renderHeader(options: HeaderOptions): string {
  const site = isSite(options.site) ? options.site : null;
  const url = (id: LinkId) => safeUrl(options.urls?.[id]) ?? LINKS.find((link) => link.id === id)!.defaultUrl;
  const user = options.user?.trim() ?? "";

  const brand =
    `<a class="rm-header__brand" href="${escapeHtml(url(site ?? "forum"))}">` +
    `<img class="rm-header__logo" src="${LOGO_SRC}" alt="" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}">` +
    `<span class="rm-header__wordmark">RC Misfits${site ? ` <span class="rm-header__site">${SITE_NAMES[site]}</span>` : ""}</span>` +
    `</a>`;

  const links = LINKS.map(
    (link) =>
      `<li><a data-link="${link.id}" href="${escapeHtml(url(link.id))}"${link.id === site ? ' aria-current="page"' : ""}>${link.label}</a></li>`,
  ).join("");

  const action = (name: "sign-in" | "sign-out", label: string, href: string | null) =>
    href
      ? `<a data-action="${name}" href="${escapeHtml(href)}">${label}</a>`
      : `<button type="button" data-action="${name}">${label}</button>`;
  const account = user
    ? `<span class="rm-header__user">${escapeHtml(user)}</span>${action("sign-out", "Sign out", safeUrl(options.signOutUrl))}`
    : action("sign-in", "Sign in", safeUrl(options.signInUrl));

  const id = escapeHtml(options.menuId);
  return (
    `<header class="rm-header">` +
    brand +
    `<button type="button" class="rm-header__menu" aria-expanded="false" aria-controls="${id}" aria-label="Menu">${MENU_ICON}</button>` +
    `<div class="rm-header__panel" id="${id}">` +
    `<nav aria-label="RC Misfits sites"><ul>${links}</ul></nav>` +
    `<div class="rm-header__account">${account}</div>` +
    `</div>` +
    `</header>`
  );
}

const ATTRIBUTES = ["site", "user", "sign-in-url", "sign-out-url", ...LINKS.map((link) => link.attribute)];

// Lets this module load where there is no DOM (Node, server rendering): the class is only used in a browser.
const Base = (typeof HTMLElement === "undefined" ? class {} : HTMLElement) as typeof HTMLElement;

let instances = 0;

/**
 * `<rm-header>`. Sign in and Sign out send a cancelable `rm-sign-in` / `rm-sign-out` event
 * (bubbling) before following their link; an app that calls `preventDefault()` on it handles it itself.
 */
export class RmHeader extends Base {
  static observedAttributes = ATTRIBUTES;

  readonly #menuId = `rm-header-menu-${++instances}`;
  #wide: MediaQueryList | null = null;

  #onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    const inside = (selector: string) => {
      const match = target?.closest<HTMLElement>(selector);
      return match && this.contains(match) ? match : null;
    };
    if (inside(".rm-header__menu")) {
      this.#setOpen(!this.hasAttribute("data-open"));
      return;
    }
    const action = inside("[data-action]")?.dataset["action"];
    if (action === "sign-in" || action === "sign-out") {
      const proceed = this.dispatchEvent(new CustomEvent(`rm-${action}`, { bubbles: true, cancelable: true, composed: true }));
      if (!proceed) {
        event.preventDefault();
      }
    }
    // Choosing a link or Sign in / Sign out folds the menu away.
    if (action || inside("a[href]")) {
      this.#setOpen(false);
    }
  };

  #onDocumentClick = (event: MouseEvent) => {
    if (this.hasAttribute("data-open") && !(event.target instanceof Node && this.contains(event.target))) {
      this.#setOpen(false);
    }
  };

  #onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && this.hasAttribute("data-open")) {
      this.#setOpen(false);
      // Only take the key, and focus, when the user was in the header: an app's dialog keeps its own Escape.
      if (document.activeElement && this.contains(document.activeElement)) {
        event.preventDefault();
        this.querySelector<HTMLButtonElement>(".rm-header__menu")?.focus();
      }
    }
  };

  #onWide = (event: MediaQueryListEvent) => {
    if (event.matches) {
      this.#setOpen(false);
    }
  };

  connectedCallback(): void {
    this.#render();
    this.addEventListener("click", this.#onClick);
    document.addEventListener("click", this.#onDocumentClick);
    document.addEventListener("keydown", this.#onKeydown);
    this.#wide = typeof matchMedia === "function" ? matchMedia(`(min-width: ${PHONE_BREAKPOINT}px)`) : null;
    this.#wide?.addEventListener?.("change", this.#onWide);
  }

  disconnectedCallback(): void {
    this.removeEventListener("click", this.#onClick);
    document.removeEventListener("click", this.#onDocumentClick);
    document.removeEventListener("keydown", this.#onKeydown);
    this.#wide?.removeEventListener?.("change", this.#onWide);
    this.#wide = null;
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null): void {
    if (this.isConnected && oldValue !== newValue) {
      this.#render();
    }
  }

  #setOpen(open: boolean): void {
    this.toggleAttribute("data-open", open);
    this.querySelector(".rm-header__menu")?.setAttribute("aria-expanded", String(open));
  }

  #render(): void {
    // Re-rendering replaces the markup, so note which control had focus and give it back.
    const focused = document.activeElement instanceof HTMLElement && this.contains(document.activeElement) ? document.activeElement : null;
    const key = focused?.dataset["link"]
      ? `[data-link="${focused.dataset["link"]}"]`
      : focused?.dataset["action"]
        ? "[data-action]"
        : focused?.matches(".rm-header__brand, .rm-header__menu")
          ? `.${focused.className}`
          : null;
    this.removeAttribute("data-open");
    this.innerHTML = renderHeader({
      site: this.getAttribute("site"),
      user: this.getAttribute("user"),
      signInUrl: this.getAttribute("sign-in-url"),
      signOutUrl: this.getAttribute("sign-out-url"),
      urls: Object.fromEntries(LINKS.map((link) => [link.id, this.getAttribute(link.attribute)])),
      menuId: this.#menuId,
    });
    if (key) {
      this.querySelector<HTMLElement>(key)?.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "rm-header": RmHeader;
  }
}

/** Registers `<rm-header>`, once. Importing this module already does this in a browser. */
export function defineHeader(): void {
  if (typeof customElements !== "undefined" && !customElements.get("rm-header")) {
    customElements.define("rm-header", RmHeader);
  }
}

defineHeader();
