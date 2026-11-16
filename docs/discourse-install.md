# The forum's theme component: install, update, defaults, roll back

The RC Misfits look on the forum (Discourse) is a **theme component** built from this repo. `pnpm build` writes it into [`discourse/`](../discourse/). Never edit that folder by hand.

## What it does

- **Colour schemes:** every theme in `tokens.json` becomes a Discourse colour scheme, named `RC Misfits: <theme>`. Pit Lane comes first and Pit Lane light second.
- **The shared top bar:** `<rm-header site="forum">` sits above Discourse's own header, which keeps search, the sidebar, notifications and the user menu. Discourse's own logo is hidden, because the top bar carries it.
  - Sign in opens Discourse's login, and Sign out uses Discourse's own logout (a DELETE of the session). Neither is a GET link.
  - **Forum** goes to `/` and **Meetings** goes to `/events` on the forum the member is on. **Tracks** and **Timing** go to the live sites unless the component's settings `tracks_url` and `timing_url` say otherwise. Set those on the dev forum.
- **The header follows the member's scheme.** The component reads Discourse's live colours. If they are exactly a brand theme, it sets `data-rm-theme="<id>"` on `<html>`, so every `--rm-*` token is that theme's. For a scheme that is not a brand theme (one an admin made or edited), the `--rm-*` colours fall back to Discourse's own colour variables.
  - The forum uses `data-rm-theme`, not `data-theme`, to keep clear of Discourse's own `data-theme-id` and of other components that may set `data-theme`.
- **Fonts:** Oswald (headings) and Inter (body) are uploaded with the component as theme assets, so nothing loads from Google. Discourse's `--font-family` and `--heading-font-family` point at them.
- **Figures:** counts, dates, badges, tables in posts and `.rm-figures` use tabular figures.

## Where Discourse installs it from

**Discourse cannot install a theme from a subfolder.** "Install › From a git repository" takes a URL and a branch (or a private key), and reads `about.json` from the repository's root. You can check this in `ThemeStore::GitImporter` and `RemoteTheme.import_theme` in discourse/discourse. So `discourse/` in this repo cannot be installed directly.

**The Board must choose one of these:**

1. **A branch in this repo** (recommended): `discourse-theme`, whose root is the `discourse/` folder. There is no second repo to look after. The Board publishes it after merging, for each release tag:

   ```sh
   git checkout main && git pull
   git subtree split --prefix discourse -b discourse-theme-new
   git push origin discourse-theme-new:discourse-theme   # add --force only if the history was rewritten
   git tag discourse-v0.3.0 discourse-theme-new && git push origin discourse-v0.3.0
   git branch -D discourse-theme-new
   ```

   `git subtree split` gives the same commits each time for the same history, so a normal push fast-forwards. The `discourse-vX.Y.Z` tags are for rolling back (below). A CI job on each `v*` tag could do this later; for now it is manual, because agents never push anything but PR branches.
2. **A separate public repo** (for example `Combustionpunk/rcmisfits-discourse`) holding a copy of `discourse/`, updated the same way. This is how most Discourse components are published, but it is a second repo to keep in step.
3. **Upload** (no git): zip the folder (`cd discourse && zip -r ../rcmisfits-discourse.zip .`) and use **Install › From your device**. It works today, with no Board decision, but the forum cannot pull updates; every update is a new upload.

The steps below assume option 1. For option 2, use that repo's URL and leave the branch empty.

## Install (dev forum first, never straight on live)

1. **Admin › Appearance › Themes and components › Install › From a git repository.**
   - URL: `https://github.com/Combustionpunk/brand`
   - Branch: `discourse-theme`
   - It is public, so no private key is needed.
2. Discourse lists it as a **component** named **RC Misfits**. Add it to the site's theme: open the theme (Foundation, Horizon or whichever the forum uses) and add **RC Misfits** under **Included components**.
3. On the dev forum, set the component's settings `tracks_url` and `timing_url` to the dev sites.

## Set the defaults

On the forum's theme (not the component):

| Theme setting | Choose | Why |
|---|---|---|
| **Color palette** (light) | `RC Misfits: Pit Lane light` | A device that asks for light. |
| **Dark color palette** | `RC Misfits: Pit Lane` | A device that asks for dark. |

This is the brand's own rule (README, "Choose the theme"): Pit Lane, or Pit Lane light when the device asks for light. Every browser reports light or dark, so the forum then matches Track Studio and the timing site.

- **To make everyone see Pit Lane, whatever the device asks:** choose `RC Misfits: Pit Lane` for both. That is a Board decision.
- On older Discourse versions the dark palette is the site setting **default dark mode color scheme** instead.

### Let members choose (Preferences › Interface)

Discourse does not let `about.json` mark a scheme as selectable, so an admin does this once per scheme:

1. **Admin › Appearance › Color palettes**, open each `RC Misfits: …` palette.
2. Tick **Users can select** (the label may be "Show on user preferences" or similar, depending on the version).

Members then pick a light and a dark scheme under **Preferences › Interface**. The top bar follows whichever is showing.

## Update

- **Admin › Appearance › Themes and components › RC Misfits › Check for updates**, then **Update to latest**. Discourse pulls the `discourse-theme` branch again.
- Colour schemes from the component are updated in place. A scheme that is no longer in `about.json` is deleted.
- If an admin edited a scheme's colours on the forum, an update overwrites them. Colours are changed in `tokens.json`, by the Board, never on the forum.

## Roll back

- **Fast, no git:** remove **RC Misfits** from the theme's included components (or disable it). The forum is back to Discourse's own header and fonts at once. Set the theme's palettes back to what they were (note them before installing).
- **To an earlier version:** Discourse keeps no history of a component. Delete **RC Misfits**, then install it again with the branch set to an earlier tag, for example `discourse-v0.2.0`. (`git clone --branch` takes a tag as well as a branch.) It stays on that tag until it is reinstalled from `discourse-theme`.
- Deleting the component also deletes its colour schemes. Members who chose one go back to the theme's default palette.

## Test on the dev forum (discourse-dev, CT 101)

Before live, on the dev forum:

1. Install, add to the theme, and set the defaults as above.
2. Signed out: the top bar shows **Sign in**, the forum is Pit Lane (or Pit Lane light on a light device), and the headings are Oswald.
3. Sign in: the top bar shows the username. Search, notifications and the user menu still work.
4. In Preferences › Interface, choose Synthwave: the forum and the top bar both turn Synthwave.
5. Sign out from the top bar: you are signed out (Discourse's own logout).
6. On a phone width (< 640 px), the top bar's menu opens and closes.
7. Screenshot each step in the PR.
