// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { contrast } from "../src/colour.ts";
import { generateTheme } from "../src/generate.ts";
import {
  HEADER_COLOUR_PAIRS,
  LINKS,
  PHONE_BREAKPOINT,
  SITE_NAMES,
  defineHeader,
  renderHeader,
} from "../src/header/header.ts";
import { themeIds, themes } from "../src/tokens.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const css = read("src/header/header.css");

const SITES = ["forum", "tracks", "timing"] as const;
const LIVE = {
  forum: "https://forum.rcmisfits.org/",
  meetings: "https://forum.rcmisfits.org/c/meetings",
  tracks: "https://tracks.rcmisfits.org/",
  timing: "https://timing.rcmisfits.org/",
};

function mount(attributes: Record<string, string>): HTMLElement {
  const element = document.createElement("rm-header");
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  document.body.append(element);
  return element;
}

const q = <T extends Element = HTMLElement>(element: ParentNode, selector: string) =>
  element.querySelector(selector) as T;
const navLinks = (element: ParentNode) => [...element.querySelectorAll<HTMLAnchorElement>("nav a")];

beforeAll(() => {
  defineHeader();
});

afterEach(() => {
  document.body.innerHTML = "";
});

describe("<rm-header>: rendering per site", () => {
  it.each(SITES)("site=%s highlights that site, and only that one", (site) => {
    const header = mount({ site });
    const links = navLinks(header);
    expect(links.map((a) => a.textContent)).toEqual(["Forum", "Meetings", "Tracks", "Timing"]);
    const current = links.filter((a) => a.getAttribute("aria-current") === "page");
    expect(current).toHaveLength(1);
    expect(current[0]!.dataset["link"]).toBe(site);
  });

  it.each(SITES)("site=%s shows RC MISFITS and the site name, linking home", (site) => {
    const header = mount({ site });
    const brand = q<HTMLAnchorElement>(header, ".rm-header__brand");
    expect(q(brand, ".rm-header__wordmark").textContent).toContain("RC Misfits");
    expect(q(brand, ".rm-header__site").textContent).toBe(SITE_NAMES[site]);
    expect(brand.getAttribute("href")).toBe(LIVE[site]);
  });

  it("shows the logo, from assets/logo, with the wordmark as its text", () => {
    const header = mount({ site: "timing" });
    const logo = q<HTMLImageElement>(header, ".rm-header__logo");
    expect(logo.tagName).toBe("IMG");
    expect(logo.getAttribute("src")).toBe(
      `data:image/svg+xml,${encodeURIComponent(read("assets/logo/rc-misfits-logo.svg"))}`,
    );
    // The wordmark beside it says "RC Misfits", so the image itself is decorative.
    expect(logo.getAttribute("alt")).toBe("");
  });

  it("with no site, or an unknown one, highlights nothing and shows no site name", () => {
    for (const attributes of [{}, { site: "meetings" }, { site: "nope" }]) {
      const header = mount(attributes);
      expect(header.querySelector("[aria-current]")).toBeNull();
      expect(header.querySelector(".rm-header__site")).toBeNull();
      header.remove();
    }
  });

  it("links to the live sites by default", () => {
    const header = mount({ site: "forum" });
    expect(Object.fromEntries(navLinks(header).map((a) => [a.dataset["link"], a.getAttribute("href")]))).toEqual(LIVE);
    expect(LINKS.map((link) => link.defaultUrl)).toEqual(Object.values(LIVE));
  });

  it("takes forum-url, meetings-url, tracks-url and timing-url", () => {
    const header = mount({
      site: "tracks",
      "forum-url": "http://localhost:3000/",
      "meetings-url": "/meetings",
      "tracks-url": "http://localhost:5173/",
      "timing-url": "https://timing.example.test/",
    });
    expect(navLinks(header).map((a) => a.getAttribute("href"))).toEqual([
      "http://localhost:3000/",
      "/meetings",
      "http://localhost:5173/",
      "https://timing.example.test/",
    ]);
    expect(q(header, ".rm-header__brand").getAttribute("href")).toBe("http://localhost:5173/");
  });

  it("ignores a URL that is not http(s) or relative, and keeps the default", () => {
    const header = mount({ site: "forum", "forum-url": "javascript:alert(1)", "sign-in-url": " JavaScript:alert(1)" });
    expect(navLinks(header)[0]!.getAttribute("href")).toBe(LIVE.forum);
    expect(header.innerHTML).not.toMatch(/javascript:/i);
  });

  it("re-renders when an attribute changes", () => {
    const header = mount({ site: "forum" });
    header.setAttribute("site", "timing");
    expect(q(header, "[aria-current]").dataset["link"]).toBe("timing");
    header.setAttribute("user", "Yeti");
    expect(q(header, ".rm-header__user").textContent).toBe("Yeti");
  });
});

describe("<rm-header>: signed in and out", () => {
  it("signed out: a Sign in link to sign-in-url, and no username", () => {
    const header = mount({ site: "tracks", "sign-in-url": "/auth/login" });
    const account = q(header, ".rm-header__account");
    const signIn = q<HTMLAnchorElement>(account, "a");
    expect(signIn.textContent).toBe("Sign in");
    expect(signIn.getAttribute("href")).toBe("/auth/login");
    expect(account.querySelector(".rm-header__user")).toBeNull();
    expect(account.textContent).not.toContain("Sign out");
  });

  it("an empty user is signed out", () => {
    const header = mount({ site: "tracks", user: "  " });
    expect(q(header, ".rm-header__account").textContent).toContain("Sign in");
  });

  it("signed in: the username and a Sign out link to sign-out-url", () => {
    const header = mount({ site: "timing", user: "Yeti", "sign-out-url": "/auth/logout" });
    const account = q(header, ".rm-header__account");
    expect(q(account, ".rm-header__user").textContent).toBe("Yeti");
    const signOut = q<HTMLAnchorElement>(account, "a");
    expect(signOut.textContent).toBe("Sign out");
    expect(signOut.getAttribute("href")).toBe("/auth/logout");
    expect(account.textContent).not.toContain("Sign in");
  });

  it("escapes the username", () => {
    const header = mount({ user: '<img src=x onerror="alert(1)">' });
    expect(header.querySelector(".rm-header__user img")).toBeNull();
    expect(q(header, ".rm-header__user").textContent).toBe('<img src=x onerror="alert(1)">');
  });

  it("with no URL, Sign in and Sign out are buttons that only send an event", () => {
    const header = mount({});
    expect(q(header, ".rm-header__account button").textContent).toBe("Sign in");
    header.setAttribute("user", "Yeti");
    expect(q(header, ".rm-header__account button").textContent).toBe("Sign out");
  });

  it("sends a cancelable rm-sign-in / rm-sign-out event, so an app can handle it itself", () => {
    const header = mount({ "sign-in-url": "/login" });
    const seen: string[] = [];
    document.addEventListener("rm-sign-in", (event) => {
      seen.push(event.type);
      event.preventDefault();
    });
    const click = new MouseEvent("click", { bubbles: true, cancelable: true });
    q(header, ".rm-header__account a").dispatchEvent(click);
    expect(seen).toEqual(["rm-sign-in"]);
    expect(click.defaultPrevented).toBe(true);

    header.setAttribute("user", "Yeti");
    let signOut = 0;
    header.addEventListener("rm-sign-out", () => signOut++);
    const click2 = new MouseEvent("click", { bubbles: true, cancelable: true });
    q(header, ".rm-header__account button").dispatchEvent(click2);
    expect(signOut).toBe(1);
    expect(click2.defaultPrevented).toBe(false);
  });
});

describe("<rm-header>: the menu on a phone", () => {
  const button = (header: HTMLElement) => q<HTMLButtonElement>(header, ".rm-header__menu");
  const panel = (header: HTMLElement) => q(header, ".rm-header__panel");

  it("has a menu button that controls the panel holding the links and the account", () => {
    const header = mount({ site: "forum" });
    expect(button(header).tagName).toBe("BUTTON");
    expect(button(header).getAttribute("type")).toBe("button");
    expect(button(header).getAttribute("aria-expanded")).toBe("false");
    expect(button(header).getAttribute("aria-controls")).toBe(panel(header).id);
    expect(button(header).getAttribute("aria-label") ?? button(header).textContent).toMatch(/menu/i);
    expect(panel(header).querySelector("nav")).not.toBeNull();
    expect(panel(header).querySelector(".rm-header__account")).not.toBeNull();
    // The logo and site name stay outside the panel, so they show when it is folded.
    expect(panel(header).querySelector(".rm-header__brand")).toBeNull();
  });

  it("gives each header its own panel id", () => {
    const one = mount({});
    const two = mount({});
    expect(panel(one).id).not.toBe(panel(two).id);
  });

  it("opens and closes on click (and so on Enter and Space, as a native button)", () => {
    const header = mount({});
    button(header).click();
    expect(button(header).getAttribute("aria-expanded")).toBe("true");
    expect(header.hasAttribute("data-open")).toBe(true);
    button(header).click();
    expect(button(header).getAttribute("aria-expanded")).toBe("false");
    expect(header.hasAttribute("data-open")).toBe(false);
  });

  it("closes on Escape and puts focus back on the menu button", () => {
    const header = mount({});
    button(header).click();
    navLinks(header)[1]!.focus();
    navLinks(header)[1]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(button(header).getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(button(header));
  });

  it("leaves Escape alone when the menu is closed", () => {
    const header = mount({});
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    document.body.dispatchEvent(escape);
    expect(escape.defaultPrevented).toBe(false);
    expect(button(header).getAttribute("aria-expanded")).toBe("false");
  });

  it("closes on a click outside it, and when it is removed it stops listening", () => {
    const header = mount({});
    button(header).click();
    document.body.click();
    expect(button(header).getAttribute("aria-expanded")).toBe("false");
    button(header).click();
    header.remove();
    expect(() => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))).not.toThrow();
  });

  it("folds the links into the menu under 640 px, in CSS", () => {
    expect(PHONE_BREAKPOINT).toBe(640);
    const phone = /@media \(max-width: 639\.98px\) \{([\s\S]*?)\n\}/.exec(css);
    expect(phone, "a phone media query").not.toBeNull();
    const rules = phone![1]!;
    expect(rules).toMatch(/\.rm-header__menu \{[^}]*display: inline-flex/);
    expect(rules).toMatch(/\.rm-header__panel \{[^}]*display: none/);
    expect(rules).toMatch(/rm-header\[data-open\] \.rm-header__panel \{[^}]*display: block/);
    // The menu button is hidden on wider screens.
    expect(css).toMatch(/\.rm-header__menu \{[^}]*display: none/);
  });
});

describe("<rm-header>: accessible", () => {
  it("has a labelled nav", () => {
    const header = mount({ site: "forum" });
    expect(q(header, "nav").getAttribute("aria-label")).toBe("RC Misfits sites");
  });

  it("shows focus with a visible outline", () => {
    expect(css).toMatch(/rm-header :focus-visible \{[^}]*outline: 2px solid var\(--rm-accent\)/);
  });

  it("makes every link and button at least 44 px tall and wide", () => {
    const targets = /([^{}]+)\{[^}]*min-height: 44px;[^}]*min-width: 44px;/.exec(css);
    expect(targets).not.toBeNull();
    for (const selector of [".rm-header__brand", ".rm-header__panel a", ".rm-header__panel button", ".rm-header__menu"]) {
      expect(targets![1]).toContain(selector);
    }
  });
});

describe("<rm-header>: theming", () => {
  it("has no colours of its own: only the theme's custom properties", () => {
    const declarations = css.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(declarations).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(declarations).not.toMatch(/\b(rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/i);
    expect(declarations).not.toMatch(/:\s*(white|black|gray|grey|red|blue|green|yellow)\b/i);
    expect(declarations).not.toMatch(/data-theme/);
  });

  it("uses only the colour pairs it checks", () => {
    const colourKeys = Object.keys(themes[themeIds[0]!]!.colours);
    const toVar = (key: string) => `--rm-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`;
    const used = new Set([...css.matchAll(/var\((--rm-[a-z0-9-]+)\)/g)].map((m) => m[1]!));
    const checked = new Set(HEADER_COLOUR_PAIRS.flatMap((pair) => [toVar(pair.fg), toVar(pair.bg)]));
    for (const name of used) {
      const isColour = colourKeys.some((key) => toVar(key) === name);
      if (isColour) {
        expect(checked, name).toContain(name);
      }
    }
  });

  it.each(themeIds)("%s: every header colour pair is readable", (id) => {
    const colours = themes[id]!.colours;
    for (const pair of HEADER_COLOUR_PAIRS) {
      const ratio = contrast(colours[pair.fg], colours[pair.bg]);
      expect(ratio, `${pair.fg} on ${pair.bg} (${pair.use})`).toBeGreaterThanOrEqual(pair.min);
    }
  });

  it("generator output: every header colour pair is readable", () => {
    const samples = [["#d32f2f", "#1565c0", "#fdd835"], ["#7b1fa2"], ["#00e676", "#ff4081"], []];
    for (const colours of samples) {
      for (const mode of ["dark", "light"] as const) {
        const theme = generateTheme(colours, mode);
        for (const pair of HEADER_COLOUR_PAIRS) {
          expect(contrast(theme[pair.fg], theme[pair.bg]), `${colours} ${mode} ${pair.fg}/${pair.bg}`).toBeGreaterThanOrEqual(pair.min);
        }
      }
    }
  });

  it("sets its type from the tokens: Oswald for the wordmark and links", () => {
    expect(css).toMatch(/\.rm-header__wordmark \{[^}]*font: var\(--rm-type-subheading\)/);
    expect(css).toMatch(/\.rm-header nav a \{[^}]*font: var\(--rm-type-subheading\)/);
    expect(css).toMatch(/\.rm-header__site \{[^}]*color: var\(--rm-accent\)/);
  });
});

describe("renderHeader", () => {
  it("is the same markup the element renders", () => {
    const header = mount({ site: "timing", user: "Yeti", "sign-out-url": "/out" });
    const id = q(header, ".rm-header__panel").id;
    const fresh = document.createElement("div");
    fresh.innerHTML = renderHeader({ site: "timing", user: "Yeti", signOutUrl: "/out", menuId: id });
    expect(header.innerHTML).toBe(fresh.innerHTML);
  });
});

describe("the built header", () => {
  it("dist/header.css is src/header/header.css", () => {
    expect(read("dist/header.css")).toBe(css);
  });

  it("dist/header.js defines <rm-header> on import and renders the same markup", async () => {
    const built = (await import(resolve(root, "dist/header.js"))) as typeof import("../src/header/header.ts");
    expect(customElements.get("rm-header")).toBeDefined();
    expect(built.renderHeader({ site: "tracks", user: "Yeti", menuId: "m" })).toBe(
      renderHeader({ site: "tracks", user: "Yeti", menuId: "m" }),
    );
    expect(read("dist/header.d.ts")).toContain("renderHeader");
  });
});
