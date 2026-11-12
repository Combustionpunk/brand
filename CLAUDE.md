# RC Misfits brand

The one source of the RC Misfits look, used by every app:
- **the forum** (a Discourse theme component built from this repo);
- **Track Studio** (tracks.rcmisfits.org);
- **Club Timing**: the box's screens and the timing site (timing.rcmisfits.org).

Background and the Board's decisions are in combustion-ops #11.

## What lives here
- **Design tokens:** colours per theme (dark and light), type scale, spacing, radii and the race-colour palette. `tokens.json` is the single source; everything else is generated from it.
- **Generated outputs:**
  - `dist/tokens.css` (CSS custom properties, one block per theme: `[data-theme="pit-lane"]` and so on);
  - `dist/tokens.ts` / `.js` with types;
  - a Discourse colour scheme per theme (JSON) for the forum.
- **The theme generator ("Match my car", "club colours"):** a **pure function**. Up to three hex colours in, a complete theme out (dark and light), every text and accent pair at ≥ 4.5:1 contrast. Used by all the apps, so it lives here once.
- **Fonts:** Oswald (headings) and Inter (body and figures), self-hosted woff2, with their licences.
- **The logo** (the existing RC Misfits logo, never redrawn) and favicons.
- **The shared header:** spec, markup and CSS for the top bar used on every site (logo, Forum · Meetings · Tracks · Timing, current site highlighted, sign in or username).

## Non-negotiables
- **Pit Lane is the default theme** (Board, 12 Nov 2026). Changing any colour is a Board decision.
- **Accessible:** text ≥ 4.5:1, large text ≥ 3:1, colours that must be told apart also differ in lightness. Tests enforce this for every theme and for generator output.
- **Tabular figures** for all timing numbers.
- **No app-specific code** here; the apps import from this package.
- **Versioned:** semantic-version tags (`v0.1.0`...). Apps pin a tag. A change of token names is a major bump.
- Node 24, pnpm, TypeScript, Vitest.
