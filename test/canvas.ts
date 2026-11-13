/** The Board's design canvas values, copied from issue #1. The tokens must match these exactly. */
export const CANVAS_KEYS = [
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
] as const;

const TABLE = `
pit-lane | Pit Lane | #17181B | #212328 | #2B2E34 | #353840 | #F2F2F0 | #A9ACB3 | #FFC72C | #17181B | #1F4D36 | #9BF0C4 | #4CC38A | #C3A2FF
pit-lane-light | Pit Lane light | #F4F3EF | #FFFFFF | #F0EEE8 | #DEDBD2 | #1B1C1F | #5C5F66 | #B07A00 | #FFFFFF | #DDF3E6 | #1E5A3A | #1F8A55 | #6B3FD1
synthwave | Synthwave | #140B24 | #1E1234 | #2A1A47 | #3A2860 | #F7F3FA | #BBA9D3 | #FF3EA5 | #140B24 | #123B3C | #7FF5DF | #5CF2A6 | #46E5FF
synthwave-light | Synthwave light | #F8F4FB | #FFFFFF | #F1E9F7 | #E2D5EC | #22123A | #5E4B78 | #C2187A | #FFFFFF | #DCF5EE | #14584A | #13865A | #0B7A99
garage | Garage | #1C1A17 | #26231F | #322E28 | #3E3A33 | #F3EEE6 | #B8AF9F | #FF6B1A | #1C1A17 | #26402C | #A8E6B5 | #6BD38A | #7FC3FF
fluoro | Fluoro | #0E0F0C | #181A15 | #22251D | #2F3328 | #F4F7EE | #A9B19A | #E6FF00 | #0E0F0C | #1F3D16 | #B4F59A | #39FF14 | #FF6AD5
racing-green | Racing Green | #0F1A14 | #16241C | #1E3026 | #2A4033 | #F1EFE6 | #A9B8AC | #D4AF37 | #0F1A14 | #20402E | #9FE3BC | #6FE39A | #8EC9FF
works-blue | Works Blue | #0B1630 | #111F3D | #182A52 | #24396A | #F3F6FC | #A9B6D3 | #FDD835 | #0B1630 | #123A33 | #8FF0CF | #5CE6A0 | #FF8AC8
red-line | Red Line | #121212 | #1C1C1E | #26262A | #34343A | #F5F5F5 | #ADADB3 | #FF4D4A | #121212 | #1E3D2C | #9BEFC0 | #4CD98A | #7FB8FF
sunset | Sunset | #1A1210 | #251A16 | #30231D | #433128 | #FBF4EC | #C3AE9C | #FFB22E | #1A1210 | #2A3D25 | #B8EBA5 | #7FDB6A | #FF7AA8
ice | Ice (light) | #F2F7FB | #FFFFFF | #E7F0F7 | #D3E1EC | #0F2133 | #4A6075 | #0277BD | #FFFFFF | #DDF3E9 | #165A3F | #158A55 | #7B3FD1
`;

export interface CanvasTheme {
  id: string;
  name: string;
  colours: Record<(typeof CANVAS_KEYS)[number], string>;
}

export const CANVAS: CanvasTheme[] = TABLE.trim()
  .split("\n")
  .map((row) => {
    const [id, name, ...values] = row.split("|").map((cell) => cell.trim());
    return {
      id: id!,
      name: name!,
      colours: Object.fromEntries(CANVAS_KEYS.map((key, i) => [key, values[i]!])) as CanvasTheme["colours"],
    };
  });

/** The canvas themes that are dark only: their light versions come from the generator. */
export const DARK_ONLY = ["garage", "fluoro", "racing-green", "works-blue", "red-line", "sunset"];

/** The forum's `colour_palette` (discourse-event-system, `DesRaceColours::PALETTE`). */
export const FORUM_PALETTE: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  silver: "#c0c0c0",
  red: "#d32f2f",
  orange: "#f57c00",
  yellow: "#fdd835",
  gold: "#c9a227",
  green: "#2e7d32",
  light_blue: "#4fc3f7",
  blue: "#1565c0",
  purple: "#6a1b9a",
  pink: "#f48fb1",
  fluoro_yellow: "#e6ff00",
  fluoro_green: "#39ff14",
  fluoro_orange: "#ff5f1f",
  fluoro_pink: "#ff1493",
};
