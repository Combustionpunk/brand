import { describe, expect, it } from "vitest";
import { EXAMPLES, renderPreview } from "../scripts/preview-html.ts";
import { themeIds, themes } from "../src/tokens.ts";
import { THEME_KEYS } from "../src/types.ts";

const html = renderPreview();

describe("the preview page", () => {
  it("shows every theme, with all its swatches", () => {
    for (const id of themeIds) {
      expect(html).toContain(`<section class="card" data-theme="${id}">`);
      for (const key of THEME_KEYS) {
        expect(html).toContain(`<b>${key}</b><span>${themes[id]!.colours[key]}</span>`);
      }
    }
  });

  it("has a top bar with the real logo, a practice table and a button in each card", () => {
    const cards = html.match(/<section class="card"/g)!.length;
    expect(cards).toBe(themeIds.length + EXAMPLES.length * 2);
    expect(html.match(/src="\.\.\/assets\/logo\/rc-misfits-logo\.svg"/g)).toHaveLength(cards);
    expect(html.match(/<table class="practice">/g)).toHaveLength(cards);
    expect(html.match(/<button type="button" class="primary">/g)).toHaveLength(cards);
    expect(html).toContain("Forum</a><a href=\"#\">Meetings</a><a href=\"#\">Tracks</a><a href=\"#\" aria-current=\"page\">Timing</a>");
  });

  it("shows generator output in dark and light", () => {
    expect(html.match(/data-generated="dark"/g)).toHaveLength(EXAMPLES.length);
    expect(html.match(/data-generated="light"/g)).toHaveLength(EXAMPLES.length);
  });

  it("loads the built tokens and the fonts, and puts timing numbers in tabular figures", () => {
    expect(html).toContain('href="../dist/tokens.css"');
    expect(html).toContain('href="../fonts/fonts.css"');
    expect(html).toContain('class="rm-figures num');
  });
});
