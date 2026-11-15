import { describe, expect, it } from "vitest";
import { chroma, contrast, hexToHsl, hslToHex, luminance, normaliseHex, parseHex, toHex } from "../src/colour.ts";

describe("colour maths", () => {
  it("parses 6-digit, 3-digit and bare hex", () => {
    expect(parseHex("#FFC72C")).toEqual({ r: 255, g: 199, b: 44 });
    expect(parseHex("fc0")).toEqual({ r: 255, g: 204, b: 0 });
    expect(parseHex(" #abcdef ")).toEqual({ r: 171, g: 205, b: 239 });
  });

  it("rejects anything that is not a hex colour", () => {
    for (const bad of ["", "red", "#12", "#12345", "#GGGGGG", "#1234567"]) {
      expect(() => parseHex(bad)).toThrow(RangeError);
    }
    expect(() => parseHex(undefined as unknown as string)).toThrow(RangeError);
  });

  it("writes upper-case #RRGGBB", () => {
    expect(toHex({ r: 1, g: 171.6, b: 300 })).toBe("#01ACFF");
    expect(normaliseHex("abc")).toBe("#AABBCC");
  });

  it("round-trips through HSL", () => {
    for (const hex of ["#FFC72C", "#17181B", "#FF3EA5", "#0277BD", "#000000", "#FFFFFF", "#39FF14"]) {
      expect(hslToHex(hexToHsl(hex))).toBe(hex);
    }
  });

  it("measures WCAG luminance and contrast", () => {
    expect(luminance("#000000")).toBe(0);
    expect(luminance("#FFFFFF")).toBeCloseTo(1, 10);
    expect(contrast("#000000", "#FFFFFF")).toBeCloseTo(21, 10);
    expect(contrast("#FFFFFF", "#000000")).toBeCloseTo(21, 10);
    // A well-known reference pair: #767676 on white is just over 4.5:1.
    expect(contrast("#767676", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#777777", "#FFFFFF")).toBeLessThan(4.5);
  });

  it("treats white, black and silver as having no chroma", () => {
    expect(chroma("#ffffff")).toBe(0);
    expect(chroma("#111111")).toBe(0);
    expect(chroma("#c0c0c0")).toBe(0);
    expect(chroma("#e6ff00")).toBe(1);
  });
});
