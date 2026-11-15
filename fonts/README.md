# Fonts

| File | Face | Weights | Subset |
|---|---|---|---|
| `oswald-latin-wght-normal.woff2` | Oswald (headings) | 200 to 700, variable | latin |
| `oswald-latin-ext-wght-normal.woff2` | Oswald | 200 to 700, variable | latin-ext |
| `inter-latin-wght-normal.woff2` | Inter (body text and figures) | 100 to 900, variable | latin |
| `inter-latin-ext-wght-normal.woff2` | Inter | 100 to 900, variable | latin-ext |

- `fonts.css` holds the `@font-face` rules. The families are named `Oswald` and `Inter`.
- The files are unmodified copies from `@fontsource-variable/oswald` 5.3.0 and `@fontsource-variable/inter` 5.3.0 (the Google Fonts builds).
- Both faces are under the SIL Open Font License 1.1: `OFL-Oswald.txt` and `OFL-Inter.txt`. Keep the licence files with the fonts wherever they are copied.
- Inter's tabular figures (`font-variant-numeric: tabular-nums`) are in these files; use them for every timing number.
