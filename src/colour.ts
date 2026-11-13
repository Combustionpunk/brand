/** Small, dependency-free colour maths: sRGB hex, HSL and WCAG contrast. */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Hue in degrees (0 to 360), saturation and lightness as 0 to 1. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHex(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value.trim());
}

/** Parses `#RGB` or `#RRGGBB` (the `#` is optional). Throws a `RangeError` on anything else. */
export function parseHex(hex: string): Rgb {
  const match = typeof hex === "string" ? HEX.exec(hex.trim()) : null;
  if (!match) {
    throw new RangeError(`Not a hex colour: ${String(hex)}`);
  }
  let digits = match[1]!;
  if (digits.length === 3) {
    digits = digits.replace(/./g, "$&$&");
  }
  const n = parseInt(digits, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const clampByte = (v: number) => Math.min(255, Math.max(0, Math.round(v)));

/** Formats as upper-case `#RRGGBB`. */
export function toHex({ r, g, b }: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => clampByte(v).toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

/** Upper-case `#RRGGBB` from any accepted hex form. */
export function normaliseHex(hex: string): string {
  return toHex(parseHex(hex));
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) {
    return { h: 0, s: 0, l };
  }
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === rn) {
    h = ((gn - bn) / d) % 6;
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  h *= 60;
  if (h < 0) {
    h += 360;
  }
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hue < 60
      ? [c, x, 0]
      : hue < 120
        ? [x, c, 0]
        : hue < 180
          ? [0, c, x]
          : hue < 240
            ? [0, x, c]
            : hue < 300
              ? [x, 0, c]
              : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export const hexToHsl = (hex: string): Hsl => rgbToHsl(parseHex(hex));
export const hslToHex = (hsl: Hsl): string => toHex(hslToRgb(hsl));

/** Chroma as the spread of the sRGB channels, 0 (grey) to 1 (a pure colour). */
export function chroma(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

/** WCAG 2 relative luminance, 0 (black) to 1 (white). */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG 2 contrast ratio between two colours, 1 to 21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
