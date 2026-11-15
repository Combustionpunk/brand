/** `?raw` imports give a file's text: Vite (Vitest) does this itself, and scripts/build.ts does it for esbuild. */
declare module "*?raw" {
  const text: string;
  export default text;
}
