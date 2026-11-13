// tokens.json
var tokens_default = {
  defaultTheme: "pit-lane",
  defaultLightTheme: "pit-lane-light",
  themes: {
    "pit-lane": {
      name: "Pit Lane",
      mode: "dark",
      pair: "pit-lane-light",
      colours: {
        bg: "#17181B",
        surface: "#212328",
        surface2: "#2B2E34",
        line: "#353840",
        text: "#F2F2F0",
        muted: "#A9ACB3",
        accent: "#FFC72C",
        onAccent: "#17181B",
        good: "#1F4D36",
        goodText: "#9BF0C4",
        pb: "#4CC38A",
        fast: "#C3A2FF",
        danger: "#FF6B5E",
        warning: "#FFB648"
      }
    },
    "pit-lane-light": {
      name: "Pit Lane light",
      mode: "light",
      pair: "pit-lane",
      colours: {
        bg: "#F4F3EF",
        surface: "#FFFFFF",
        surface2: "#F0EEE8",
        line: "#DEDBD2",
        text: "#1B1C1F",
        muted: "#5C5F66",
        accent: "#B07A00",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1F8A55",
        fast: "#6B3FD1",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    },
    synthwave: {
      name: "Synthwave",
      mode: "dark",
      pair: "synthwave-light",
      colours: {
        bg: "#140B24",
        surface: "#1E1234",
        surface2: "#2A1A47",
        line: "#3A2860",
        text: "#F7F3FA",
        muted: "#BBA9D3",
        accent: "#FF3EA5",
        onAccent: "#140B24",
        good: "#123B3C",
        goodText: "#7FF5DF",
        pb: "#5CF2A6",
        fast: "#46E5FF",
        danger: "#FF6B5E",
        warning: "#FFB648"
      }
    },
    "synthwave-light": {
      name: "Synthwave light",
      mode: "light",
      pair: "synthwave",
      colours: {
        bg: "#F8F4FB",
        surface: "#FFFFFF",
        surface2: "#F1E9F7",
        line: "#E2D5EC",
        text: "#22123A",
        muted: "#5E4B78",
        accent: "#C2187A",
        onAccent: "#FFFFFF",
        good: "#DCF5EE",
        goodText: "#14584A",
        pb: "#13865A",
        fast: "#0B7A99",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    },
    garage: {
      name: "Garage",
      mode: "dark",
      pair: "garage-light",
      colours: {
        bg: "#1C1A17",
        surface: "#26231F",
        surface2: "#322E28",
        line: "#3E3A33",
        text: "#F3EEE6",
        muted: "#B8AF9F",
        accent: "#FF6B1A",
        onAccent: "#1C1A17",
        good: "#26402C",
        goodText: "#A8E6B5",
        pb: "#6BD38A",
        fast: "#7FC3FF",
        danger: "#FF5EA1",
        warning: "#FFB648"
      }
    },
    "garage-light": {
      name: "Garage light",
      mode: "light",
      pair: "garage",
      colours: {
        bg: "#F8F8F7",
        surface: "#FFFFFF",
        surface2: "#F2F1F0",
        line: "#E1DFDB",
        text: "#24221E",
        muted: "#6A6357",
        accent: "#C04400",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1C7B4C",
        fast: "#005DAF",
        danger: "#A91653",
        warning: "#8F5B00"
      }
    },
    fluoro: {
      name: "Fluoro",
      mode: "dark",
      pair: "fluoro-light",
      colours: {
        bg: "#0E0F0C",
        surface: "#181A15",
        surface2: "#22251D",
        line: "#2F3328",
        text: "#F4F7EE",
        muted: "#A9B19A",
        accent: "#E6FF00",
        onAccent: "#0E0F0C",
        good: "#1F3D16",
        goodText: "#B4F59A",
        pb: "#39FF14",
        fast: "#FF6AD5",
        danger: "#FF6B5E",
        warning: "#FFB648"
      }
    },
    "fluoro-light": {
      name: "Fluoro light",
      mode: "light",
      pair: "fluoro",
      colours: {
        bg: "#F8F8F7",
        surface: "#FFFFFF",
        surface2: "#F1F3EF",
        line: "#DFE2DA",
        text: "#22251D",
        muted: "#646C56",
        accent: "#6A7500",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1C7E4D",
        fast: "#B40081",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    },
    "racing-green": {
      name: "Racing Green",
      mode: "dark",
      pair: "racing-green-light",
      colours: {
        bg: "#0F1A14",
        surface: "#16241C",
        surface2: "#1E3026",
        line: "#2A4033",
        text: "#F1EFE6",
        muted: "#A9B8AC",
        accent: "#D4AF37",
        onAccent: "#0F1A14",
        good: "#20402E",
        goodText: "#9FE3BC",
        pb: "#6FE39A",
        fast: "#8EC9FF",
        danger: "#FF6B5E",
        warning: "#FFB648"
      }
    },
    "racing-green-light": {
      name: "Racing Green light",
      mode: "light",
      pair: "racing-green",
      colours: {
        bg: "#F5F9F7",
        surface: "#FFFFFF",
        surface2: "#EDF5F1",
        line: "#D5E7DD",
        text: "#182A20",
        muted: "#49795F",
        accent: "#846B1C",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1C7E4D",
        fast: "#005EB4",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    },
    "works-blue": {
      name: "Works Blue",
      mode: "dark",
      pair: "works-blue-light",
      colours: {
        bg: "#0B1630",
        surface: "#111F3D",
        surface2: "#182A52",
        line: "#24396A",
        text: "#F3F6FC",
        muted: "#A9B6D3",
        accent: "#FDD835",
        onAccent: "#0B1630",
        good: "#123A33",
        goodText: "#8FF0CF",
        pb: "#5CE6A0",
        fast: "#FF8AC8",
        danger: "#FF6B5E",
        warning: "#FFB648"
      }
    },
    "works-blue-light": {
      name: "Works Blue light",
      mode: "light",
      pair: "works-blue",
      colours: {
        bg: "#F4F6FA",
        surface: "#FFFFFF",
        surface2: "#EBEFF7",
        line: "#D1D8EB",
        text: "#141C2E",
        muted: "#495779",
        accent: "#816901",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1C7B4C",
        fast: "#B50060",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    },
    "red-line": {
      name: "Red Line",
      mode: "dark",
      pair: "red-line-light",
      colours: {
        bg: "#121212",
        surface: "#1C1C1E",
        surface2: "#26262A",
        line: "#34343A",
        text: "#F5F5F5",
        muted: "#ADADB3",
        accent: "#FF4D4A",
        onAccent: "#121212",
        good: "#1E3D2C",
        goodText: "#9BEFC0",
        pb: "#4CD98A",
        fast: "#7FB8FF",
        danger: "#FF5EA1",
        warning: "#FFB648"
      }
    },
    "red-line-light": {
      name: "Red Line light",
      mode: "light",
      pair: "red-line",
      colours: {
        bg: "#F7F7F7",
        surface: "#FFFFFF",
        surface2: "#F1F1F1",
        line: "#DEDEDE",
        text: "#212121",
        muted: "#616161",
        accent: "#DE0400",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1C7B4C",
        fast: "#0057C4",
        danger: "#A91653",
        warning: "#8F5B00"
      }
    },
    sunset: {
      name: "Sunset",
      mode: "dark",
      pair: "sunset-light",
      colours: {
        bg: "#1A1210",
        surface: "#251A16",
        surface2: "#30231D",
        line: "#433128",
        text: "#FBF4EC",
        muted: "#C3AE9C",
        accent: "#FFB22E",
        onAccent: "#1A1210",
        good: "#2A3D25",
        goodText: "#B8EBA5",
        pb: "#7FDB6A",
        fast: "#FF7AA8",
        danger: "#FF6B5E",
        warning: "#FFB648"
      }
    },
    "sunset-light": {
      name: "Sunset light",
      mode: "light",
      pair: "sunset",
      colours: {
        bg: "#F9F6F6",
        surface: "#FFFFFF",
        surface2: "#F4EFEE",
        line: "#E6D9D6",
        text: "#291C19",
        muted: "#78534A",
        accent: "#996100",
        onAccent: "#FFFFFF",
        good: "#DDF3E6",
        goodText: "#1E5A3A",
        pb: "#1C7B4C",
        fast: "#B90040",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    },
    ice: {
      name: "Ice (light)",
      mode: "light",
      colours: {
        bg: "#F2F7FB",
        surface: "#FFFFFF",
        surface2: "#E7F0F7",
        line: "#D3E1EC",
        text: "#0F2133",
        muted: "#4A6075",
        accent: "#0277BD",
        onAccent: "#FFFFFF",
        good: "#DDF3E9",
        goodText: "#165A3F",
        pb: "#158A55",
        fast: "#7B3FD1",
        danger: "#A92116",
        warning: "#8F5B00"
      }
    }
  },
  font: {
    display: {
      family: "Oswald",
      stack: 'Oswald, "Arial Narrow", "Roboto Condensed", sans-serif',
      weights: [
        500,
        600
      ]
    },
    body: {
      family: "Inter",
      stack: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
      weights: [
        400,
        600,
        700
      ]
    }
  },
  type: {
    display: {
      font: "display",
      size: "2.5rem",
      lineHeight: "2.75rem",
      weight: 600,
      letterSpacing: "0.01em"
    },
    title: {
      font: "display",
      size: "2rem",
      lineHeight: "2.375rem",
      weight: 500,
      letterSpacing: "0.01em"
    },
    heading: {
      font: "display",
      size: "1.375rem",
      lineHeight: "1.75rem",
      weight: 500,
      letterSpacing: "0.01em"
    },
    subheading: {
      font: "display",
      size: "1.125rem",
      lineHeight: "1.5rem",
      weight: 500,
      letterSpacing: "0.01em"
    },
    body: {
      font: "body",
      size: "0.9375rem",
      lineHeight: "1.375rem",
      weight: 400
    },
    "body-sm": {
      font: "body",
      size: "0.8125rem",
      lineHeight: "1.125rem",
      weight: 400
    },
    control: {
      font: "body",
      size: "0.875rem",
      lineHeight: "1.25rem",
      weight: 600
    },
    label: {
      font: "body",
      size: "0.6875rem",
      lineHeight: "1rem",
      weight: 600,
      letterSpacing: "0.08em"
    },
    figure: {
      font: "body",
      size: "1rem",
      lineHeight: "1.375rem",
      weight: 600
    },
    "figure-lg": {
      font: "body",
      size: "1.75rem",
      lineHeight: "2rem",
      weight: 600
    },
    "figure-xl": {
      font: "body",
      size: "3rem",
      lineHeight: "3.25rem",
      weight: 700
    }
  },
  space: {
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem",
    "12": "3rem"
  },
  radius: {
    sm: "4px",
    md: "6px",
    lg: "10px",
    full: "9999px"
  },
  raceColours: [
    {
      key: "black",
      name: "Black",
      hex: "#111111"
    },
    {
      key: "white",
      name: "White",
      hex: "#ffffff"
    },
    {
      key: "silver",
      name: "Silver",
      hex: "#c0c0c0"
    },
    {
      key: "red",
      name: "Red",
      hex: "#d32f2f"
    },
    {
      key: "orange",
      name: "Orange",
      hex: "#f57c00"
    },
    {
      key: "yellow",
      name: "Yellow",
      hex: "#fdd835"
    },
    {
      key: "gold",
      name: "Gold",
      hex: "#c9a227"
    },
    {
      key: "green",
      name: "Green",
      hex: "#2e7d32"
    },
    {
      key: "light_blue",
      name: "Light blue",
      hex: "#4fc3f7"
    },
    {
      key: "blue",
      name: "Blue",
      hex: "#1565c0"
    },
    {
      key: "purple",
      name: "Purple",
      hex: "#6a1b9a"
    },
    {
      key: "pink",
      name: "Pink",
      hex: "#f48fb1"
    },
    {
      key: "fluoro_yellow",
      name: "Fluoro yellow",
      hex: "#e6ff00"
    },
    {
      key: "fluoro_green",
      name: "Fluoro green",
      hex: "#39ff14"
    },
    {
      key: "fluoro_orange",
      name: "Fluoro orange",
      hex: "#ff5f1f"
    },
    {
      key: "fluoro_pink",
      name: "Fluoro pink",
      hex: "#ff1493"
    }
  ]
};

// src/tokens.ts
var tokens = tokens_default;
var themes = tokens.themes;
var themeIds = Object.keys(tokens.themes);
var defaultTheme = tokens.defaultTheme;
var raceColours = tokens.raceColours;

// src/colour.ts
var HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
function parseHex(hex) {
  const match = typeof hex === "string" ? HEX.exec(hex.trim()) : null;
  if (!match) {
    throw new RangeError(`Not a hex colour: ${String(hex)}`);
  }
  let digits = match[1];
  if (digits.length === 3) {
    digits = digits.replace(/./g, "$&$&");
  }
  const n = parseInt(digits, 16);
  return { r: n >> 16 & 255, g: n >> 8 & 255, b: n & 255 };
}
var clampByte = (v) => Math.min(255, Math.max(0, Math.round(v)));
function toHex({ r, g, b }) {
  return "#" + [r, g, b].map((v) => clampByte(v).toString(16).padStart(2, "0")).join("").toUpperCase();
}
function normaliseHex(hex) {
  return toHex(parseHex(hex));
}
function rgbToHsl({ r, g, b }) {
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
  let h;
  if (max === rn) {
    h = (gn - bn) / d % 6;
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
function hslToRgb({ h, s, l }) {
  const hue = (h % 360 + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(hue / 60 % 2 - 1));
  const m = l - c / 2;
  const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0] : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c] : hue < 300 ? [x, 0, c] : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}
var hexToHsl = (hex) => rgbToHsl(parseHex(hex));
var hslToHex = (hsl) => toHex(hslToRgb(hsl));
function chroma(hex) {
  const { r, g, b } = parseHex(hex);
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}
function luminance(hex) {
  const { r, g, b } = parseHex(hex);
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// src/contrast.ts
var MIN_TEXT_CONTRAST = 4.5;
var MIN_LIGHTNESS_SEPARATION = 1.25;
var TEXT_PAIRS = [
  ["text", "bg"],
  ["text", "surface"],
  ["text", "surface2"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["onAccent", "accent"],
  ["goodText", "good"],
  ["pb", "bg"],
  ["pb", "surface"],
  ["fast", "bg"],
  ["fast", "surface"],
  ["danger", "bg"],
  ["danger", "surface"],
  ["warning", "bg"],
  ["warning", "surface"]
];
var DISTINCT_PAIRS = [
  // A personal best and a fastest lap sit side by side in a timing row.
  ["pb", "fast"],
  ["danger", "warning"]
];
function contrastFailures(colours) {
  const failures = [];
  const check = (pair, required) => {
    const ratio = contrast(colours[pair[0]], colours[pair[1]]);
    if (ratio < required) {
      failures.push({ pair, ratio: Math.round(ratio * 100) / 100, required });
    }
  };
  for (const pair of TEXT_PAIRS) {
    check(pair, MIN_TEXT_CONTRAST);
  }
  for (const pair of DISTINCT_PAIRS) {
    check(pair, MIN_LIGHTNESS_SEPARATION);
  }
  return failures;
}

// src/generate.ts
var NEUTRAL_CHROMA = 0.12;
var MAX_TINT_SATURATION = 0.4;
var ACCENT_TINT_SATURATION = 0.1;
var GROUND = {
  dark: { bg: 0.08, surface: 0.12, surface2: 0.16, line: 0.22 },
  light: { bg: 0.97, surface: 1, surface2: 0.945, line: 0.87 }
};
var FIXED = {
  dark: { pb: "#4CC38A", good: "#1F4D36", goodText: "#9BF0C4", danger: "#FF6B5E", warning: "#FFB648" },
  light: { pb: "#1F8A55", good: "#DDF3E6", goodText: "#1E5A3A", danger: "#B42318", warning: "#8F5B00" }
};
var DANGER_HUE = 4;
var DANGER_ALT_HUE = 335;
var PB_HUE = hexToHsl(FIXED.dark.pb).h;
var hueDistance = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};
function pickRoles(colours = []) {
  const chromatic = colours.slice(0, 3).map(normaliseHex).filter((hex) => chroma(hex) >= NEUTRAL_CHROMA);
  const roles = {};
  if (chromatic.length === 0) {
    return roles;
  }
  let accentAt = 0;
  chromatic.forEach((hex, i) => {
    if (chroma(hex) > chroma(chromatic[accentAt])) {
      accentAt = i;
    }
  });
  roles.accent = chromatic[accentAt];
  const rest = chromatic.filter((_, i) => i !== accentAt);
  if (rest.length === 0) {
    return roles;
  }
  let tintAt = 0;
  rest.forEach((hex, i) => {
    if (hexToHsl(hex).l < hexToHsl(rest[tintAt]).l) {
      tintAt = i;
    }
  });
  roles.tint = rest[tintAt];
  const third = rest.find((_, i) => i !== tintAt);
  if (third !== void 0) {
    roles.fast = third;
  }
  return roles;
}
function reach(hex, grounds, mode, min = MIN_TEXT_CONTRAST) {
  const step = mode === "dark" ? 5e-3 : -5e-3;
  const hsl = hexToHsl(hex);
  let out = normaliseHex(hex);
  while (grounds.some((ground) => contrast(out, ground) < min) && hsl.l > 0 && hsl.l < 1) {
    hsl.l = Math.min(1, Math.max(0, hsl.l + step));
    out = hslToHex(hsl);
  }
  return out;
}
function separate(hex, other, mode) {
  return reach(hex, [other], mode, MIN_LIGHTNESS_SEPARATION);
}
function statusColours(grounds, mode, accent) {
  const base = FIXED[mode];
  const dangerHsl = hexToHsl(base.danger);
  if (accent !== void 0 && chroma(accent) >= NEUTRAL_CHROMA && hueDistance(hexToHsl(accent).h, DANGER_HUE) < 25) {
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
function accessible(raw, mode) {
  const grounds = [raw.bg, raw.surface, raw.surface2];
  const pb = reach(raw.pb, grounds, mode);
  const accent = reach(raw.accent, grounds, mode);
  let danger = reach(raw.danger, grounds, mode);
  let warning = reach(raw.warning, grounds, mode);
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
    onAccent: contrast(raw.onAccent, accent) >= MIN_TEXT_CONTRAST ? raw.onAccent : contrast("#FFFFFF", accent) >= contrast(raw.bg, accent) ? "#FFFFFF" : raw.bg,
    goodText: reach(raw.goodText, [raw.good], mode),
    pb,
    fast: separate(reach(raw.fast, grounds, mode), pb, mode),
    danger,
    warning
  };
}
function fallback(mode) {
  const id = mode === "dark" ? tokens.defaultTheme : tokens.defaultLightTheme;
  return accessible({ ...tokens.themes[id].colours }, mode);
}
function themeFromRoles(roles, mode = "dark") {
  if (mode !== "dark" && mode !== "light") {
    throw new RangeError(`Not a theme mode: ${String(mode)}`);
  }
  if (roles.accent === void 0) {
    return fallback(mode);
  }
  const accentIn = normaliseHex(roles.accent);
  const accentHsl = hexToHsl(accentIn);
  let tint;
  if (roles.tint !== void 0) {
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
    l: mode === "dark" ? 0.95 : 0.13
  });
  const muted = hslToHex({ h: tint.h, s: Math.min(tint.s, 0.25), l: mode === "dark" ? 0.7 : 0.38 });
  let fast;
  if (roles.fast !== void 0) {
    fast = normaliseHex(roles.fast);
  } else {
    let h = (accentHsl.h + 180) % 360;
    if (hueDistance(h, PB_HUE) < 30) {
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
      ...statusColours([bg, surface, surface2], mode, accentIn)
    },
    mode
  );
}
function generateTheme(colours = [], mode = "dark") {
  return themeFromRoles(pickRoles(colours), mode);
}

// src/types.ts
var THEME_KEYS = [
  "bg",
  "surface",
  "surface2",
  "line",
  "text",
  "muted",
  "accent",
  "onAccent",
  "good",
  "goodText",
  "pb",
  "fast",
  "danger",
  "warning"
];

// src/css.ts
var kebab = (name) => name.replace(/_/g, "-").replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
function cssVarName(key) {
  return `--rm-${kebab(key)}`;
}
function themeMode(colours) {
  return contrast(colours.bg, "#000000") < contrast(colours.bg, "#FFFFFF") ? "dark" : "light";
}
function themeToVars(colours) {
  return Object.fromEntries(THEME_KEYS.map((key) => [cssVarName(key), colours[key]]));
}
function declarations(colours) {
  return [`color-scheme: ${themeMode(colours)};`, ...THEME_KEYS.map((key) => `${cssVarName(key)}: ${colours[key]};`)];
}
function themeToCss(colours, selector) {
  const lines = declarations(colours);
  if (selector === void 0) {
    return lines.join(" ");
  }
  return `${selector} {
${lines.map((line) => `  ${line}`).join("\n")}
}
`;
}

// src/discourse.ts
var DISCOURSE_MAPPING = {
  primary: "text",
  secondary: "bg",
  tertiary: "accent",
  quaternary: "fast",
  header_background: "surface",
  header_primary: "text",
  highlight: "accent",
  danger: "danger",
  success: "pb",
  love: "danger"
};
function toDiscourseScheme(id, theme) {
  const names = Object.keys(DISCOURSE_MAPPING);
  return {
    id,
    name: `RC Misfits: ${theme.name}`,
    dark: theme.mode === "dark",
    colors: Object.fromEntries(
      names.map((name) => [name, theme.colours[DISCOURSE_MAPPING[name]].replace(/^#/, "").toUpperCase()])
    )
  };
}
export {
  DISCOURSE_MAPPING,
  MIN_TEXT_CONTRAST,
  THEME_KEYS,
  contrast,
  contrastFailures,
  cssVarName,
  defaultTheme,
  generateTheme,
  pickRoles,
  raceColours,
  themeFromRoles,
  themeIds,
  themeMode,
  themeToCss,
  themeToVars,
  themes,
  toDiscourseScheme,
  tokens
};
