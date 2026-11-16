# RC Misfits brand

The one source of the RC Misfits look: design tokens, the theme generator, fonts and the logo. The forum, Track Studio and Club Timing all import this package, so they read as one site.

- **Themes:** 17 built-in colour themes, dark and light. **Pit Lane** is the default.
- **"Match my car" and "club colours":** `generateTheme` makes a full theme from up to three colours.
- **Type:** Oswald for headings, Inter for body text and figures (tabular).
- **The logo:** the existing RC Misfits logo, as it is.

## Consuming it

### 1. Install, pinned to a tag

```sh
pnpm add github:Combustionpunk/brand#v0.2.0
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

A member's or club's choice is either a theme id, as above, or its own colours ("Match my car", "club colours"). For colours, generate the theme as in the next step. The order stays the same.

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

- `dist/discourse/<id>.json` (`@rcmisfits/brand/discourse/<id>.json`) holds a Discourse colour scheme for each theme.
- `discourse/` is the forum's **theme component**, written by `pnpm build`: every theme as a colour scheme, the fonts, tabular figures, and `<rm-header site="forum">` above Discourse's header. On the forum the brand theme is set as `data-rm-theme` on `<html>`, from the colour scheme the member is seeing.
- Discourse installs a component from a repository's root, not a subfolder. Installing, publishing, the defaults and rolling back are in [`docs/discourse-install.md`](docs/discourse-install.md).

### 9. The shared top bar: `<rm-header>`

One header for every site: the logo, **RC MISFITS** and the site name, **Forum · Meetings · Tracks · Timing** with the current site highlighted, and the username with Sign out, or Sign in. It is a framework-free custom element, so React, plain HTML and Discourse all use it the same way.

```ts
import "@rcmisfits/brand/fonts.css";
import "@rcmisfits/brand/tokens.css";
import "@rcmisfits/brand/header.css";
import "@rcmisfits/brand/header.js"; // defines <rm-header>
```

```html
<rm-header site="tracks" user="Yeti"></rm-header>
```

| Attribute | Meaning |
|---|---|
| `site` | `forum`, `tracks` or `timing`: the current site. It is highlighted (`aria-current="page"`) and named after RC MISFITS. Anything else highlights nothing. |
| `user` | The signed-in username. Empty or missing means signed out. |
| `sign-in-url` | Where Sign in goes. With no URL, it is a button that only sends the event below. |
| `sign-out-url` | Where Sign out goes. **Only for a URL that is safe to GET.** A plain link must not be what signs a member out: if your sign-out is a POST or a function call, leave this off and handle `rm-sign-out` (below). With no URL, Sign out is a button that only sends the event. |
| `forum-url`, `meetings-url`, `tracks-url`, `timing-url` | The four links. Default: the live sites (`https://forum.rcmisfits.org/`, `https://forum.rcmisfits.org/events`, `https://tracks.rcmisfits.org/`, `https://timing.rcmisfits.org/`). Set them for development. |

- **Theme:** it follows the page's (or a parent's) `data-theme`. It has no colours of its own.
- **Phones (under 640 px):** the links and the account fold into a menu button. Escape, a click outside, or choosing a link closes it.
- **TypeScript:** `header.d.ts` types `document.querySelector("rm-header")` as `RmHeader`.
- **Sign in and Sign out** send a bubbling, cancelable `rm-sign-in` / `rm-sign-out` event first. Call `preventDefault()` on it to handle signing in or out yourself.
- **Sign out by the event, not by a link.** Signing out changes state, so it should be a POST (or the app's own logout call), never a GET that another site could trigger. Leave `sign-out-url` off and listen for `rm-sign-out`, as the examples below do.
- **URLs** must be `http(s)://`, `//`, or start with `/`, `./`, `../`, `?` or `#`. Anything else (such as `javascript:` or a bare `auth/login`) falls back to the default link, or to a button for Sign in and Sign out.
- The logo is inlined in `header.js`, so there is no image URL to set up.
- Changing an attribute re-renders the header (and closes the menu).
- `renderHeader(options)` (from `header.js`) returns the same markup as a string, for server rendering. The menu button needs the script to work.

**Track Studio (React):**

```tsx
const header = useRef<HTMLElement>(null);

useEffect(() => {
  const element = header.current;
  if (!element) return;
  const onSignOut = (event: Event) => {
    event.preventDefault();
    void logout(); // Track Studio's existing logout() call (a POST)
  };
  element.addEventListener("rm-sign-out", onSignOut);
  return () => element.removeEventListener("rm-sign-out", onSignOut);
}, []);

<rm-header ref={header} site="tracks" user={me?.username ?? ""} sign-in-url="/auth/login" />;
```

React 19 passes these through as attributes. With TypeScript, declare `rm-header` in `JSX.IntrinsicElements`. There is no `sign-out-url`: Sign out is a button, and the listener signs out with the app's own call.

**The timing site:** `<rm-header site="timing" ...>` in the page shell, with the user from the shared forum sign-in, and no `sign-out-url`. Sign out submits the site's existing sign-out form, so it stays a POST:

```html
<rm-header site="timing" user="Yeti"></rm-header>
<form id="sign-out" method="post" action="…" hidden>…</form>
<script type="module">
  document.querySelector("rm-header").addEventListener("rm-sign-out", (event) => {
    event.preventDefault();
    document.getElementById("sign-out").requestSubmit();
  });
</script>
```

The form is the one the timing site already has (its action and CSRF field stay as they are). The box's local screens do not use the forum links, so they do not use this header.

**The forum (Discourse):** the theme component in `discourse/` includes `header.css` in its stylesheet, bundles `header.js` with its initializer, and renders `<rm-header site="forum" user="…">` in the `above-site-header` outlet. It handles `rm-sign-in` and `rm-sign-out` with Discourse's own login and logout. See [`docs/discourse-install.md`](docs/discourse-install.md).

`pnpm preview` also writes `preview/header.html` (choose a theme with `?theme=synthwave`).

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

Five colours differ from the design canvas. The Board made them darker (14 Nov 2026) so that each reaches 4.5:1 on its background:

| Theme | Key | Canvas | Now |
|---|---|---|---|
| `pit-lane-light` | `accent` | `#B07A00` | `#946700` |
| `pit-lane-light` | `pb` | `#1F8A55` | `#1C7E4D` |
| `synthwave-light` | `pb` | `#13865A` | `#127F55` |
| `ice` | `accent` | `#0277BD` | `#0275BA` |
| `ice` | `pb` | `#158A55` | `#148150` |

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

**Always label a personal best and a fastest lap (PB / FL). Never rely on colour alone.** In several themes `pb` and `fast` differ by hue only, not by lightness, so the colour by itself does not tell them apart for everyone.

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
- With no chromatic colour (no colours, or all white, black and silver), the result is Pit Lane (or Pit Lane light). Like all generator output it is held to the contrast rules, so a Pit Lane value that misses them comes out a little lighter or darker than in the built-in theme.
- The same colour given twice counts once.
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
| `pnpm build` | Writes `dist/` and `discourse/` from `tokens.json` and `src/`. |
| `pnpm preview` | Writes `preview/index.html` (every theme's swatches, a top bar, a practice table and buttons) and `preview/header.html` (`<rm-header>` per site). Serve the repo folder over HTTP to view it (`npx serve .`, then open `/preview/`), so the fonts load. |
| `pnpm check:dist` | Builds, then fails if the committed `dist/` or `discourse/` was out of date. |

- **`tokens.json` is the single source.** Change it, then run `pnpm build` and commit `dist/` with it. A test fails if `dist/tokens.css` or the Discourse schemes do not match `tokens.json`.
- **Changing any colour is a Board decision.**
- Releases are semantic-version tags (`v0.1.0`). The Board tags them.
