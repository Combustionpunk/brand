/**
 * The theme generator behind "Match my car" and "club colours".
 *
 * Pure: up to three hex colours in, a complete theme out. No randomness, no clock, no I/O,
 * so every app gets the same theme from the same colours.
 */
import { chroma, contrast, hexToHsl, hslToHex, normaliseHex } from "./colour.ts";
import type { Hsl } from "./colour.ts";
import { MIN_LIGHTNESS_SEPARATION, MIN_TEXT_CONTRAST } from "./contrast.ts";
import { tokens } from "./tokens.ts";
import type { ThemeColours, ThemeMode } from "./types.ts";

/** Below this chroma a colour is neutral: white, black, silver and other greys. */
export const NEUTRAL_CHROMA = 0.12;

/** The most saturation a background tint may have. */
const MAX_TINT_SATURATION = 0.4;
/** With no second colour, the ground takes a hint of the accent's hue, as Pit Lane does. */
const ACCENT_TINT_SATURATION = 0.1;

/** Lightness of each ground. Dark: about 8%. Light: about 97%, with white cards. */
const GROUND = {
  dark: { bg: 0.08, surface: 0.12, surface2: 0.16, line: 0.22 },
  light: { bg: 0.97, surface: 1, surface2: 0.945, line: 0.87 },
} as const;

/** Fixed starting colours, the same in every generated theme. */
const FIXED = {
  dark: { pb: "#4CC38A", good: "#1F4D36", goodText: "#9BF0C4", danger: "#FF6B5E", warning: "#FFB648" },
  light: { pb: "#1F8A55", good: "#DDF3E6", goodText: "#1E5A3A", danger: "#B42318", warning: "#8F5B00" },
} as const;

const DANGER_HUE = 4;
/** When the accent is itself red, danger moves to this rose so the two can be told apart. */
const DANGER_ALT_HUE = 335;
const PB_HUE = hexToHsl(FIXED.dark.pb).h;

/** The part each colour plays. All are optional: an empty set gives Pit Lane. */
export interface ThemeRoles {
  /** Buttons, links and the selected state. */
  accent?: string;
  /** Tints the background. Without it the background takes a hint of the accent. */
  tint?: string;
  /** The fastest-lap highlight. Without it, the accent's opposite hue. */
  fast?: string;
}

const hueDistance = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/**
 * Sorts up to three colours into roles:
 * - white, black and silver (low chroma) are neutral and take no role;
 * - the accent is the colour with the most chroma (the earlier one wins a tie);
 * - the tint is the deepest (darkest) colour left;
 * - the highlight is the one after that.
 */
export function pickRoles(colours: readonly string[] = []): ThemeRoles {
  const chromatic = colours
    .slice(0, 3)
    .map(normaliseHex)
    .filter((hex) => chroma(hex) >= NEUTRAL_CHROMA);

  const roles: ThemeRoles = {};
  if (chromatic.length === 0) {
    return roles;
  }

  let accentAt = 0;
  chromatic.forEach((hex, i) => {
    if (chroma(hex) > chroma(chromatic[accentAt]!)) {
      accentAt = i;
    }
  });
  roles.accent = chromatic[accentAt]!;

  const rest = chromatic.filter((_, i) => i !== accentAt);
  if (rest.length === 0) {
    return roles;
  }
  let tintAt = 0;
  rest.forEach((hex, i) => {
    if (hexToHsl(hex).l < hexToHsl(rest[tintAt]!).l) {
      tintAt = i;
    }
  });
  roles.tint = rest[tintAt]!;

  const third = rest.find((_, i) => i !== tintAt);
  if (third !== undefined) {
    roles.fast = third;
  }
  return roles;
}

/**
 * Moves a colour's lightness, one small step at a time, until it reaches `min` contrast on every
 * ground: lighter on a dark theme, darker on a light one. Hue and saturation are kept.
 */
function reach(hex: string, grounds: readonly string[], mode: ThemeMode, min = MIN_TEXT_CONTRAST): string {
  const step = mode === "dark" ? 0.005 : -0.005;
  const hsl = hexToHsl(hex);
  let out = normaliseHex(hex);
  while (grounds.some((ground) => contrast(out, ground) < min) && hsl.l > 0 && hsl.l < 1) {
    hsl.l = Math.min(1, Math.max(0, hsl.l + step));
    out = hslToHex(hsl);
  }
  return out;
}

/** Keeps moving `hex` the same way until it also differs in lightness from `other`. */
function separate(hex: string, other: string, mode: ThemeMode): string {
  return reach(hex, [other], mode, MIN_LIGHTNESS_SEPARATION);
}

/**
 * `danger` and `warning` for a set of grounds: readable on each of them, and different in
 * lightness from each other. The built-in themes' values in `tokens.json` were chosen with this.
 */
export function statusColours(
  grounds: readonly string[],
  mode: ThemeMode,
  accent?: string,
): Pick<ThemeColours, "danger" | "warning"> {
  const base = FIXED[mode];
  const dangerHsl = hexToHsl(base.danger);
  if (accent !== undefined && chroma(accent) >= NEUTRAL_CHROMA && hueDistance(hexToHsl(accent).h, DANGER_HUE) < 25) {
    dangerHsl.h = DANGER_ALT_HUE;
  }
  let danger = reach(hslToHex(dangerHsl), grounds, mode);
  let warning = reach(base.warning, grounds, mode);
  if (mode === "dark") {
    warning = separate(warning, danger, mode);
  } else {
    danger = separate(danger, warning, mode);
  }
  return { danger, warning };
}

/**
 * Makes a theme meet the brand's contrast rules by moving lightness only: text and accents reach
 * 4.5:1 on every ground, and the pairs that must be told apart differ in lightness. A theme that
 * already meets them comes back unchanged.
 */
function accessible(raw: ThemeColours, mode: ThemeMode): ThemeColours {
  const grounds = [raw.bg, raw.surface, raw.surface2];
  const pb = reach(raw.pb, grounds, mode);
  const accent = reach(raw.accent, grounds, mode);
  let danger = reach(raw.danger, grounds, mode);
  let warning = reach(raw.warning, grounds, mode);
  // Amber is the lighter of the two on a dark ground; red is the darker on a light one.
  if (mode === "dark") {
    warning = separate(warning, danger, mode);
  } else {
    danger = separate(danger, warning, mode);
  }
  return {
    ...raw,
    text: reach(raw.text, grounds, mode),
    muted: reach(raw.muted, grounds, mode),
    accent,
    onAccent:
      contrast(raw.onAccent, accent) >= MIN_TEXT_CONTRAST
        ? raw.onAccent
        : contrast("#FFFFFF", accent) >= contrast(raw.bg, accent)
          ? "#FFFFFF"
          : raw.bg,
    goodText: reach(raw.goodText, [raw.good], mode),
    pb,
    fast: separate(reach(raw.fast, grounds, mode), pb, mode),
    danger,
    warning,
  };
}

/** Pit Lane, for when there is nothing chromatic to work with. */
function fallback(mode: ThemeMode): ThemeColours {
  const id = mode === "dark" ? tokens.defaultTheme : tokens.defaultLightTheme;
  return accessible({ ...tokens.themes[id]!.colours }, mode);
}

/**
 * Builds a theme from colours whose roles are already decided. `generateTheme` is
 * `themeFromRoles(pickRoles(colours), mode)`. The light versions of the dark-only built-in themes
 * come from this, given the dark theme's accent, background and highlight.
 */
export function themeFromRoles(roles: ThemeRoles, mode: ThemeMode = "dark"): ThemeColours {
  if (mode !== "dark" && mode !== "light") {
    throw new RangeError(`Not a theme mode: ${String(mode)}`);
  }
  if (roles.accent === undefined) {
    // Nothing chromatic to work with: the brand's default.
    return fallback(mode);
  }
  const accentIn = normaliseHex(roles.accent);
  const accentHsl = hexToHsl(accentIn);

  // The ground: the tint's hue, with its saturation capped.
  let tint: Pick<Hsl, "h" | "s">;
  if (roles.tint !== undefined) {
    const { h, s } = hexToHsl(roles.tint);
    tint = { h, s: Math.min(s, MAX_TINT_SATURATION) };
  } else {
    tint = { h: accentHsl.h, s: Math.min(accentHsl.s, ACCENT_TINT_SATURATION) };
  }
  const levels = GROUND[mode];
  const bg = hslToHex({ ...tint, l: levels.bg });
  const surface = hslToHex({ ...tint, l: levels.surface });
  const surface2 = hslToHex({ ...tint, l: levels.surface2 });
  const line = hslToHex({ ...tint, l: levels.line });

  const text = hslToHex({
    h: tint.h,
    s: Math.min(tint.s, mode === "dark" ? 0.25 : 0.5),
    l: mode === "dark" ? 0.95 : 0.13,
  });
  const muted = hslToHex({ h: tint.h, s: Math.min(tint.s, 0.25), l: mode === "dark" ? 0.7 : 0.38 });

  let fast: string;
  if (roles.fast !== undefined) {
    fast = normaliseHex(roles.fast);
  } else {
    let h = (accentHsl.h + 180) % 360;
    if (hueDistance(h, PB_HUE) < 30) {
      // The opposite of a pink or magenta accent is the personal-best green. Move on to blue.
      h = (PB_HUE + 60) % 360;
    }
    fast = hslToHex({ h, s: Math.max(accentHsl.s, 0.7), l: accentHsl.l });
  }

  const fixed = FIXED[mode];
  return accessible(
    {
      bg,
      surface,
      surface2,
      line,
      text,
      muted,
      accent: accentIn,
      onAccent: mode === "dark" ? bg : "#FFFFFF",
      good: fixed.good,
      goodText: fixed.goodText,
      pb: fixed.pb,
      fast,
      ...statusColours([bg, surface, surface2], mode, accentIn),
    },
    mode,
  );
}

/**
 * "Match my car" and "club colours": a complete theme from up to three hex colours, main first.
 *
 * - White, black and silver are neutral.
 * - The accent is the colour with the most chroma.
 * - The deepest remaining colour tints the background (saturation capped at 40%).
 * - The highlight (`fast`) is the third colour, else the accent's opposite hue.
 * - `pb` is a fixed green.
 * - Accent, `fast`, `pb`, `text`, `muted`, `danger` and `warning` are adjusted in lightness until
 *   each reaches 4.5:1 on `bg`, `surface` and `surface2`.
 * - `pb` and `fast`, and `danger` and `warning`, also differ in lightness.
 * - With no chromatic colour at all (none given, or all white), the result is Pit Lane.
 *
 * Only the first three colours are used. Throws a `RangeError` for a value that is not a hex
 * colour or a mode that is not `"dark"` or `"light"`.
 */
export function generateTheme(colours: readonly string[] = [], mode: ThemeMode = "dark"): ThemeColours {
  return themeFromRoles(pickRoles(colours), mode);
}
