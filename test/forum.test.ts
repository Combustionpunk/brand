// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { toDiscourseScheme } from "../src/discourse.ts";
import { syncForumTheme } from "../src/discourse-theme/forum.ts";
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
