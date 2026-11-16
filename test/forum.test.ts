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
