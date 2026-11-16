import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { schemeIdFromColours, toDiscourseScheme } from "../src/discourse.ts";
import {
  FORUM_THEME_ATTRIBUTE,
  discourseSchemeOrder,
  fontAssets,
  renderAboutJson,
  renderThemeScss,
} from "../src/discourse-theme.ts";
import { themeIds, themes, tokens } from "../src/tokens.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const fontsCss = read("fonts/fonts.css");
const headerCss = read("src/header/header.css");

describe("the order of the forum's colour schemes", () => {
  it("is Pit Lane, then Pit Lane light, then every other theme", () => {
    const order = discourseSchemeOrder(tokens);
    expect(order.slice(0, 2)).toEqual(["pit-lane", "pit-lane-light"]);
    expect([...order].sort()).toEqual([...themeIds].sort());
  });
});

describe("about.json", () => {
  const about = renderAboutJson(tokens, fontsCss);

  it("is a theme component named RC Misfits", () => {
    expect(about.name).toBe("RC Misfits");
    expect(about.component).toBe(true);
    expect(about.about_url).toBe("https://github.com/Combustionpunk/brand");
  });

  it("has every theme as a colour scheme, Pit Lane first, with the mapped Discourse colours", () => {
    const names = Object.keys(about.color_schemes);
    expect(names).toHaveLength(themeIds.length);
    expect(names[0]).toBe("RC Misfits: Pit Lane");
    expect(names[1]).toBe("RC Misfits: Pit Lane light");
    for (const id of themeIds) {
      const scheme = toDiscourseScheme(id, themes[id]!);
      expect(about.color_schemes[scheme.name]).toEqual(scheme.colors);
    }
  });

  it("lists each font file as an asset that exists in fonts/", () => {
    const assets = fontAssets(fontsCss);
    expect(assets.map((a) => a.file).sort()).toEqual(readdirSync(resolve(root, "fonts")).filter((f) => f.endsWith(".woff2")).sort());
    for (const asset of assets) {
      expect(asset.variable).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(about.assets[asset.variable]).toBe(`assets/${asset.file}`);
    }
  });
});

describe("common.scss", () => {
  const scss = renderThemeScss(tokens, fontsCss, headerCss);

  it("loads Oswald and Inter from the component's assets, never from ./ or a CDN", () => {
    for (const asset of fontAssets(fontsCss)) {
      expect(scss).toContain(`url($${asset.variable}) format("woff2")`);
    }
    expect(scss).not.toMatch(/url\(["']?\.\//);
    expect(scss).not.toMatch(/fonts\.googleapis|fonts\.gstatic/);
    expect(scss.match(/@font-face/g)).toHaveLength(fontAssets(fontsCss).length);
  });

  it("uses Inter for Discourse's body text and Oswald for its headings", () => {
    expect(scss).toMatch(/--font-family:\s*var\(--rm-font-body\)/);
    expect(scss).toMatch(/--heading-font-family:\s*var\(--rm-font-display\)/);
  });

  it("has every theme's tokens under the forum's own attribute", () => {
    expect(FORUM_THEME_ATTRIBUTE).toBe("data-rm-theme");
    for (const id of themeIds) {
      const block = scss.split(`html[data-rm-theme="${id}"] {`)[1]?.split("}")[0];
      expect(block, id).toBeDefined();
      expect(block).toContain(`--rm-accent: ${themes[id]!.colours.accent};`);
      expect(block).toContain(`--rm-bg: ${themes[id]!.colours.bg};`);
    }
  });

  it("has the shared tokens (type, space, radii) for every page", () => {
    expect(scss).toContain("--rm-font-display:");
    expect(scss).toContain("--rm-type-body:");
    expect(scss).toContain("--rm-space-4:");
    expect(scss).toContain("--rm-radius-md:");
  });

  it("falls back to Discourse's own colours when the scheme is not a brand theme", () => {
    const block = scss.split("html:not([data-rm-theme]) {")[1]?.split("}")[0];
    expect(block).toBeDefined();
    expect(block).toContain("--rm-bg: var(--secondary);");
    expect(block).toContain("--rm-text: var(--primary);");
    expect(block).toContain("--rm-accent: var(--tertiary);");
    expect(block).toContain("--rm-surface: var(--header_background);");
  });

  it("includes the shared header's stylesheet", () => {
    expect(scss).toContain(headerCss.trim());
  });

  it("uses tabular figures for counts, dates and .rm-figures", () => {
    const rule = scss.split("font-variant-numeric: tabular-nums")[0]!.split("}").at(-1)!;
    for (const selector of [".rm-figures", ".topic-list .num", ".relative-date", ".badge-notification"]) {
      expect(rule).toContain(selector);
    }
  });

  it("does not use Sass features that would break on Discourse's compiler", () => {
    expect(scss).not.toContain("@import");
    expect(scss).not.toContain("@use");
  });
});

describe("matching Discourse's live colours to a brand theme", () => {
  it("finds every theme from its scheme's colours", () => {
    for (const id of themeIds) {
      const { colors } = toDiscourseScheme(id, themes[id]!);
      const live = Object.fromEntries(Object.entries(colors).map(([k, v]) => [k, ` #${v.toLowerCase()}`]));
      expect(schemeIdFromColours(live)).toBe(id);
    }
  });

  it("gives no theme for a scheme the admin has changed", () => {
    const { colors } = toDiscourseScheme("pit-lane", themes["pit-lane"]!);
    expect(schemeIdFromColours({ ...colors, tertiary: "123456" })).toBeUndefined();
    expect(schemeIdFromColours({})).toBeUndefined();
  });

  it("tells every pair of themes apart", () => {
    const keys = themeIds.map((id) => JSON.stringify(toDiscourseScheme(id, themes[id]!).colors));
    expect(new Set(keys).size).toBe(themeIds.length);
  });
});

describe("the Discourse initializer", () => {
  const gjs = read("src/discourse-theme/rm-brand.gjs");

  it("renders <rm-header site=\"forum\"> above Discourse's header", () => {
    expect(gjs).toContain('api.renderInOutlet("above-site-header"');
    expect(gjs).toMatch(/<rm-header[\s\S]*site="forum"/);
    expect(gjs).toContain("user={{this.username}}");
  });

  it("keeps the forum links on this forum, and Meetings on /events", () => {
    expect(gjs).toContain('forum-url="/"');
    expect(gjs).toContain('meetings-url="/events"');
  });

  it("signs in and out with Discourse's own actions, never a GET link", () => {
    expect(gjs).not.toContain("sign-out-url");
    expect(gjs).toContain('{{on "rm-sign-out" this.signOut}}');
    expect(gjs).toContain('{{on "rm-sign-in" this.signIn}}');
    expect(gjs).toContain('send("logout")');
    expect(gjs).toContain('send("showLogin")');
    expect(gjs).toMatch(/preventDefault\(\)/);
  });

  it("keeps the header in step with the member's colour scheme", () => {
    expect(gjs).toContain("watchForumTheme(");
  });
});

describe("the committed discourse/ folder is what the build writes", () => {
  it("about.json", () => {
    expect(JSON.parse(read("discourse/about.json"))).toEqual(renderAboutJson(tokens, fontsCss));
  });

  it("common/common.scss", () => {
    expect(read("discourse/common/common.scss")).toBe(renderThemeScss(tokens, fontsCss, headerCss));
  });

  it("the font files and their licences", () => {
    for (const asset of fontAssets(fontsCss)) {
      expect(readFileSync(resolve(root, "discourse/assets", asset.file))).toEqual(readFileSync(resolve(root, "fonts", asset.file)));
    }
    expect(existsSync(resolve(root, "discourse/assets/OFL-Oswald.txt"))).toBe(true);
    expect(existsSync(resolve(root, "discourse/assets/OFL-Inter.txt"))).toBe(true);
  });

  it("the initializer, the settings and the bundled header", () => {
    expect(read("discourse/javascripts/discourse/api-initializers/rm-brand.gjs")).toBe(read("src/discourse-theme/rm-brand.gjs"));
    expect(read("discourse/settings.yml")).toBe(read("src/discourse-theme/settings.yml"));
    const bundle = read("discourse/javascripts/discourse/lib/rm-brand.js");
    expect(bundle).toContain('customElements.define("rm-header"');
    expect(bundle).toMatch(/export\s*\{[^}]*watchForumTheme/);
  });
});
