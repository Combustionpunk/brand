/** The header's visual check page: <rm-header> as each site shows it, signed in and out, in one theme. */
import { themeIds } from "../src/tokens.ts";

/**
 * preview/header.html. The theme comes from `?theme=<id>` (default: none, so Pit Lane),
 * and the page loads the built dist/header.js and dist/header.css, as an app would.
 */
export function renderHeaderPreview(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>RC Misfits header preview</title>
  <link rel="stylesheet" href="../fonts/fonts.css" />
  <link rel="stylesheet" href="../dist/tokens.css" />
  <link rel="stylesheet" href="../dist/header.css" />
  <script>
    const theme = new URLSearchParams(location.search).get("theme");
    if (${JSON.stringify(themeIds)}.includes(theme)) document.documentElement.dataset.theme = theme;
  </script>
  <script type="module" src="../dist/header.js"></script>
  <style>
    body { margin: 0; background: var(--rm-bg); color: var(--rm-text); font: var(--rm-type-body); }
    p { margin: 0; padding: var(--rm-space-2) var(--rm-space-4); color: var(--rm-muted); font: var(--rm-type-body-sm); }
    rm-header { margin-bottom: var(--rm-space-6); }
  </style>
</head>
<body>
  <p>Track Studio, signed in</p>
  <rm-header site="tracks" user="Yeti" sign-out-url="#"></rm-header>
  <p>Timing, signed out</p>
  <rm-header site="timing" sign-in-url="#"></rm-header>
  <p>The forum, signed in</p>
  <rm-header site="forum" user="Marshal" sign-out-url="#"></rm-header>
</body>
</html>
`;
}
