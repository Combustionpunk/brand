/**
 * `pnpm build`: writes everything in dist/ from tokens.json and src/.
 *
 *   dist/tokens.css            CSS custom properties, one block per theme
 *   dist/index.js, *.d.ts      the tokens, generateTheme and themeToCss
 *   dist/discourse/<id>.json   a Discourse colour scheme per theme
 *   dist/logo/*.png            the logo at 512 and 1024 pixels wide
 *
 * dist/ is committed, so an app can install the package from a git tag without building it.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import sharp from "sharp";
import { renderTokensCss } from "../src/css.ts";
import { toDiscourseScheme } from "../src/discourse.ts";
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

// 4. Type declarations. tsc lays them out under src/, so they go through a temporary folder.
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
} finally {
  rmSync(types, { recursive: true, force: true });
}

// 5. Smaller PNGs of the logo, for web pages. The master files are never changed.
for (const width of LOGO_WIDTHS) {
  await sharp(join(root, "assets/logo/rc-misfits-logo.png"))
    .resize({ width })
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(dist, "logo", `rc-misfits-logo-${width}.png`));
}

console.log(`Built dist/: tokens.css, index.js, ${Object.keys(tokens.themes).length} Discourse schemes, logo PNGs.`);
