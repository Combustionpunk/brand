import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const doc = readFileSync(new URL("../docs/discourse-install.md", import.meta.url), "utf8");

/** The text of "Where Discourse installs it from", option 1 (up to option 2). */
function optionOne(): string {
  const start = doc.indexOf("## Where Discourse installs it from");
  const from = doc.indexOf("1. **A branch in this repo**", start);
  const to = doc.indexOf("2. **A separate public repo**", from);
  expect(start).toBeGreaterThan(-1);
  expect(from).toBeGreaterThan(-1);
  expect(to).toBeGreaterThan(from);
  return doc.slice(from, to);
}

describe("docs/discourse-install.md: publishing the discourse-theme branch (#7)", () => {
  it("uses filter-branch, not git subtree, anywhere in the doc", () => {
    expect(doc).not.toMatch(/git subtree/);
    const text = optionOne();
    expect(text).toContain("git branch discourse-theme-new main");
    expect(text).toContain(
      "FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --subdirectory-filter discourse discourse-theme-new",
    );
    expect(text).toContain("git ls-tree --name-only discourse-theme-new");
    expect(text).toContain("git push origin discourse-theme-new:discourse-theme");
    expect(text).toMatch(/git tag discourse-v\S+ discourse-theme-new && git push origin discourse-v\S+/);
    expect(text).toContain("git branch -D discourse-theme-new");
  });

  it("says it works in a Codespace and that every release must use the same method", () => {
    const text = optionOne();
    expect(text).toMatch(/Codespace/);
    expect(text).toMatch(/every release/i);
    expect(text).toMatch(/--force/);
    expect(text).toMatch(/history was rewritten/);
  });

  it("explains refs/original and how to run it a second time in the same clone", () => {
    const text = optionOne();
    expect(text).toContain("refs/original/");
    expect(text).toMatch(/`-f`/);
    expect(text).toContain("git update-ref -d refs/original/refs/heads/discourse-theme-new");
  });
});
