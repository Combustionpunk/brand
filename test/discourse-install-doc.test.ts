import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Issue #9: with only_theme_color_schemes the Preferences dropdown offers the theme's palettes, but Discourse
// only applies a member's saved palette when that palette is user_selectable (ApplicationHelper#user_scheme_id).
// Importing a theme leaves user_selectable false, so the install doc must carry the step that sets it.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const doc = readFileSync(resolve(root, "docs/discourse-install.md"), "utf8");
const source = readFileSync(resolve(root, "src/discourse-theme.ts"), "utf8");
const section = (heading: string) => {
  const start = doc.indexOf(`\n## ${heading}`);
  expect(start, heading).toBeGreaterThan(-1);
  const end = doc.indexOf("\n## ", start + 1);
  return doc.slice(start, end === -1 ? undefined : end);
};

describe("docs/discourse-install.md (#9)", () => {
  it("no longer says there is no Users can select box to tick", () => {
    expect(doc).not.toMatch(/no ["“']?Users can select["”']? box to tick/i);
    expect(source).not.toMatch(/no "Users can select" box to tick/i);
  });

  it("makes the palettes user-selectable after install, with a read-only preview and the console command", () => {
    const install = section("Install");
    expect(install).toMatch(/Allow users to select/);
    expect(install).toMatch(/user_selectable/);
    expect(doc).toMatch(/pluck\(:id, :name, :user_selectable\)/); // preview first, read-only
    expect(doc).toMatch(/update!\(user_selectable: true\)/);
  });

  it("says whether an update keeps the flag, and when it does not", () => {
    const update = section("Update");
    expect(update).toMatch(/user_selectable/);
    expect(update).toMatch(/renam/i);
  });

  it("says that ticking Users can select changes the theme's own palette, not a copy", () => {
    expect(doc).toMatch(/not a copy|no copy|does not make a copy/i);
  });

  it("checks the choice on the dev forum by saving and reloading, light and dark", () => {
    const dev = section("Test on the dev forum");
    expect(dev).toMatch(/Save/);
    expect(dev).toMatch(/reload/i);
    expect(dev).toMatch(/dark/i);
  });

  it("links the Discourse core code it relies on", () => {
    expect(doc).toMatch(/github\.com\/discourse\/discourse\/blob\/[0-9a-f]{40}\/app\/helpers\/application_helper\.rb/);
  });
});
