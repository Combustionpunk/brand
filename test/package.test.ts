import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { renderTokensCss } from "../src/css.ts";
import { toDiscourseScheme } from "../src/discourse.ts";
import { themeIds, themes, tokens } from "../src/tokens.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const pkg = JSON.parse(read("package.json")) as {
  name: string;
  files: string[];
  exports: Record<string, string | { types: string; default: string }>;
};

describe("the package", () => {
  it("is @rcmisfits/brand and ships dist, fonts, the logo and tokens.json", () => {
    expect(pkg.name).toBe("@rcmisfits/brand");
    expect(pkg.files).toEqual(expect.arrayContaining(["dist", "fonts", "assets/logo", "tokens.json"]));
  });

  it("exports files that exist", () => {
    for (const [name, target] of Object.entries(pkg.exports)) {
      const paths = typeof target === "string" ? [target] : Object.values(target);
      for (const path of paths) {
        if (path.includes("*")) {
          expect(existsSync(resolve(root, dirname(path))), `${name} -> ${path}`).toBe(true);
        } else {
          expect(existsSync(resolve(root, path)), `${name} -> ${path}`).toBe(true);
        }
      }
    }
    expect(pkg.exports["./tokens.css"]).toBe("./dist/tokens.css");
    expect(pkg.exports["./logo.svg"]).toBe("./assets/logo/rc-misfits-logo.svg");
  });
});

describe("the committed dist/ is what the build writes from tokens.json", () => {
  it("dist/tokens.css", () => {
    expect(read("dist/tokens.css")).toBe(renderTokensCss(tokens));
  });

  it("dist/discourse/<id>.json for every theme, and nothing else", () => {
    for (const id of themeIds) {
      expect(JSON.parse(read(`dist/discourse/${id}.json`)), id).toEqual(toDiscourseScheme(id, themes[id]!));
    }
    expect(readdirSync(resolve(root, "dist/discourse")).sort()).toEqual(themeIds.map((id) => `${id}.json`).sort());
  });

  it("dist/index.js exports the tokens, generateTheme and themeToCss", async () => {
    const built = (await import(resolve(root, "dist/index.js"))) as typeof import("../src/index.ts");
    const source = await import("../src/index.ts");
    expect(Object.keys(built).sort()).toEqual(Object.keys(source).sort());
    expect(built.tokens).toEqual(tokens);
    expect(built.generateTheme(["#d32f2f", "#1565c0", "#fdd835"], "light")).toEqual(
      source.generateTheme(["#d32f2f", "#1565c0", "#fdd835"], "light"),
    );
    expect(built.themeToCss(built.themes["ice"]!.colours)).toBe(source.themeToCss(themes["ice"]!.colours));
    expect(existsSync(resolve(root, "dist/index.d.ts"))).toBe(true);
  });

  it("dist/logo has the 512 and 1024 pixel PNGs", () => {
    for (const width of [512, 1024]) {
      const png = readFileSync(resolve(root, `dist/logo/rc-misfits-logo-${width}.png`));
      expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
      // The IHDR chunk holds the width at byte 16.
      expect(png.readUInt32BE(16)).toBe(width);
    }
  });
});

describe("fonts", () => {
  const css = read("fonts/fonts.css");

  it("has @font-face rules for Oswald and Inter, latin and latin-ext, pointing at files that exist", () => {
    const faces = css.match(/@font-face\s*{[^}]+}/g) ?? [];
    expect(faces).toHaveLength(4);
    const seen: string[] = [];
    for (const face of faces) {
      const family = /font-family:\s*"([^"]+)"/.exec(face)![1]!;
      const url = /url\("\.\/([^"]+\.woff2)"\)/.exec(face)![1]!;
      expect(existsSync(resolve(root, "fonts", url)), url).toBe(true);
      expect(face).toContain("unicode-range:");
      expect(face).toContain("font-display: swap;");
      seen.push(`${family} ${url.includes("latin-ext") ? "latin-ext" : "latin"}`);
    }
    expect(seen.sort()).toEqual(["Inter latin", "Inter latin-ext", "Oswald latin", "Oswald latin-ext"]);
  });

  it("uses the family names the tokens use", () => {
    expect(css).toContain(`font-family: "${tokens.font.display.family}"`);
    expect(css).toContain(`font-family: "${tokens.font.body.family}"`);
  });

  it("ships the OFL licences", () => {
    for (const file of ["fonts/OFL-Inter.txt", "fonts/OFL-Oswald.txt"]) {
      expect(read(file)).toContain("SIL Open Font License");
    }
  });
});

describe("the logo", () => {
  it("is shipped as it was given", () => {
    expect(existsSync(resolve(root, "assets/logo/rc-misfits-logo.svg"))).toBe(true);
    expect(existsSync(resolve(root, "assets/logo/rc-misfits-logo.png"))).toBe(true);
  });
});
