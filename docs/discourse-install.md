# The forum's theme: install, update, defaults, roll back

The RC Misfits look on the forum (Discourse) is a **Discourse theme** built from this repo. `pnpm build` writes it into [`discourse/`](../discourse/). Never edit that folder by hand.

**A full theme, not a component.** Issue #3 asked for a theme component. But Discourse imports `color_schemes` only from a full theme: `RemoteTheme#update_theme` runs `update_theme_color_schemes(...) unless theme.component`. A component would install with no colour schemes at all. So `about.json` has `"component": false`, and the forum uses **RC Misfits** as its site theme (built on Discourse's core styles), in place of Foundation or Horizon.

## What it does

- **Colour schemes:** every theme in `tokens.json` becomes a Discourse colour palette, named `RC Misfits: <theme>`. Pit Lane comes first and Pit Lane light second.
- **The modifier `only_theme_color_schemes`** does two things:
  - Preferences › Interface **offers** members exactly these palettes, all of them;
  - on a new install, Discourse makes the first dark palette (Pit Lane) the dark default and the first light one (Pit Lane light) the light default.
  - It needs a Discourse from 2026 (the modifier came in March 2026). An older Discourse ignores it: then set the defaults by hand (below).
- **The modifier does not make a member's choice stick.** Discourse applies a member's saved palette only if that palette is **User selectable** (`user_selectable`), and importing a theme leaves that off on every palette. Until it is on, a member can pick and preview a palette, but after **Save Changes** and a reload the forum goes back to the default. So every install needs the step in [Make the palettes user-selectable](#make-the-palettes-user-selectable-after-every-install) (issue #9).
- **The shared top bar:** `<rm-header site="forum">` sits above Discourse's own header, which keeps search, the sidebar, notifications and the user menu. Discourse's own logo is hidden, because the top bar carries it.
  - Sign in opens Discourse's login, and Sign out uses Discourse's own logout (a DELETE of the session). Neither is a GET link.
  - **Forum** goes to `/` and **Meetings** goes to `/events` on the forum the member is on. **Tracks** and **Timing** go to the live sites unless the theme's settings `tracks_url` and `timing_url` say otherwise. Set those on the dev forum.
- **The header follows the member's scheme.** The theme's script reads Discourse's live colours. If they are exactly a brand theme, it sets `data-rm-theme="<id>"` on `<html>`, so every `--rm-*` token is that theme's. For a scheme that is not a brand theme (one an admin made or edited), the `--rm-*` colours fall back to Discourse's own colour variables.
  - The forum uses `data-rm-theme`, not `data-theme`, to keep clear of Discourse's own `data-theme-id` and of other components that may set `data-theme`.
- **Fonts:** Oswald (headings) and Inter (body) are uploaded with the theme as theme assets, so nothing loads from Google. Discourse's `--font-family` and `--heading-font-family` point at them.
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
2. **A separate public repo** (for example `Combustionpunk/rcmisfits-discourse`) holding a copy of `discourse/`, updated the same way. This is how most Discourse themes are published, but it is a second repo to keep in step.
3. **Upload** (no git): zip the folder (`cd discourse && zip -r ../rcmisfits-discourse.zip .`) and use **Install › From your device**. It works today, with no Board decision, but the forum cannot pull updates; every update is a new upload.

The steps below assume option 1. For option 2, use that repo's URL and leave the branch empty.

## Install (dev forum first, never straight on live)

1. **Admin › Appearance › Themes and components › Install › From a git repository.**
   - URL: `https://github.com/Combustionpunk/brand`
   - Branch: `discourse-theme`
   - It is public, so no private key is needed.
2. Discourse lists it as a theme named **RC Misfits**. Before going on, note which theme is the site default now (for rolling back).
3. Open **RC Misfits** and choose **Set as default** (the wording varies by version). Any components the forum uses have to be added to RC Misfits under **Included components**, as they were on the old theme. Check the list on the old theme first.
4. On the dev forum, set the theme's settings `tracks_url` and `timing_url` to the dev sites.
5. **Make the palettes user-selectable** (next section). Without it, members' palette choices don't stick.

### Make the palettes user-selectable (after every install)

Make each of the 17 `RC Misfits: …` palettes user-selectable (the admin calls it **Allow users to select**; the palette's own page has a toggle, **Color palette can be selected by users**). Either route changes the theme's own palette in place. It does not make a copy, so theme updates still reach it.

- **In the admin (17 clicks):** **Admin › Appearance › Color palettes**, then on each `RC Misfits: …` palette the **⋯** menu › **Allow users to select**. (Or open the palette, turn on **Color palette can be selected by users** and press **Save changes**. Change nothing else on that page: editing a theme palette's colours *does* fork it into a copy.)
- **From the Rails console** (`./launcher enter app`, then `rails c`). Preview first; this only reads:

  ```ruby
  Theme.where(name: "RC Misfits", component: false).pluck(:id, :name)   # which theme(s)
  theme = Theme.find_default   # the site default; check it is RC Misfits
  theme.name                   # → "RC Misfits"
  ColorScheme.where(theme_id: theme.id).order(:id).pluck(:id, :name, :user_selectable)
  # → 17 rows, every name starting "RC Misfits: "
  ```

  Then set it, one record at a time so Discourse's own callbacks run:

  ```ruby
  ColorScheme.where(theme_id: theme.id, user_selectable: false).find_each { |cs| cs.update!(user_selectable: true) }
  ApplicationSerializer.expire_cache_fragment!("user_color_schemes")
  ColorScheme.where(theme_id: theme.id).order(:id).pluck(:id, :name, :user_selectable)   # all true
  ```

  If RC Misfits is not the site default yet (or more than one theme is called RC Misfits, as on the dev forum), use `theme = Theme.find(<id>)` with the id from the first line.

**Why the console step is needed** (Discourse core, at [`9de20de`](https://github.com/discourse/discourse/tree/9de20dea352c045d9954574c250d17aa5fcd4c4a)):

- [`ApplicationHelper#user_scheme_id` and `#user_dark_scheme_id`](https://github.com/discourse/discourse/blob/9de20dea352c045d9954574c250d17aa5fcd4c4a/app/helpers/application_helper.rb#L688-L726) use a member's saved palette only if it is `user_selectable: true` (or is the theme's default). Otherwise the page loads the theme's default.
- [`SiteSerializer#user_color_schemes`](https://github.com/discourse/discourse/blob/9de20dea352c045d9954574c250d17aa5fcd4c4a/app/serializers/site_serializer.rb#L100-L116) offers theme-owned palettes when the modifier is on, whatever the flag. That is why the dropdown offers palettes the server then ignores.
- [`RemoteTheme#update_theme_color_schemes`](https://github.com/discourse/discourse/blob/9de20dea352c045d9954574c250d17aa5fcd4c4a/app/models/remote_theme.rb#L549-L620) builds new palettes with the column's default, `false`, and nothing in `about.json` can set it. A theme cannot set the flag itself.
- The member's choice reaches the page as `user_color_scheme_id: user_scheme_id || -1` ([`ApplicationHelper`]({B}/app/helpers/application_helper.rb#L1062-L1063)), which is why an ignored choice shows as a blank dropdown (below).
- [`ColorSchemeRevisor`](https://github.com/discourse/discourse/blob/9de20dea352c045d9954574c250d17aa5fcd4c4a/app/services/color_scheme_revisor.rb) sets `user_selectable` on the same row; only a change of **colours** calls `diverge_from_remote` and makes a copy.
- The member theme picker (plugin #407, `DesMemberTheme.scheme_for`) also looks for `user_selectable: true`, so it needs this step too.

## Set the defaults

On a current Discourse, the install has already done this (see the modifier above). Check it on **RC Misfits**:

| Theme setting | Choose | Why |
|---|---|---|
| **Color palette** (light) | `RC Misfits: Pit Lane light` | A device that asks for light. |
| **Dark color palette** | `RC Misfits: Pit Lane` | A device that asks for dark. |

This is the brand's own rule (README, "Choose the theme"): Pit Lane, or Pit Lane light when the device asks for light. Every browser reports light or dark, so the forum then matches Track Studio and the timing site.

- **To make everyone see Pit Lane, whatever the device asks:** choose `RC Misfits: Pit Lane` for both. That is a Board decision.
- On older Discourse versions the dark palette is the site setting **default dark mode color scheme** instead.

### Let members choose (Preferences › Interface)

On a current Discourse, the modifier offers every `RC Misfits: …` palette, and only those, under **Preferences › Interface**. Members pick a light and a dark palette there, **Save Changes**, and the top bar follows whichever is showing. The choice only sticks once the palettes are user-selectable (above).

**What the closed dropdown shows.** The page is given the member's palette only if the server applied it; otherwise it gets "none" (`-1`). With the modifier on, the list has no "none" entry, so the closed dropdown is **blank** (the names show once it's open). That happens:

- for every member while the palettes are not user-selectable (issue #9: this is the blank label Yeti saw on live), except one whose saved palette is the theme's own default, which the server accepts anyway;
- for a member who has never chosen a palette (Discourse core behaviour: [`listColorSchemes`](https://github.com/discourse/discourse/blob/9de20dea352c045d9954574c250d17aa5fcd4c4a/frontend/discourse/app/lib/color-scheme-picker.js#L39-L56) adds its "default" entry only when the list is *not* limited to the theme; the forum shows the default, and the label fills in once they choose and save);
- for a member who chose a palette before RC Misfits became the default: that palette isn't one of the theme's, so the forum uses the default. If the old palette was itself user-selectable, the dropdown may show its ID number (for example "7") instead. They choose again.

Once the palettes are user-selectable, a member who has chosen and saved one sees its name, in the light and the dark dropdown.

## Update

- **Admin › Appearance › Themes and components › RC Misfits › Check for updates**, then **Update to latest**. Discourse pulls the `discourse-theme` branch again.
- Palettes from the theme are updated in place, **matched by name**, so `user_selectable` and members' choices survive an update: the update only rewrites the colours. (This is read from the core code; step 4 of the dev checklist confirms it.)
- A palette that is no longer in `about.json` is deleted, and a **renamed** palette arrives as a new one with `user_selectable` off. So renaming a theme in `tokens.json` (a test pins the names) means members who chose it lose their choice, and the console step above has to be run again after the update.
- If an admin edits a palette on the forum, Discourse turns it into a separate copy, and updates no longer reach that copy. Don't edit the palettes on the forum: colours are changed in `tokens.json`, by the Board. (An edited palette also stops matching a brand theme, so the top bar falls back to Discourse's colours.)

## Roll back

- **Fast, no git:** make the old theme the default again (**Set as default** on it). The forum is back to its old header, fonts and palettes at once. Members' palette choices are kept, and come back if RC Misfits is made the default again.
- **To an earlier version:** Discourse keeps no history of a theme. Delete **RC Misfits**, then install it again with the branch set to an earlier tag, for example `discourse-v0.3.0`. (`git clone --branch` takes a tag as well as a branch.) It stays on that tag until it is reinstalled from `discourse-theme`.
- Deleting the theme also deletes its palettes, and reinstalling makes new ones. Members who chose a palette go back to the default, and have to choose again. Run [the user-selectable step](#make-the-palettes-user-selectable-after-every-install) again after reinstalling.

## Test on the dev forum (discourse-dev, CT 101)

Before live, on the dev forum:

1. Install, make RC Misfits the default theme, check the defaults as above, and make the palettes user-selectable.
2. Signed out: the top bar shows **Sign in**, the forum is Pit Lane (or Pit Lane light on a light device), and the headings are Oswald.
3. Sign in: the top bar shows the username. Search, notifications and the user menu still work.
4. In Preferences › Interface, choose Synthwave as the light palette and Garage as the dark one, press **Save Changes**, then **reload the page**. The forum and the top bar are still Synthwave (Garage on a dark device), and the closed dropdowns show "RC Misfits: Synthwave" and "RC Misfits: Garage". Picking alone only previews; check after the reload. Then run **Update to latest** and reload again: the choice is still there.
5. In Synthwave and in Pit Lane light, open a dropdown (for example Admin › Users › a user › Trust Level): the row under the pointer and the chosen row are both readable.
6. Sign out from the top bar: you are signed out (Discourse's own logout).
7. On a phone width (< 640 px), the top bar's menu opens and closes.
8. Screenshot each step in the PR.
