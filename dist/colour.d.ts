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
export declare function isHex(value: unknown): value is string;
/** Parses `#RGB` or `#RRGGBB` (the `#` is optional). Throws a `RangeError` on anything else. */
export declare function parseHex(hex: string): Rgb;
/** Formats as upper-case `#RRGGBB`. */
export declare function toHex({ r, g, b }: Rgb): string;
/** Upper-case `#RRGGBB` from any accepted hex form. */
export declare function normaliseHex(hex: string): string;
export declare function rgbToHsl({ r, g, b }: Rgb): Hsl;
export declare function hslToRgb({ h, s, l }: Hsl): Rgb;
export declare const hexToHsl: (hex: string) => Hsl;
export declare const hslToHex: (hsl: Hsl) => string;
/** Chroma as the spread of the sRGB channels, 0 (grey) to 1 (a pure colour). */
export declare function chroma(hex: string): number;
/** WCAG 2 relative luminance, 0 (black) to 1 (white). */
export declare function luminance(hex: string): number;
/** WCAG 2 contrast ratio between two colours, 1 to 21. */
export declare function contrast(a: string, b: string): number;
