/**
 * `pnpm build`: writes everything in dist/ from tokens.json and src/.
 *
 *   dist/tokens.css            CSS custom properties, one block per theme
 *   dist/index.js, *.d.ts      the tokens, generateTheme and themeToCss
 *   dist/discourse/<id>.json   a Discourse colour scheme per theme
 *   dist/logo/*.png            the logo at 512 and 1024 pixels wide
 *   dist/header.js, .css, .d.ts the shared top bar, <rm-header>, with the logo inlined
 *   discourse/                 the forum's Discourse theme (docs/discourse-install.md)
 *
 * dist/ is committed, so an app can install the package from a git tag without building it.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build, type Plugin } from "esbuild";
import sharp from "sharp";
import { renderTokensCss } from "../src/css.ts";
import { toDiscourseScheme } from "../src/discourse.ts";
import { fontAssets, renderAboutJson, renderThemeScss } from "../src/discourse-theme.ts";
import { tokens } from "../src/tokens.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const LOGO_WIDTHS = [512, 1024];

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, "discourse"), { recursive: true });
mkdirSync(join(dist, "logo"), { recursive: true });

// 1. tokens.css
writeFileSync(join(dist, "tokens.css"), renderTokensCss(tokens));

// 2. A Discourse colour scheme per theme.
for (const [id, theme] of Object.entries(tokens.themes)) {
  writeFileSync(join(dist, "discourse", `${id}.json`), JSON.stringify(toDiscourseScheme(id, theme), null, 2) + "\n");
}

// 3. index.js: one ES module with tokens.json inlined.
await build({
  entryPoints: [join(root, "src/index.ts")],
  outfile: join(dist, "index.js"),
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "neutral",
  legalComments: "none",
});

// 4. header.js: <rm-header>, one ES module with the logo SVG inlined, and its stylesheet.
const raw: Plugin = {
  name: "raw",
  setup(plugin) {
    plugin.onResolve({ filter: /\?raw$/ }, (args) => ({
      path: resolve(args.resolveDir, args.path.slice(0, -"?raw".length)),
      namespace: "raw",
    }));
    plugin.onLoad({ filter: /.*/, namespace: "raw" }, (args) => ({ contents: readFileSync(args.path, "utf8"), loader: "text" }));
  },
};
await build({
  entryPoints: [join(root, "src/header/header.ts")],
  outfile: join(dist, "header.js"),
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  legalComments: "none",
  plugins: [raw],
});
copyFileSync(join(root, "src/header/header.css"), join(dist, "header.css"));

// 5. Type declarations. tsc lays them out under src/, so they go through a temporary folder.
const types = mkdtempSync(join(tmpdir(), "rm-brand-types-"));
try {
  execFileSync(
    join(root, "node_modules/.bin/tsc"),
    ["-p", join(root, "tsconfig.build.json"), "--outDir", types],
    { cwd: root, stdio: "inherit" },
  );
  for (const file of readdirSync(join(types, "src"))) {
    if (file.endsWith(".d.ts")) {
      // Declarations keep the source's "./x.ts" imports; consumers need "./x.js".
      const source = readFileSync(join(types, "src", file), "utf8");
      writeFileSync(join(dist, file), source.replace(/(["'])(\.\.?\/[^"']+)\.ts\1/g, "$1$2.js$1"));
    }
  }
  // The header's declarations sit one folder down in src/, but next to index.d.ts in dist/.
  const header = readFileSync(join(types, "src/header/header.d.ts"), "utf8");
  // tsc drops the source's DOM lib reference, which the declarations need.
  writeFileSync(join(dist, "header.d.ts"), '/// <reference lib="dom" />\n' + header.replace(/(["'])\.\.\/([^"']+)\.ts\1/g, "$1./$2.js$1"));
} finally {
  rmSync(types, { recursive: true, force: true });
}

// 6. Smaller PNGs of the logo, for web pages. The master files are never changed.
for (const width of LOGO_WIDTHS) {
  await sharp(join(root, "assets/logo/rc-misfits-logo.png"))
    .resize({ width })
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(dist, "logo", `rc-misfits-logo-${width}.png`));
}

// 7. The forum's Discourse theme, in discourse/.
const forumTheme = join(root, "discourse");
rmSync(forumTheme, { recursive: true, force: true });
for (const folder of ["assets", "common", "javascripts/discourse/lib", "javascripts/discourse/api-initializers"]) {
  mkdirSync(join(forumTheme, folder), { recursive: true });
}
const fontsCss = readFileSync(join(root, "fonts/fonts.css"), "utf8");
writeFileSync(join(forumTheme, "about.json"), JSON.stringify(renderAboutJson(tokens, fontsCss), null, 2) + "\n");
writeFileSync(
  join(forumTheme, "common/common.scss"),
  renderThemeScss(tokens, fontsCss, readFileSync(join(root, "src/header/header.css"), "utf8")),
);
for (const file of [...fontAssets(fontsCss).map((asset) => asset.file), "OFL-Oswald.txt", "OFL-Inter.txt"]) {
  copyFileSync(join(root, "fonts", file), join(forumTheme, "assets", file));
}
copyFileSync(join(root, "src/discourse-theme/settings.yml"), join(forumTheme, "settings.yml"));
copyFileSync(
  join(root, "src/discourse-theme/rm-brand.gjs"),
  join(forumTheme, "javascripts/discourse/api-initializers/rm-brand.gjs"),
);
await build({
  entryPoints: [join(root, "src/discourse-theme/forum.ts")],
  outfile: join(forumTheme, "javascripts/discourse/lib/rm-brand.js"),
  bundle: true,
  format: "esm",
  target: "es2022",
  platform: "browser",
  legalComments: "none",
  banner: { js: "// Generated by `pnpm build` in Combustionpunk/brand from src/discourse-theme/forum.ts: do not edit here." },
  plugins: [raw],
});
writeFileSync(
  join(forumTheme, "README.md"),
  "# RC Misfits: Discourse theme\n\nGenerated by `pnpm build` from this repo: do not edit here. Install, update and roll back: [docs/discourse-install.md](../docs/discourse-install.md).\n",
);

console.log(`Built dist/: tokens.css, index.js, ${Object.keys(tokens.themes).length} Discourse schemes, logo PNGs, header.js and header.css, and discourse/.`);
