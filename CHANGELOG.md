# Changelog

Apps pin a tag: `pnpm add github:Combustionpunk/brand#vX.Y.Z`. The forum installs the matching `discourse-vX.Y.Z` (see `docs/discourse-install.md`). Token names have not changed since 0.1.0, so every release so far is a minor one.

## 0.5.0

Readable text everywhere on the forum, and darker accents in the light palettes. No token names change.

- **Darker light-palette accents (#16).** Each light palette's `accent` is darkened towards `text` by the smallest 1% step that makes links reach 4.5:1 on `line` (the forum's hover row). The generator does the same in light mode, so Match my car light and the generated `-light` themes follow. The dark palettes are unchanged.

  | Palette | Accent before → after |
  |---|---|
  | Pit Lane light | `#946700` → `#7F5A05` |
  | Synthwave light | `#C2187A` → `#B41774` |
  | Garage light | `#C04400` → `#AC4004` |
  | Fluoro light | `#6A7500` → `#606A04` |
  | Racing Green light | `#846B1C` → `#77631C` |
  | Works Blue light | `#816901` → `#715D08` |
  | Red Line light | `#DE0400` → `#C70704` |
  | Sunset light | `#996100` → `#875604` |
  | Ice (light) | `#0275BA` → `#0467A3` |

- **Forum hover and selected rows (#16).** Links and text reach 4.5:1 on both. The hover row moves towards the page only in Synthwave, Garage and Red Line (dark). The selected row is the page tinted towards the accent, as far as links still pass (12.5–20%). The palettes' `tertiary`, `highlight`, `hover` and `selected` change in `discourse/about.json` and `dist/discourse/*.json`.
- **Readable derived greys on the forum (#14).** The secondary text Discourse derives from `primary` and `secondary` (dates, counts, "replies") is moved towards `primary` until it reaches 4.5:1 on the page and the hover row, in every palette and in Match my car.
- **Build (#16).** `dist/` and `discourse/` no longer contain absolute paths, and CI runs `pnpm check:dist`.

## 0.4.0

- **Match my car on the forum (#12).** When a member has Match my car on and has race colours, the forum is painted in a theme generated from them, light or dark as their device asks. `discourseVariables(theme)` gives every colour variable Discourse compiles from a palette.
- **Member palette choices stick (#10).** `docs/discourse-install.md` adds the step after every install: make the 17 `RC Misfits: …` palettes user-selectable. A test pins the palette names, because a renamed palette loses the setting.
- **Publishing the forum theme (#8).** The `discourse-theme` branch is published with git's own `filter-branch` (works in a Codespace).

## 0.3.0

- **The forum theme (#6).** `pnpm build` also writes `discourse/`: every theme as a Discourse palette (`RC Misfits: <theme>`, Pit Lane first), Oswald and Inter as theme assets, tabular figures for counts, dates and tables, and the shared `<rm-header site="forum">` above Discourse's own header. Install, update and roll back are in `docs/discourse-install.md`. Published as `discourse-v0.3.0`.

Earlier releases: `v0.1.0` (tokens, the theme generator, fonts, the logo) and `v0.2.0` (the shared header, `<rm-header>`).
