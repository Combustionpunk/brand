/** The visual check page: every theme's swatches with a small top bar, practice row and buttons. */
import { contrast } from "../src/colour.ts";
import { themeToCss } from "../src/css.ts";
import { generateTheme } from "../src/generate.ts";
import { tokens } from "../src/tokens.ts";
import { THEME_KEYS } from "../src/types.ts";
import type { ThemeColours, ThemeMode } from "../src/types.ts";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** "Match my car" examples: race colours from the forum's palette, main first. */
export const EXAMPLES: Array<{ label: string; keys: string[] }> = [
  { label: "Fluoro yellow, blue, light blue", keys: ["fluoro_yellow", "blue", "light_blue"] },
  { label: "Red, white, black", keys: ["red", "white", "black"] },
  { label: "Purple, fluoro pink", keys: ["purple", "fluoro_pink"] },
  { label: "Green, gold, orange", keys: ["green", "gold", "orange"] },
  { label: "White, silver, black (all neutral)", keys: ["white", "silver", "black"] },
];

const raceHex = (key: string) => tokens.raceColours.find((colour) => colour.key === key)!.hex;

const ROWS = [
  { pos: 1, driver: "A. Whitlock", car: ["fluoro_yellow", "blue"], laps: 24, last: "14.207", best: "13.882", mark: "fast" },
  { pos: 2, driver: "S. Okafor", car: ["red", "white", "black"], laps: 24, last: "14.031", best: "14.031", mark: "pb" },
  { pos: 3, driver: "J. Marsh", car: ["purple", "fluoro_pink"], laps: 23, last: "15.440", best: "14.356", mark: "" },
];

function card(title: string, subtitle: string, colours: ThemeColours, attributes: string): string {
  const chips = (keys: string[]) =>
    keys.map((key) => `<span class="chip" style="background:${raceHex(key)}" title="${escape(key)}"></span>`).join("");
  const rows = ROWS.map(
    (row) => `
        <tr>
          <td class="rm-figures pos">${row.pos}</td>
          <td><span class="chips">${chips(row.car)}</span>${escape(row.driver)}</td>
          <td class="rm-figures num">${row.laps}</td>
          <td class="rm-figures num${row.mark === "pb" ? " pb" : ""}">${row.last}${row.mark === "pb" ? ' <abbr title="Personal best">PB</abbr>' : ""}</td>
          <td class="rm-figures num${row.mark === "fast" ? " fast" : ""}">${row.best}${row.mark === "fast" ? ' <abbr title="Fastest lap">FL</abbr>' : ""}</td>
        </tr>`,
  ).join("");
  const swatches = THEME_KEYS.map((key) => {
    const ink = contrast(colours[key], "#000000") >= contrast(colours[key], "#FFFFFF") ? "#000000" : "#FFFFFF";
    return `<div class="swatch" style="background:${colours[key]};color:${ink}"><b>${key}</b><span>${colours[key]}</span></div>`;
  }).join("");

  return `
    <section class="card" ${attributes}>
      <header class="bar">
        <img class="logo" src="../assets/logo/rc-misfits-logo.svg" alt="RC Misfits" />
        <nav aria-label="Sites">
          <a href="#">Forum</a><a href="#">Meetings</a><a href="#">Tracks</a><a href="#" aria-current="page">Timing</a>
        </nav>
        <span class="user">yeti</span>
      </header>
      <div class="body">
        <h2>${escape(title)}</h2>
        <p class="muted">${escape(subtitle)}</p>
        <table class="practice">
          <thead><tr><th>Pos</th><th>Driver</th><th class="num">Laps</th><th class="num">Last</th><th class="num">Best</th></tr></thead>
          <tbody>${rows}
          </tbody>
        </table>
        <div class="actions">
          <button type="button" class="primary">Start practice</button>
          <button type="button" class="quiet">Settings</button>
          <span class="pill">On track</span>
          <a href="#">A link</a>
          <span class="danger">Transponder missing</span>
          <span class="warning">Low battery</span>
        </div>
        <div class="swatches">${swatches}</div>
      </div>
    </section>`;
}

const STYLE = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: var(--rm-space-6); background: var(--rm-bg); color: var(--rm-text); font: var(--rm-type-body); }
  h1 { font: var(--rm-type-display); letter-spacing: var(--rm-type-display-tracking); margin: 0 0 var(--rm-space-2); text-transform: uppercase; }
  h2 { font: var(--rm-type-heading); letter-spacing: var(--rm-type-heading-tracking); margin: 0; text-transform: uppercase; }
  h1 + p, .group > p { color: var(--rm-muted); margin: 0 0 var(--rm-space-6); max-width: 70ch; }
  .group { margin-top: var(--rm-space-8); }
  .group > h2 { font: var(--rm-type-title); margin-bottom: var(--rm-space-2); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(34rem, 100%), 1fr)); gap: var(--rm-space-6); }
  .card { min-width: 0; background: var(--rm-bg); color: var(--rm-text); border: 1px solid var(--rm-line); border-radius: var(--rm-radius-lg); overflow: hidden; }
  .bar { display: flex; flex-wrap: wrap; align-items: center; gap: var(--rm-space-4); padding: var(--rm-space-2) var(--rm-space-4); background: var(--rm-surface); border-bottom: 1px solid var(--rm-line); }
  .logo { height: 2.5rem; width: auto; display: block; }
  .bar nav { display: flex; flex-wrap: wrap; gap: var(--rm-space-1) var(--rm-space-4); flex: 1; }
  .bar a { font: var(--rm-type-subheading); letter-spacing: var(--rm-type-subheading-tracking); text-transform: uppercase; text-decoration: none; color: var(--rm-text); padding: var(--rm-space-1) 0; border-bottom: 2px solid transparent; }
  .bar a[aria-current] { color: var(--rm-accent); border-bottom-color: var(--rm-accent); }
  .user { font: var(--rm-type-control); color: var(--rm-muted); }
  .body { padding: var(--rm-space-4); display: grid; gap: var(--rm-space-3); }
  .muted { color: var(--rm-muted); font: var(--rm-type-body-sm); margin: 0; }
  .body > * { min-width: 0; }
  .practice { width: 100%; border-collapse: collapse; background: var(--rm-surface); border: 1px solid var(--rm-line); border-radius: var(--rm-radius-md); }
  .practice th { font: var(--rm-type-label); letter-spacing: var(--rm-type-label-tracking); text-transform: uppercase; color: var(--rm-muted); text-align: left; padding: var(--rm-space-2) var(--rm-space-3); background: var(--rm-surface2); }
  .practice td { font: var(--rm-type-figure); padding: var(--rm-space-2) var(--rm-space-3); border-top: 1px solid var(--rm-line); }
  /* The font shorthand resets font-variant-numeric, so tabular figures are set after it. */
  .practice td.rm-figures { font-variant-numeric: tabular-nums; }
  .practice td:nth-child(2) { font: var(--rm-type-body); }
  .practice .num { text-align: right; }
  .practice .pos { color: var(--rm-muted); width: 3rem; }
  .practice .pb { color: var(--rm-pb); }
  .practice .fast { color: var(--rm-fast); }
  .practice abbr { font: var(--rm-type-label); text-decoration: none; border: 1px solid currentColor; border-radius: var(--rm-radius-sm); padding: 0 var(--rm-space-1); }
  .chips { display: inline-flex; margin-right: var(--rm-space-2); vertical-align: middle; border: 1px solid var(--rm-line); border-radius: var(--rm-radius-sm); overflow: hidden; }
  .chip { width: 0.625rem; height: 1rem; display: block; }
  .actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--rm-space-3); background: var(--rm-surface); border: 1px solid var(--rm-line); border-radius: var(--rm-radius-md); padding: var(--rm-space-3); font: var(--rm-type-body-sm); }
  button { font: var(--rm-type-control); border-radius: var(--rm-radius-md); padding: var(--rm-space-2) var(--rm-space-4); border: 1px solid transparent; cursor: pointer; }
  .primary { background: var(--rm-accent); color: var(--rm-on-accent); }
  .quiet { background: var(--rm-surface2); color: var(--rm-text); border-color: var(--rm-line); }
  .pill { background: var(--rm-good); color: var(--rm-good-text); border-radius: var(--rm-radius-full); padding: var(--rm-space-1) var(--rm-space-3); font: var(--rm-type-control); }
  .actions a { color: var(--rm-accent); }
  .danger { color: var(--rm-danger); }
  .warning { color: var(--rm-warning); }
  .swatches { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; border: 1px solid var(--rm-line); border-radius: var(--rm-radius-md); overflow: hidden; }
  .swatch { padding: var(--rm-space-2); min-height: 3.25rem; min-width: 0; overflow: hidden; display: grid; align-content: end; font: var(--rm-type-label); }
  .swatch span { font-weight: 400; opacity: 0.9; }
  .scale { display: grid; gap: var(--rm-space-2); background: var(--rm-surface); border: 1px solid var(--rm-line); border-radius: var(--rm-radius-lg); padding: var(--rm-space-4); }
  .scale div { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--rm-space-4); }
  .scale small { font: var(--rm-type-label); color: var(--rm-muted); width: 7rem; flex: none; text-transform: uppercase; }
  .race { display: grid; grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr)); gap: var(--rm-space-2); }
  .race div { border: 1px solid var(--rm-line); border-radius: var(--rm-radius-md); overflow: hidden; background: var(--rm-surface); font: var(--rm-type-body-sm); }
  .race i { display: block; height: 2.5rem; }
  .race span { display: block; padding: var(--rm-space-1) var(--rm-space-2); }
`;

export function renderPreview(): string {
  const byMode = (mode: ThemeMode) =>
    Object.entries(tokens.themes)
      .filter(([, theme]) => theme.mode === mode)
      .map(([id, theme]) => card(theme.name, `data-theme="${id}"`, theme.colours, `data-theme="${id}"`))
      .join("");

  const generated = EXAMPLES.flatMap((example) =>
    (["dark", "light"] as const).map((mode) => {
      const colours = generateTheme(example.keys.map(raceHex), mode);
      return card(
        example.label,
        `generateTheme([${example.keys.map(raceHex).join(", ")}], "${mode}")`,
        colours,
        `data-generated="${mode}" style="${themeToCss(colours)}"`,
      );
    }),
  ).join("");

  const scale = Object.entries(tokens.type)
    .map(([name, style]) => {
      const sample = style.font === "display" ? "Winter Series Round 3" : name.startsWith("figure") ? "13.882  1:04.207  24" : "Practice starts at 9:30. Bring a charged transponder.";
      const extra = (style.letterSpacing ? `letter-spacing:var(--rm-type-${name}-tracking);` : "") + (name.startsWith("figure") ? "font-variant-numeric:tabular-nums;" : "") + (style.font === "display" || name === "label" ? "text-transform:uppercase;" : "");
      return `<div><small>${escape(name)}</small><span style="font:var(--rm-type-${name});${extra}">${escape(sample)}</span></div>`;
    })
    .join("");

  const race = tokens.raceColours
    .map((colour) => `<div><i style="background:${colour.hex}"></i><span>${escape(colour.name)}<br /><span class="muted">${colour.hex}</span></span></div>`)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RC Misfits brand preview</title>
  <link rel="stylesheet" href="../fonts/fonts.css" />
  <link rel="stylesheet" href="../dist/tokens.css" />
  <style>${STYLE}</style>
</head>
<body>
  <h1>RC Misfits brand</h1>
  <p>Every theme in <code>tokens.json</code>, then "Match my car" examples from the generator. This page has no <code>data-theme</code>, so it is Pit Lane, or Pit Lane light if your device asks for light.</p>

  <div class="group" id="dark">
    <h2>Dark themes</h2>
    <p>Pit Lane is the default.</p>
    <div class="grid">${byMode("dark")}
    </div>
  </div>

  <div class="group" id="light">
    <h2>Light themes</h2>
    <p>Pit Lane light, Synthwave light and Ice are the Board's. The other six come from the generator's light mode.</p>
    <div class="grid">${byMode("light")}
    </div>
  </div>

  <div class="group" id="generated">
    <h2>Match my car</h2>
    <p>Race colours from the forum's palette, through <code>generateTheme</code>, dark and light.</p>
    <div class="grid">${generated}
    </div>
  </div>

  <div class="group" id="type">
    <h2>Type scale</h2>
    <p>Oswald for headings, Inter for body text and figures (tabular).</p>
    <div class="scale">${scale}</div>
  </div>

  <div class="group" id="race">
    <h2>Race colours</h2>
    <p>The forum's palette.</p>
    <div class="race">${race}</div>
  </div>
</body>
</html>
`;
}
