/// <reference lib="dom" />
/**
 * The forum theme's script, bundled into discourse/javascripts/discourse/lib/rm-brand.js.
 * Importing it defines <rm-header>.
 */
import { defineHeader } from "../header/header.ts";
import { DISCOURSE_MAPPING, schemeIdFromColours } from "../discourse.ts";
import { FORUM_THEME_ATTRIBUTE } from "../discourse-theme.ts";

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

/**
 * Keeps `data-rm-theme` in step: now, when the device switches light and dark, and when Discourse
 * swaps its colour-scheme stylesheets (a member choosing a scheme, or light, dark or auto).
 * Returns a function that stops watching.
 */
export function watchForumTheme(doc: Document = document): () => void {
  const root = doc.documentElement;
  const sync = () => syncForumTheme(root);
  sync();
  const media = doc.defaultView?.matchMedia?.("(prefers-color-scheme: dark)");
  media?.addEventListener("change", sync);
  // A new stylesheet applies once it loads, so check again then too.
  const onLoad = (event: Event) => {
    if (event.target instanceof HTMLLinkElement) sync();
  };
  doc.addEventListener("load", onLoad, true);
  const observer = new MutationObserver(sync);
  observer.observe(doc.head, { childList: true, subtree: true, attributes: true, attributeFilter: ["media", "href", "disabled"] });
  return () => {
    media?.removeEventListener("change", sync);
    doc.removeEventListener("load", onLoad, true);
    observer.disconnect();
  };
}
