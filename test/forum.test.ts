// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { discourseVariables, toDiscourseScheme } from "../src/discourse.ts";
import {
  MATCH_MY_CAR_STYLE_ID,
  MATCH_MY_CAR_THEME,
  matchMyCarColours,
  matchMyCarCss,
  syncForumTheme,
  watchForumTheme,
} from "../src/discourse-theme/forum.ts";
import { generateTheme } from "../src/generate.ts";
import { themes } from "../src/tokens.ts";

function setScheme(root: HTMLElement, colors: Record<string, string>) {
  for (const [name, hex] of Object.entries(colors)) root.style.setProperty(`--${name}`, `#${hex}`);
}

describe("syncForumTheme", () => {
  it("sets data-rm-theme to the brand theme whose colours Discourse is showing", () => {
    const root = document.createElement("div");
    setScheme(root, toDiscourseScheme("synthwave", themes["synthwave"]!).colors);
    expect(syncForumTheme(root, (name) => root.style.getPropertyValue(name))).toBe("synthwave");
    expect(root.getAttribute("data-rm-theme")).toBe("synthwave");
  });

  it("still finds every light theme when Discourse's CSS gives short hex (#fff)", () => {
    const shorten = (hex: string) =>
      /^(.)\1(.)\2(.)\3$/.test(hex) ? `#${hex[0]}${hex[2]}${hex[4]}`.toLowerCase() : `#${hex.toLowerCase()}`;
    const light = Object.keys(themes).filter((id) => themes[id]!.mode === "light");
    expect(light).toContain("pit-lane-light");
    for (const id of light) {
      const root = document.createElement("div");
      const { colors } = toDiscourseScheme(id, themes[id]!);
      for (const [name, hex] of Object.entries(colors)) root.style.setProperty(`--${name}`, shorten(hex));
      expect(root.style.getPropertyValue("--header_background")).toBe("#fff");
      expect(syncForumTheme(root, (name) => root.style.getPropertyValue(name)), id).toBe(id);
      expect(root.getAttribute("data-rm-theme")).toBe(id);
    }
  });

  it("follows a change of scheme, and removes the attribute for a scheme that is not a brand theme", () => {
    const root = document.createElement("div");
    const read = (name: string) => root.style.getPropertyValue(name);
    setScheme(root, toDiscourseScheme("pit-lane", themes["pit-lane"]!).colors);
    syncForumTheme(root, read);
    expect(root.getAttribute("data-rm-theme")).toBe("pit-lane");
    setScheme(root, toDiscourseScheme("pit-lane-light", themes["pit-lane-light"]!).colors);
    syncForumTheme(root, read);
    expect(root.getAttribute("data-rm-theme")).toBe("pit-lane-light");
    root.style.setProperty("--tertiary", "#123456");
    expect(syncForumTheme(root, read)).toBeUndefined();
    expect(root.hasAttribute("data-rm-theme")).toBe(false);
  });
});

describe("matchMyCarColours", () => {
  it("is the member's race colours when Match my car is on", () => {
    expect(matchMyCarColours({ des_match_my_car: true, des_race_colours: ["#D50000", "#FFFFFF"] })).toEqual([
      "#D50000",
      "#FFFFFF",
    ]);
  });

  it("is nothing when it is off, there are no race colours, or nobody is signed in", () => {
    expect(matchMyCarColours({ des_match_my_car: false, des_race_colours: ["#D50000"] })).toBeUndefined();
    expect(matchMyCarColours({ des_match_my_car: true, des_race_colours: [] })).toBeUndefined();
    expect(matchMyCarColours({ des_match_my_car: true })).toBeUndefined();
    expect(matchMyCarColours({ des_race_colours: ["#D50000"] })).toBeUndefined();
    expect(matchMyCarColours(null)).toBeUndefined();
    expect(matchMyCarColours(undefined)).toBeUndefined();
  });

  it("skips anything that is not a hex colour, and uses only the first three", () => {
    expect(matchMyCarColours({ des_match_my_car: true, des_race_colours: ["red", "#0B1F4B", 7, "#fff", "#000", "#123"] })).toEqual([
      "#0B1F4B",
      "#fff",
      "#000",
    ]);
    expect(matchMyCarColours({ des_match_my_car: true, des_race_colours: ["red"] })).toBeUndefined();
    expect(matchMyCarColours({ des_match_my_car: true, des_race_colours: "#D50000" })).toBeUndefined();
  });
});

describe("matchMyCarCss", () => {
  it("sets Discourse's colours and the brand tokens for the generated theme, above Discourse's :root", () => {
    const css = matchMyCarCss(["#0B1F4B"], "light");
    const theme = generateTheme(["#0B1F4B"], "light");
    const vars = discourseVariables(theme);
    expect(css.startsWith(`html[data-rm-theme="${MATCH_MY_CAR_THEME}"] {`)).toBe(true);
    expect(css).toContain("color-scheme: light;");
    expect(css).toContain(`--primary: ${vars["--primary"]};`);
    expect(css).toContain(`--d-hover: ${vars["--d-hover"]};`);
    expect(css).toContain(`--d-selected: ${vars["--d-selected"]};`);
    expect(css).toContain(`--tertiary-low: ${vars["--tertiary-low"]};`);
    expect(css).toContain(`--rm-bg: ${theme.bg};`);
    expect(css).toContain(`--rm-accent: ${theme.accent};`);
  });
});

/** A document whose device asks for dark or light, and can change its mind. */
function fakeDevice(dark: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    get matches() {
      return dark;
    },
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  };
  const doc = document.implementation.createHTMLDocument("forum");
  Object.defineProperty(doc, "defaultView", { value: { matchMedia: () => media } });
  return {
    doc,
    listeners,
    switchTo(next: "dark" | "light") {
      dark = next === "dark";
      for (const fn of [...listeners]) fn();
    },
  };
}

const style = (doc: Document) => doc.getElementById(MATCH_MY_CAR_STYLE_ID);

describe("watchForumTheme with Match my car", () => {
  it("paints the forum in the member's colours for the device's mode, and follows the device", () => {
    const { doc, switchTo } = fakeDevice(true);
    const watcher = watchForumTheme(doc, { matchMyCar: () => ["#FFF59D"] });
    expect(doc.documentElement.getAttribute("data-rm-theme")).toBe(MATCH_MY_CAR_THEME);
    expect(style(doc)?.textContent).toBe(matchMyCarCss(["#FFF59D"], "dark"));
    expect(style(doc)?.parentNode).toBe(doc.head);

    switchTo("light");
    expect(style(doc)?.textContent).toBe(matchMyCarCss(["#FFF59D"], "light"));
    expect(doc.documentElement.getAttribute("data-rm-theme")).toBe(MATCH_MY_CAR_THEME);
    watcher.stop();
  });

  it("does nothing when it is off: no style, and the member's palette decides the brand theme", () => {
    const { doc } = fakeDevice(true);
    const read = vi.fn(() => "");
    const watcher = watchForumTheme(doc, { matchMyCar: () => undefined, read });
    expect(style(doc)).toBeNull();
    expect(doc.documentElement.hasAttribute("data-rm-theme")).toBe(false);
    expect(read).toHaveBeenCalled();
    watcher.stop();
  });

  it("goes back to the member's palette when the switch is turned off, and paints again when it is on", () => {
    const { doc } = fakeDevice(false);
    let colours: string[] | undefined = ["#D50000", "#FFFFFF"];
    const pitLane = toDiscourseScheme("pit-lane", themes["pit-lane"]!).colors;
    const read = (name: string) => `#${pitLane[name.slice(2) as keyof typeof pitLane] ?? ""}`;
    const watcher = watchForumTheme(doc, { matchMyCar: () => colours, read });
    expect(doc.documentElement.getAttribute("data-rm-theme")).toBe(MATCH_MY_CAR_THEME);

    colours = undefined;
    watcher.refresh();
    expect(style(doc)).toBeNull();
    expect(doc.documentElement.getAttribute("data-rm-theme")).toBe("pit-lane");

    colours = ["#0B1F4B"];
    watcher.refresh();
    expect(style(doc)?.textContent).toBe(matchMyCarCss(["#0B1F4B"], "light"));
    expect(doc.documentElement.getAttribute("data-rm-theme")).toBe(MATCH_MY_CAR_THEME);
    watcher.stop();
  });

  it("keeps a single style element however often it refreshes, and stops listening when stopped", async () => {
    const { doc, listeners } = fakeDevice(true);
    const watcher = watchForumTheme(doc, { matchMyCar: () => ["#0B1F4B"] });
    watcher.refresh();
    watcher.refresh();
    await new Promise((r) => setTimeout(r, 0));
    expect(doc.querySelectorAll(`#${MATCH_MY_CAR_STYLE_ID}`)).toHaveLength(1);
    watcher.stop();
    expect(listeners.size).toBe(0);
  });
});
