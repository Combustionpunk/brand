import { contrast, mix } from "./colour.ts";
import { MIN_TEXT_CONTRAST } from "./contrast.ts";
import { themeMode } from "./css.ts";
import type { Theme, ThemeColours, ThemeKey } from "./types.ts";
import { themes as defaultThemes } from "./tokens.ts";

/**
 * Which theme key fills each of Discourse's colour-scheme names.
 *
 * | Discourse | Token | Why |
 * |---|---|---|
 * | `primary` | `text` | Discourse's text colour. |
 * | `secondary` | `bg` | Discourse's page background. |
 * | `tertiary` | `accent` | Links and primary buttons. |
 * | `quaternary` | `fast` | The second highlight colour. |
 * | `header_background` | `surface` | The top bar sits on the raised surface. |
 * | `header_primary` | `text` | Text and icons in the top bar. |
 * | `highlight` | `accent` | Search hits and the selected post. |
 * | `danger` | `danger` | Errors and delete buttons. |
 * | `success` | `pb` | The theme's bright green. |
 * | `love` | `danger` | The like heart: the theme's red. |
 */
export const DISCOURSE_MAPPING = {
  primary: "text",
  secondary: "bg",
  tertiary: "accent",
  quaternary: "fast",
  header_background: "surface",
  header_primary: "text",
  highlight: "accent",
  danger: "danger",
  success: "pb",
  love: "danger",
} as const satisfies Record<string, ThemeKey>;

export type DiscourseColourName = keyof typeof DISCOURSE_MAPPING;

/**
 * Discourse's two row colours: the row under the pointer and the chosen row, in dropdowns, menus
 * and the sidebar. A scheme that leaves them out gets Discourse's own light values (`F2F2F2` and
 * `D1F0FF`), which are unreadable under the light text of a dark theme.
 */
export const DISCOURSE_ROW_COLOURS = ["hover", "selected"] as const;

export type DiscourseRowColour = (typeof DISCOURSE_ROW_COLOURS)[number];

/** How far `selected` moves from the page background towards the accent. */
export const SELECTED_ACCENT_SHARE = 0.2;

/**
 * The row colours for a theme, as `#RRGGBB`. Text on them is the theme's `text`.
 *
 * | Discourse | From | Why |
 * |---|---|---|
 * | `hover` | `line` | A step away from the page that shows in light and dark themes alike. |
 * | `selected` | `bg` mixed 20% towards `accent` | The page tinted with the theme's accent. |
 */
export function discourseRowColours(colours: ThemeColours): Record<DiscourseRowColour, string> {
  return {
    hover: colours.line,
    selected: mix(colours.bg, colours.accent, SELECTED_ACCENT_SHARE),
  };
}

export interface DiscourseScheme {
  /** The brand theme's id. */
  id: string;
  /** The scheme's name on the forum. */
  name: string;
  /** Whether this is a dark scheme. */
  dark: boolean;
  /** Discourse colour name to hex, without the `#`, as Discourse stores it. */
  colors: Record<DiscourseColourName | DiscourseRowColour, string>;
}

/** A Discourse colour scheme for a theme: the contents of `dist/discourse/<id>.json`. */
export function toDiscourseScheme(id: string, theme: Theme): DiscourseScheme {
  const names = Object.keys(DISCOURSE_MAPPING) as DiscourseColourName[];
  const bare = (hex: string) => hex.replace(/^#/, "").toUpperCase();
  const rows = discourseRowColours(theme.colours);
  return {
    id,
    name: `RC Misfits: ${theme.name}`,
    dark: theme.mode === "dark",
    colors: Object.fromEntries([
      ...names.map((name) => [name, bare(theme.colours[DISCOURSE_MAPPING[name]])]),
      ...DISCOURSE_ROW_COLOURS.map((name) => [name, bare(rows[name])]),
    ]) as DiscourseScheme["colors"],
  };
}

/**
 * `RRGGBB` in upper case from any hex form CSS allows, or `undefined`: `#fff`, `fff`, `#ffff`,
 * `#FFFFFF`, `#ffffffff`. Sass may shorten `#FFFFFF` to `#fff` when it compiles Discourse's colour
 * variables. A colour that is at all see-through is not a brand colour, so it gives `undefined`.
 */
function normaliseHex(value: string | undefined): string | undefined {
  const hex = (value ?? "").trim().replace(/^#/, "").toUpperCase();
  if (!/^(?:[0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/.test(hex)) return undefined;
  const long = hex.length <= 4 ? [...hex].map((digit) => digit + digit).join("") : hex;
  if (long.length === 8 && !long.endsWith("FF")) return undefined;
  return long.slice(0, 6);
}

/**
 * Which brand theme Discourse is showing, from its live colours (`--primary`, `--secondary`...),
 * or `undefined` if the scheme is not exactly one of the brand's (for example, an admin changed it).
 * Values may be given with or without `#`, in either case, and in short form (`#fff`).
 * Only the mapped colours are compared: `hover` and `selected` follow from them.
 */
export function schemeIdFromColours(
  colours: Partial<Record<string, string>>,
  schemes: Record<string, Theme> = defaultThemes,
): string | undefined {
  const names = Object.keys(DISCOURSE_MAPPING) as DiscourseColourName[];
  for (const [id, theme] of Object.entries(schemes)) {
    const { colors } = toDiscourseScheme(id, theme);
    if (names.every((name) => normaliseHex(colours[name]) === colors[name])) {
      return id;
    }
  }
  return undefined;
}

/* ---------------------------------------------------------------------------------------------
 * Discourse's colour variables, worked out in the browser.
 *
 * A palette's ten colours (and `hover` and `selected`) are all Discourse stores. It compiles the
 * rest (`--primary-low`, `--tertiary-hover`, `--highlight-medium`...) with Sass when it builds the
 * palette's stylesheet. Match my car has no palette, so the forum theme's script needs the same
 * values without Sass. These functions follow core's `color_transformations.scss`,
 * `color_definitions.scss` and `variables.scss`, and the chat and events plugins' `colors.scss`.
 * The tests compare them with what the dev forum compiled for Pit Lane and Pit Lane light.
 * ------------------------------------------------------------------------------------------- */

/** Channels 0-255, kept unrounded between steps as Sass does. */
type Channels = { r: number; g: number; b: number };

const channels = (hex: string): Channels => {
  const n = parseInt(hex.replace(/^#/, ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const byte = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
const hexOf = ({ r, g, b }: Channels) => "#" + [r, g, b].map((v) => byte(v).toString(16).padStart(2, "0")).join("").toUpperCase();
const listOf = ({ r, g, b }: Channels) => [r, g, b].map(byte).join(", ");

function toHsl({ r, g, b }: Channels) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  h *= 60;
  return { h: h < 0 ? h + 360 : h, s, l };
}

function fromHsl({ h, s, l }: { h: number; s: number; l: number }): Channels {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Sass `color.scale($c, $lightness: p)`: p of the way to white (p > 0) or to black (p < 0). */
function scaleLightness(c: Channels, p: number): Channels {
  const hsl = toHsl(c);
  return fromHsl({ ...hsl, l: p > 0 ? hsl.l + (1 - hsl.l) * p : hsl.l + hsl.l * p });
}

/** Sass `lighten` (positive) and `darken` (negative): lightness moved by an absolute amount. */
const adjustLightness = (c: Channels, by: number) => {
  const hsl = toHsl(c);
  return fromHsl({ ...hsl, l: clamp01(hsl.l + by) });
};
const desaturate = (c: Channels, by: number) => {
  const hsl = toHsl(c);
  return fromHsl({ ...hsl, s: clamp01(hsl.s - by) });
};

/** Discourse's `dc-color-brightness`. */
const brightness = ({ r, g, b }: Channels) => r * 0.299 + g * 0.587 + b * 0.114;

/** Discourse's `dark-light-diff`: lighter if the colour is darker than the comparison, else darker. */
const diff = (c: Channels, comparison: Channels, lighter: number, darker: number) =>
  scaleLightness(c, brightness(c) < brightness(comparison) ? lighter : darker);

/** Discourse's `srgb-scale`: blends with gamma 2. */
function srgbScale(fg: Channels, bg: Channels, share: number): Channels {
  const mixChannel = (f: number, b: number) => Math.sqrt(f * f * share + b * b * (1 - share));
  return { r: mixChannel(fg.r, bg.r), g: mixChannel(fg.g, bg.g), b: mixChannel(fg.b, bg.b) };
}

/**
 * Every colour variable Discourse defines from a palette, for a theme: `--primary`, `--d-hover`,
 * `--primary-low`, `--tertiary-rgb`, `--scheme-type` and the rest, as `#RRGGBB` (or `r, g, b` for
 * the `-rgb` ones). Set them all and the whole forum changes, as if the theme were a palette.
 * Variables that are the same for every palette (brand colours of other sites, `--gold`) and those
 * defined as `var(...)` of these are left out: they follow by themselves.
 */
export function discourseVariables(colours: ThemeColours): Record<string, string> {
  const { colors } = toDiscourseScheme("", { name: "", mode: themeMode(colours), colours });
  const c = Object.fromEntries(Object.entries(colors).map(([name, hex]) => [name, channels(hex)])) as Record<
    keyof typeof colors,
    Channels
  >;
  const { primary, secondary, tertiary, quaternary, header_background, header_primary, highlight, danger, success, love } = c;
  const light = brightness(primary) < brightness(secondary);
  const choose = <T>(ifLight: T, ifDark: T): T => (light ? ifLight : ifDark);

  const shade = (base: Channels, against: Channels, steps: Record<string, [number, number]>) =>
    Object.fromEntries(Object.entries(steps).map(([name, [up, down]]) => [name, diff(base, against, up, down)]));

  const p = shade(primary, secondary, {
    "very-low": [0.97, -0.82],
    low: [0.9, -0.78],
    "low-mid": [0.7, -0.45],
    medium: [0.5, -0.35],
    high: [0.3, -0.25],
    "very-high": [0.15, -0.1],
    "50": [0.97, -0.82],
    "100": [0.94, -0.8],
    "200": [0.9, -0.78],
    "300": [0.8, -0.6],
    "400": [0.7, -0.45],
    "500": [0.6, -0.4],
    "600": [0.5, -0.35],
    "700": [0.38, -0.3],
    "800": [0.3, -0.25],
    "900": [0.15, -0.1],
  });
  const s = shade(secondary, primary, { low: [0.7, -0.7], medium: [0.5, -0.5], high: [0.3, -0.35], "very-high": [0.07, -0.07] });
  const t = shade(tertiary, secondary, {
    "very-low": [0.9, -0.75],
    low: [0.85, -0.65],
    medium: [0.5, -0.45],
    high: [0.2, -0.25],
    "25": [0.93, -0.8],
    "50": [0.9, -0.75],
    "100": [0.88, -0.72],
    "200": [0.87, -0.69],
    "300": [0.85, -0.65],
    "400": [0.74, -0.58],
    "500": [0.63, -0.52],
    "600": [0.5, -0.45],
    "700": [0.4, -0.38],
    "800": [0.3, -0.31],
    "900": [0.2, -0.25],
  });
  t["hover"] = choose(diff(tertiary, secondary, -0.25, -0.25), diff(tertiary, primary, 0.2, 0.7));
  const hp = Object.fromEntries(
    Object.entries({ low: 0.1, "low-mid": 0.35, medium: 0.55, high: 0.7, "very-high": 0.9 }).map(([name, share]) => [
      name,
      srgbScale(header_primary, header_background, share),
    ]),
  );
  const h = shade(highlight, secondary, { bg: [0.7, -0.8], low: [0.7, -0.8], medium: [0.5, -0.55], high: [-0.5, -0.1] });
  const d = shade(danger, secondary, { low: [0.9, -0.68], "low-mid": [0.5, -0.6], medium: [0.3, -0.35], hover: [-0.2, -0.2] });
  const ok = shade(success, secondary, { "very-low": [0.9, -0.7], low: [0.8, -0.6], medium: [0.5, -0.4], hover: [-0.2, -0.2] });

  const out: Record<string, string> = {
    "--csstools-color-scheme--light": choose("initial", ""),
    "--scheme-type": choose("light", "dark"),
  };
  const set = (name: string, value: Channels) => (out[name] = hexOf(value));
  for (const [name, value] of Object.entries(c)) {
    set(name === "hover" ? "--d-hover" : name === "selected" ? "--d-selected" : `--${name}`, value);
  }
  set("--d-selected-hover", diff(c.selected, secondary, 0.2, 0.2));
  for (const [name, value] of Object.entries({ primary, secondary, header_background, tertiary, highlight, success })) {
    out[`--${name}-rgb`] = listOf(value);
  }
  out["--primary-low-rgb"] = listOf(p["low"]!);
  out["--primary-very-low-rgb"] = listOf(p["very-low"]!);
  for (const [prefix, group] of [["primary", p], ["header_primary", hp], ["secondary", s], ["tertiary", t], ["highlight", h], ["danger", d], ["success", ok]] as const) {
    for (const [name, value] of Object.entries(group)) set(`--${prefix}-${name}`, value);
  }
  // Core applies danger-low-mid to the danger colour at 70% opacity, and keeps the opacity.
  out["--danger-low-mid"] = `rgba(${listOf(d["low-mid"]!)}, 0.7)`;
  set("--quaternary-low", diff(quaternary, secondary, 0.7, -0.7));
  set("--love-low", diff(love, secondary, 0.85, -0.6));
  out["--wiki"] = "green";
  set("--blend-primary-secondary-5", srgbScale(primary, secondary, 0.05));
  set("--primary-med-or-secondary-med", choose(p["medium"]!, s["medium"]!));
  set("--primary-med-or-secondary-high", choose(p["medium"]!, s["high"]!));
  set("--primary-high-or-secondary-low", choose(p["high"]!, s["low"]!));
  set("--primary-low-mid-or-secondary-high", choose(p["low-mid"]!, s["high"]!));
  set("--primary-low-mid-or-secondary-low", choose(p["low-mid"]!, s["low"]!));
  set("--primary-or-primary-low-mid", choose(primary, p["low-mid"]!));
  set("--highlight-low-or-medium", choose(h["low"]!, h["medium"]!));
  set("--tertiary-or-tertiary-low", choose(tertiary, t["low"]!));
  set("--tertiary-low-or-tertiary-high", choose(t["low"]!, t["high"]!));
  set("--topic-timeline-border-color", choose(t["low"]!, t["high"]!));
  set("--tertiary-med-or-tertiary", choose(t["medium"]!, tertiary));
  set("--secondary-or-primary", choose(secondary, primary));
  out["--tertiary-or-white"] = choose(hexOf(tertiary), "#FFFFFF");
  out["--facebook-or-white"] = choose("#0866FF", "#FFFFFF");
  out["--twitter-or-white"] = choose("#000000", "#FFFFFF");

  // Code blocks: core's light and dark highlight.js colours.
  const code = choose(
    { attr: "#015692", attribute: "#803378", addition: "#2f6f44", deletion: "#c02d2e", keyword: "#015692", title: "#b75501", name: "#b75501", punctuation: "#535a60", symbol: "#54790d", variable: "#54790d", string: "#54790d" },
    { attr: "#88aece", attribute: "#c59bc1", addition: "#76c490", deletion: "#de7176", keyword: "#88aece", title: "#f08d49", name: "#f08d49", punctuation: "#ccc", symbol: "#b5bd68", variable: "#b5bd68", string: "#b5bd68" },
  );
  for (const [name, value] of Object.entries(code)) out[`--hljs-${name}`] = value;
  const codeBg = choose(hexOf(p["100"]!), "rgba(0, 0, 0, 0.35)");
  out["--inline-code-bg"] = codeBg;
  out["--hljs-bg"] = codeBg;
  set("--hljs-comment", p["500"]!);

  const shadow = (light: number, dark: number) => `rgba(0, 0, 0, ${choose(light, dark)})`;
  out["--shadow-modal"] = `0 8px 60px ${shadow(0.6, 1)}`;
  out["--shadow-composer"] = `0 -1px 40px ${shadow(0.22, 0.45)}`;
  out["--shadow-card"] = `0 4px 14px ${shadow(0.15, 0.5)}`;
  out["--shadow-dropdown"] = `0 2px 12px 0 ${shadow(0.1, 0.25)}`;
  out["--shadow-footer-nav"] = `0 0 2px 0 ${shadow(0.2, 0.4)}`;

  // Plugins: chat's loading shimmer and the events calendar.
  out["--chat-skeleton-animation-rgb"] = listOf(p["50"]!);
  set("--calendar-normal", choose(adjustLightness(tertiary, 0.55), adjustLightness(tertiary, -0.25)));
  set("--calendar-close-to-working-hours", choose(desaturate(adjustLightness(tertiary, 0.45), 0.15), adjustLightness(tertiary, -0.15)));
  set("--calendar-in-working-hours", choose(desaturate(adjustLightness(tertiary, 0.4), 0.2), adjustLightness(tertiary, -0.1)));
  return out;
}

/* ---------------------------------------------------------------------------------------------
 * Readable greys (#13).
 *
 * Discourse derives its greys from `primary` and `secondary`, and in light palettes (and on the
 * hover row in some dark ones) the ones it uses for secondary text fall under 4.5:1: dates,
 * counts, "replies", metadata. The forum overrides just those, moving each towards `primary` only
 * as far as it takes.
 * ------------------------------------------------------------------------------------------- */

/**
 * The derived variables that carry text on the page and on the rows of lists and menus, and why.
 * Found by where core's stylesheets use them as `color:` (core at 3aff54f, 17 Nov 2026).
 *
 * Left out on purpose: `--primary-low-mid` (and `-400`, `-500`), which
 * core uses for icons, drag handles, borders, placeholders and disabled controls, none of them
 * text that WCAG asks 4.5:1 of; darkening it to 4.5:1 would also push `-medium` and `-high` darker
 * and flatten the ladder. And `--primary-low`, `--primary-very-low` and the `secondary-*` shades
 * on their own, which are backgrounds and borders.
 */
export const DISCOURSE_TEXT_SHADES: Readonly<Record<string, string>> = {
  "--primary-medium": "Metadata: dates, counts, \"replies\", post info. Core's most used text grey (about 380 uses).",
  "--primary-high": "Secondary text: excerpts, labels, user stats, quotes' names (about 190 uses).",
  "--primary-very-high": "Strong secondary text: user stream times, tags in choosers, the wizard.",
  "--primary-600": "The numbered scale's twin of --primary-medium, used as text.",
  "--primary-700": "Text in the numbered scale (between medium and high).",
  "--primary-800": "The numbered scale's twin of --primary-high, used as text.",
  "--primary-900": "Topic list headings and metadata, and default button text, in core's newer topic list.",
  "--primary-med-or-secondary-med": "Text: --primary-medium in light palettes, --secondary-medium in dark (about 40 uses).",
  "--primary-med-or-secondary-high": "Text: the categories page's topic counts and activity; --secondary-high in dark.",
  "--primary-high-or-secondary-low": "Text: --primary-high in light palettes, --secondary-low in dark.",
  "--primary-low-mid-or-secondary-high":
    "Text: the categories page's last-activity times, the \"via email\" marker and embedded posts' links. Its own variable, so raising it leaves --primary-low-mid alone.",
};

/** The ladders whose order the overrides keep: each step at least as far from the page as the one before. */
const TEXT_LADDERS = [
  ["--primary-medium", "--primary-high", "--primary-very-high"],
  ["--primary-600", "--primary-700", "--primary-800", "--primary-900"],
];

/** The backgrounds text shades sit on: the page and the row under the pointer. */
const TEXT_BACKGROUNDS = ["--secondary", "--d-hover"];

/**
 * The text shades of `vars` (from `discourseVariables`) that miss 4.5:1 on the page or the hover
 * row, each moved towards `--primary` just far enough, as `#RRGGBB`. Shades that pass are left out.
 * The ladders keep their order: a step that would end up nearer the page than the one before it
 * takes that step's colour.
 */
export function readableTextShades(vars: Record<string, string>): Record<string, string> {
  const primary = vars["--primary"]!;
  const backgrounds = TEXT_BACKGROUNDS.map((name) => vars[name]!);
  const passes = (hex: string) => backgrounds.every((bg) => contrast(hex, bg) >= MIN_TEXT_CONTRAST);
  const fixed: Record<string, string> = { ...vars };
  const out: Record<string, string> = {};

  for (const name of Object.keys(DISCOURSE_TEXT_SHADES)) {
    const start = vars[name]!;
    if (passes(start)) continue;
    // The smallest share of the way to primary that passes. Primary itself passes on both (the tokens'
    // and generator's tests); if it ever did not, this would end at primary, the best on offer.
    let [lo, hi] = [0, 1];
    for (let i = 0; i < 20; i++) {
      const mid = (lo + hi) / 2;
      if (passes(mix(start, primary, mid))) hi = mid;
      else lo = mid;
    }
    fixed[name] = out[name] = mix(start, primary, hi);
  }

  const page = vars["--secondary"]!;
  for (const ladder of TEXT_LADDERS) {
    for (let i = 1; i < ladder.length; i++) {
      const [before, name] = [ladder[i - 1]!, ladder[i]!];
      if (contrast(fixed[name]!, page) < contrast(fixed[before]!, page)) fixed[name] = out[name] = fixed[before]!;
    }
  }
  return out;
}

/** `discourseVariables` with the readable text shades: what the forum sets for a theme. */
export function forumVariables(colours: ThemeColours): Record<string, string> {
  const vars = discourseVariables(colours);
  return { ...vars, ...readableTextShades(vars) };
}
