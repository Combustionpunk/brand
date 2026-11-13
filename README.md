# RC Misfits brand

The one source of the RC Misfits look: design tokens, the theme generator, fonts and the logo. The forum, Track Studio and Club Timing all import this package, so they read as one site.

- **Themes:** 17 built-in colour themes, dark and light. **Pit Lane** is the default.
- **"Match my car" and "club colours":** `generateTheme` makes a full theme from up to three colours.
- **Type:** Oswald for headings, Inter for body text and figures (tabular).
- **The logo:** the existing RC Misfits logo, as it is.

## Consuming it

### 1. Install, pinned to a tag

```sh
pnpm add github:Combustionpunk/brand#v0.1.0
```

- The package name is `@rcmisfits/brand`.
- `dist/` is committed, so nothing is built on install.
- Always pin a tag. A change of token names is a major version.

### 2. Import the CSS

```ts
import "@rcmisfits/brand/fonts.css"; // @font-face for Oswald and Inter
import "@rcmisfits/brand/tokens.css"; // the --rm-* custom properties
```

Then use the variables:

```css
body {
  background: var(--rm-bg);
  color: var(--rm-text);
  font: var(--rm-type-body);
}
h1 {
  font: var(--rm-type-title);
  letter-spacing: var(--rm-type-title-tracking);
}
.button {
  background: var(--rm-accent);
  color: var(--rm-on-accent);
  border-radius: var(--rm-radius-md);
}
```

### 3. Choose the theme with `data-theme` on `<html>`

```html
<html data-theme="synthwave">
```

- With no `data-theme`, the page is **Pit Lane**, or **Pit Lane light** if the device asks for light (`prefers-color-scheme: light`).
- With a `data-theme`, that theme is used whatever the device asks for.
- `data-theme` also works on any element, to theme one part of a page.

### 4. Which theme shows where (Board, 13 Nov 2026)

Every app applies the same order:

1. **The signed-in member's own theme**, on every device where they are signed in (forum, Track Studio, timing site).
2. **The club's theme** (its chosen theme, or "club colours"), on the TV, the timing box's screens, and for signed-out visitors to that club's pages.
3. **Pit Lane**, when neither is set. Leave `data-theme` off and the CSS does this.

```ts
const theme = member?.theme ?? club?.theme; // a theme id, or undefined
if (theme) {
  document.documentElement.dataset.theme = theme;
} else {
  delete document.documentElement.dataset.theme;
}
```

### 5. A generated theme ("Match my car", "club colours")

```ts
import { generateTheme, themeToCss, themeToVars } from "@rcmisfits/brand";

const theme = generateTheme(["#e6ff00", "#1565c0", "#4fc3f7"], "dark"); // main colour first

// As a rule in a <style> element:
style.textContent = themeToCss(theme, '[data-theme="custom"]');
document.documentElement.dataset.theme = "custom";

// Or inline, for example in React:
<div style={themeToVars(theme)} />;
```

- `generateTheme(colours, mode)` takes 0 to 3 hex colours and `"dark"` or `"light"`. It returns the same keys as a built-in theme.
- It is a pure function: the same colours always give the same theme, on the server or in the browser.
- For a theme that follows the device, generate both modes and put the light one in a `prefers-color-scheme: light` media query.

### 6. Tokens in JavaScript

```ts
import { tokens, themes, themeIds, defaultTheme, raceColours } from "@rcmisfits/brand";

themes["pit-lane"].colours.accent; // "#FFC72C"
themes["garage"].pair; // "garage-light"
raceColours; // [{ key: "black", name: "Black", hex: "#111111" }, ...]
```

`@rcmisfits/brand/tokens.json` is the raw source file.

### 7. The logo

| Import | File | Use |
|---|---|---|
| `@rcmisfits/brand/logo.svg` | `assets/logo/rc-misfits-logo.svg` | The master. Use it everywhere it can be used. |
| `@rcmisfits/brand/logo-512.png` | `dist/logo/rc-misfits-logo-512.png` | 512 px wide, for places that cannot take SVG. |
| `@rcmisfits/brand/logo-1024.png` | `dist/logo/rc-misfits-logo-1024.png` | 1024 px wide. |
| `@rcmisfits/brand/logo.png` | `assets/logo/rc-misfits-logo.png` | The 2463 × 1041 original (2.7 MB). Too heavy for web pages. |

```tsx
import logo from "@rcmisfits/brand/logo.svg";

<img src={logo} alt="RC Misfits" height={40} />;
```

Never recolour, stretch or redraw the logo. Themes change the UI around it, never the logo itself. The rules are in [`assets/logo/README.md`](assets/logo/README.md).

### 8. The forum (Discourse)

`dist/discourse/<id>.json` (`@rcmisfits/brand/discourse/<id>.json`) holds a Discourse colour scheme for each theme. The Discourse theme component is a later issue; it will build its `color_schemes` from these files.

## The themes

| id | Name | Mode | Pair |
|---|---|---|---|
| `pit-lane` | Pit Lane (**default**) | dark | `pit-lane-light` |
| `pit-lane-light` | Pit Lane light | light | `pit-lane` |
| `synthwave` | Synthwave | dark | `synthwave-light` |
| `synthwave-light` | Synthwave light | light | `synthwave` |
| `garage` | Garage | dark | `garage-light` |
| `garage-light` | Garage light | light | `garage` |
| `fluoro` | Fluoro | dark | `fluoro-light` |
| `fluoro-light` | Fluoro light | light | `fluoro` |
| `racing-green` | Racing Green | dark | `racing-green-light` |
| `racing-green-light` | Racing Green light | light | `racing-green` |
| `works-blue` | Works Blue | dark | `works-blue-light` |
| `works-blue-light` | Works Blue light | light | `works-blue` |
| `red-line` | Red Line | dark | `red-line-light` |
| `red-line-light` | Red Line light | light | `red-line` |
| `sunset` | Sunset | dark | `sunset-light` |
| `sunset-light` | Sunset light | light | `sunset` |
| `ice` | Ice (light) | light | none |

The six `-light` themes from Garage to Sunset come from the generator's light mode.

### Theme keys

| Key | CSS variable | Use |
|---|---|---|
| `bg` | `--rm-bg` | The page background. |
| `surface` | `--rm-surface` | Cards, tables and the top bar. |
| `surface2` | `--rm-surface2` | Table headers, inputs, quiet buttons. |
| `line` | `--rm-line` | Borders and dividers. Not for text. |
| `text` | `--rm-text` | Body text. |
| `muted` | `--rm-muted` | Secondary text and labels. |
| `accent` | `--rm-accent` | Primary buttons, links, the current item. |
| `onAccent` | `--rm-on-accent` | Text on an accent fill. |
| `good` | `--rm-good` | The fill of a positive status pill. |
| `goodText` | `--rm-good-text` | Text on `good`. |
| `pb` | `--rm-pb` | A personal best. |
| `fast` | `--rm-fast` | The fastest lap. |
| `danger` | `--rm-danger` | Errors. |
| `warning` | `--rm-warning` | Warnings. |

Do not rely on colour alone: show a personal best and a fastest lap with a label or icon too.

### Other variables

| Variables | Meaning |
|---|---|
| `--rm-font-display`, `--rm-font-body` | The Oswald and Inter font stacks. |
| `--rm-type-<style>` | A `font` shorthand for a style: `font: var(--rm-type-heading)`. |
| `--rm-type-<style>-size`, `-line`, `-weight`, `-tracking` | The parts of a style, one by one. |
| `--rm-space-1` to `--rm-space-12` | Spacing, on a 4 px base (`0.25rem` steps). |
| `--rm-radius-sm`, `-md`, `-lg`, `-full` | Corner radii. |
| `--rm-race-<key>` | The forum's 16 race colours, for example `--rm-race-fluoro-yellow`. |

The type styles are `display`, `title`, `heading`, `subheading` (Oswald), and `body`, `body-sm`, `control`, `label`, `figure`, `figure-lg`, `figure-xl` (Inter). Sizes are in `rem`, so a TV screen can scale everything from the root font size.

### Timing numbers: tabular figures

Every timing number uses figures of equal width, so columns line up and digits do not jump as they change.

```css
.lap-time {
  font: var(--rm-type-figure);
  font-variant-numeric: tabular-nums; /* after `font`: the shorthand resets it */
}
```

`tokens.css` also has a `.rm-figures` class that does the same. If the element's own rule sets `font`, that rule must set `font-variant-numeric` too, as above.

## The generator's rules

`generateTheme(colours, mode)`, in [`src/generate.ts`](src/generate.ts):

- White, black and silver (low chroma) are **neutral** and take no role.
- The **accent** is the colour with the most chroma. In a tie, the earlier colour wins.
- The **background tint** is the deepest remaining colour. Its saturation is capped at 40%. A dark ground is about 8% lightness and a light ground about 97%.
- With only one colour, the ground takes a faint tint of the accent.
- The **highlight** (`fast`) is the third colour, else the accent's opposite hue. If that opposite would be the personal-best green, it moves on to blue.
- `pb` is a fixed green. `good`, `danger` and `warning` are fixed too. `danger` moves from red to rose when the accent itself is red or orange.
- The lightness of the accent, `fast`, `pb`, `text`, `muted`, `danger` and `warning` is adjusted until each is at least 4.5:1 on `bg`, `surface` and `surface2`.
- `pb` and `fast`, and `danger` and `warning`, also differ in lightness.
- With no chromatic colour (no colours, or all white, black and silver), the result is Pit Lane.
- Only the first three colours are used. A value that is not a hex colour throws a `RangeError`.

## Discourse colour mapping

`toDiscourseScheme(id, theme)` writes each `dist/discourse/<id>.json`:

```json
{
  "id": "pit-lane",
  "name": "RC Misfits: Pit Lane",
  "dark": true,
  "colors": { "primary": "F2F2F0", "secondary": "17181B", "tertiary": "FFC72C" }
}
```

| Discourse name | Token | Why |
|---|---|---|
| `primary` | `text` | Discourse's text colour. |
| `secondary` | `bg` | Discourse's page background. |
| `tertiary` | `accent` | Links and primary buttons. |
| `quaternary` | `fast` | The second highlight colour. |
| `header_background` | `surface` | The top bar sits on the raised surface. |
| `header_primary` | `text` | Text and icons in the top bar. |
| `highlight` | `accent` | Search hits and the selected post. |
| `danger` | `danger` | Errors and delete buttons. |
| `success` | `pb` | The theme's bright green. |
| `love` | `danger` | The like heart: the theme's red. |

Hex values have no `#`, as Discourse stores them.

## Fonts

`fonts/` holds Oswald and Inter as variable woff2 files (latin and latin-ext), `fonts.css` with the `@font-face` rules, and the OFL licences. See [`fonts/README.md`](fonts/README.md).

## Working on this package

Node 24, pnpm, TypeScript, Vitest.

| Command | What it does |
|---|---|
| `pnpm typecheck` | Type-checks `src`, `scripts` and `test`. |
| `pnpm test` | Runs the tests, including the contrast checks for every theme and for generator output. |
| `pnpm build` | Writes `dist/` from `tokens.json` and `src/`. |
| `pnpm preview` | Writes `preview/index.html`: every theme's swatches, a top bar, a practice table and buttons. Serve the repo folder over HTTP to view it (`npx serve .`, then open `/preview/`), so the fonts load. |
| `pnpm check:dist` | Builds, then fails if the committed `dist/` was out of date. |

- **`tokens.json` is the single source.** Change it, then run `pnpm build` and commit `dist/` with it. A test fails if `dist/tokens.css` or the Discourse schemes do not match `tokens.json`.
- **Changing any colour is a Board decision.**
- Releases are semantic-version tags (`v0.1.0`). The Board tags them.
