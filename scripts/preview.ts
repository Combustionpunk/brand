/** `pnpm preview`: writes preview/index.html. Run `pnpm build` first: the page loads dist/tokens.css. */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderPreview } from "./preview-html.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
if (!existsSync(join(root, "dist/tokens.css"))) {
  console.error("dist/tokens.css is missing: run `pnpm build` first.");
  process.exit(1);
}
mkdirSync(join(root, "preview"), { recursive: true });
writeFileSync(join(root, "preview/index.html"), renderPreview());
console.log("Wrote preview/index.html");
