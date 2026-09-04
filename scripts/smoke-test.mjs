import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const required = [
  "dist/index.html",
  "dist/assets/video/sf-hero.mp4",
  "dist/assets/video/sf-hero-poster.jpg",
  "dist/assets/img/nave-2400.jpg",
  "dist/assets/img/after-talk-2160.jpg",
  "dist/assets/feed/Db3x4v6hxow-640.jpg",
  "dist/assets/brand/seal-192.webp",
  "dist/assets/fonts/Satoshi-400.woff2",
  "dist/assets/fonts/Newsreader-italic.woff2",
];

await Promise.all(required.map((path) => access(resolve(projectRoot, path))));

const html = await readFile(resolve(projectRoot, "dist/index.html"), "utf8");
const modulePath = html.match(/src="(\.\/assets\/[^"]+\.js)"/)?.[1];
const stylesheetPath = html.match(/href="(\.\/assets\/[^"]+\.css)"/)?.[1];

if (!modulePath || !stylesheetPath) {
  throw new Error("Production HTML is missing its JavaScript or stylesheet entry.");
}

await Promise.all(
  [modulePath, stylesheetPath].map((path) =>
    access(resolve(projectRoot, "dist", path)),
  ),
);

console.log(`Smoke test passed: ${required.length + 2} production assets verified.`);
