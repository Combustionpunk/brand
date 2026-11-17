/// <reference lib="dom" />
/**
 * The forum theme's script, bundled into discourse/javascripts/discourse/lib/rm-brand.js.
 * Importing it defines <rm-header>.
 */
import { defineHeader } from "../header/header.ts";
import { isHex } from "../colour.ts";
import { themeDeclarations } from "../css.ts";
import { DISCOURSE_MAPPING, discourseVariables, schemeIdFromColours } from "../discourse.ts";
import { FORUM_THEME_ATTRIBUTE } from "../discourse-theme.ts";
import { generateTheme } from "../generate.ts";
import type { ThemeMode } from "../types.ts";

defineHeader();

type Read = (property: string) => string;

/**
 * Sets `data-rm-theme` on `root` to the brand theme whose colours Discourse is showing, or
 * removes it for a scheme that is not a brand theme. Returns the theme id.
 */
export function syncForumTheme(root: HTMLElement, read: Read = (p) => getComputedStyle(root).getPropertyValue(p)): string | undefined {
  const live = Object.fromEntries(Object.keys(DISCOURSE_MAPPING).map((name) => [name, read(`--${name}`)]));
  const id = schemeIdFromColours(live);
  if (id === undefined) {
    root.removeAttribute(FORUM_THEME_ATTRIBUTE);
  } else if (root.getAttribute(FORUM_THEME_ATTRIBUTE) !== id) {
    root.setAttribute(FORUM_THEME_ATTRIBUTE, id);
  }
  return id;
}

/** `data-rm-theme` while the forum shows Match my car. A generated theme has no id of its own. */
export const MATCH_MY_CAR_THEME = "match-my-car";

/** The id of the `<style>` that holds a member's Match my car colours. */
export const MATCH_MY_CAR_STYLE_ID = "rm-match-my-car";

/** What the plugin (discourse-event-system #456) puts on the current user. */
export interface MatchMyCarUser {
  /** The member's Match my car switch in Preferences › Interface. */
  des_match_my_car?: unknown;
  /** The member's race colours as hex, main colour first, 0 to 3 of them. */
  des_race_colours?: unknown;
}

/**
 * The race colours to paint the forum in: the member's, when their Match my car switch is on and
 * they have race colours. Otherwise `undefined`, and the member's own palettes apply.
 * Anything that is not a hex colour is skipped; only the first three count.
 */
export function matchMyCarColours(user: MatchMyCarUser | null | undefined): string[] | undefined {
  if (user?.des_match_my_car !== true || !Array.isArray(user.des_race_colours)) return undefined;
  const colours = user.des_race_colours.filter(isHex).slice(0, 3);
  return colours.length > 0 ? colours : undefined;
}

/**
 * The CSS for Match my car: every colour variable Discourse defines, and the brand's `--rm-*`
 * tokens, for the theme generated from `colours` in `mode`. The selector
 * `html[data-rm-theme="match-my-car"]` is more specific than the `:root` of Discourse's palette
 * stylesheets, so it wins whichever loads last.
 */
export function matchMyCarCss(colours: readonly string[], mode: ThemeMode): string {
  const theme = generateTheme(colours, mode);
  const lines = [
    ...themeDeclarations(theme),
    ...Object.entries(discourseVariables(theme)).map(([name, value]) => `${name}: ${value};`),
  ];
  return `html[${FORUM_THEME_ATTRIBUTE}="${MATCH_MY_CAR_THEME}"] {\n${lines.map((line) => `  ${line}`).join("\n")}\n}\n`;
}

export interface ForumThemeOptions {
  /** The member's race colours while Match my car is on, else `undefined`. Asked on every refresh. */
  matchMyCar?: () => readonly string[] | undefined;
  /** Reads one of Discourse's live colour variables. The page's computed style by default. */
  read?: Read;
}

export interface ForumThemeWatcher {
  /** Paints again: call it when the member turns Match my car on or off. */
  refresh(): void;
  /** Stops watching. Leaves the forum as it is. */
  stop(): void;
}

/**
 * Keeps the forum's brand theme in step, now, when the device switches light and dark, and when
 * Discourse swaps its colour-scheme stylesheets (a member choosing a palette).
 *
 * - **Match my car on** (`matchMyCar` gives colours): the forum is painted in the theme generated
 *   from them, light or dark as the device asks, and `data-rm-theme` is `match-my-car`.
 * - **Otherwise:** no Match my car style, and `data-rm-theme` names the brand theme whose colours
 *   Discourse is showing, if it is one.
 */
export function watchForumTheme(doc: Document = document, options: ForumThemeOptions = {}): ForumThemeWatcher {
  const root = doc.documentElement;
  const media = doc.defaultView?.matchMedia?.("(prefers-color-scheme: dark)");
  const read: Read = options.read ?? ((p) => getComputedStyle(root).getPropertyValue(p));

  const sync = () => {
    const colours = options.matchMyCar?.();
    let style = doc.getElementById(MATCH_MY_CAR_STYLE_ID);
    if (colours === undefined) {
      style?.remove();
      syncForumTheme(root, read);
      return;
    }
    const css = matchMyCarCss(colours, media?.matches === false ? "light" : "dark");
    if (style === null) {
      style = doc.createElement("style");
      style.id = MATCH_MY_CAR_STYLE_ID;
    }
    // Only written when it changes, so watching <head> doesn't loop.
    if (style.textContent !== css) style.textContent = css;
    if (style.parentNode !== doc.head) doc.head.append(style);
    if (root.getAttribute(FORUM_THEME_ATTRIBUTE) !== MATCH_MY_CAR_THEME) root.setAttribute(FORUM_THEME_ATTRIBUTE, MATCH_MY_CAR_THEME);
  };

  sync();
  media?.addEventListener("change", sync);
  // A new stylesheet applies once it loads, so check again then too.
  const onLoad = (event: Event) => {
    if (event.target instanceof HTMLLinkElement) sync();
  };
  doc.addEventListener("load", onLoad, true);
  const observer = new MutationObserver(sync);
  observer.observe(doc.head, { childList: true, subtree: true, attributes: true, attributeFilter: ["media", "href", "disabled"] });
  return {
    refresh: sync,
    stop() {
      media?.removeEventListener("change", sync);
      doc.removeEventListener("load", onLoad, true);
      observer.disconnect();
    },
  };
}
