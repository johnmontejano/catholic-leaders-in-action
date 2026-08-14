import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const executablePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.CLA_QA_URL ?? "http://127.0.0.1:3000";
const outputDir = "/tmp/cla-visual-qa";

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

const viewports = [
  { name: "mobile-320", width: 320, height: 760 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "mobile-430", width: 430, height: 880 },
  { name: "zoom-200-1280", width: 640, height: 800 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1440", width: 1440, height: 1000 },
  { name: "wide-1920", width: 1920, height: 1080 },
];

const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const issues = [];
  page.on("console", (message) => {
    if (message.type() === "error") issues.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => issues.push(`pageerror: ${error.message}`));
  page.on("requestfailed", (request) =>
    issues.push(`requestfailed: ${request.url()} — ${request.failure()?.errorText}`),
  );

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.screenshot({
    path: `${outputDir}/${viewport.name}-top.png`,
    fullPage: false,
  });

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    h1: document.querySelector("h1")?.textContent?.trim(),
    landmarks: {
      header: document.querySelectorAll("header").length,
      main: document.querySelectorAll("main").length,
      footer: document.querySelectorAll("footer").length,
      nav: document.querySelectorAll("nav").length,
    },
    images: Array.from(document.querySelectorAll("img")).map((image) => ({
      alt: image.alt,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
    })),
  }));

  await page.keyboard.press("Tab");
  const firstFocus = await page.evaluate(() => ({
    text: document.activeElement?.textContent?.trim(),
    tag: document.activeElement?.tagName,
  }));
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  if (viewport.width >= 1024 && viewport.height >= 700) {
    await page.locator(".story-stage").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: `${outputDir}/${viewport.name}-story.png`,
      fullPage: false,
    });
  }

  if (viewport.name === "mobile-375") {
    await page.locator(".story-stage").scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await page.screenshot({
      path: `${outputDir}/${viewport.name}-story.png`,
      fullPage: false,
    });
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.screenshot({
      path: `${outputDir}/${viewport.name}-full.png`,
      fullPage: true,
    });
  }

  results.push({ viewport, layout, firstFocus, issues });
  await page.close();
}

const reducedPage = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
await reducedPage.goto(baseUrl, { waitUntil: "networkidle" });
await reducedPage.locator(".story-stage").scrollIntoViewIfNeeded();
await reducedPage.screenshot({
  path: `${outputDir}/reduced-motion-story.png`,
  fullPage: false,
});
const reducedMotion = await reducedPage.evaluate(() => ({
  pinSpacers: document.querySelectorAll(".pin-spacer").length,
  chapters: Array.from(document.querySelectorAll(".story-chapter")).map(
    (chapter) => ({
      text: chapter.textContent?.trim().slice(0, 80),
      opacity: getComputedStyle(chapter).opacity,
      position: getComputedStyle(chapter).position,
    }),
  ),
}));
await reducedPage.evaluate(async () => {
  for (let y = 0; y <= document.body.scrollHeight; y += 900) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
  window.scrollTo(0, 0);
});
await reducedPage.screenshot({
  path: `${outputDir}/reduced-motion-full.png`,
  fullPage: true,
});
await reducedPage.close();

const noJsContext = await browser.newContext({
  javaScriptEnabled: false,
  viewport: { width: 1280, height: 800 },
});
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(baseUrl, { waitUntil: "load" });
await noJsPage.screenshot({
  path: `${outputDir}/no-javascript-top.png`,
  fullPage: false,
});
const noJavaScript = await noJsPage.evaluate(() => ({
  heroVisible: Boolean(document.querySelector("h1")),
  eventText: document.querySelector("#events")?.textContent?.includes("announced soon"),
  storyChapters: document.querySelectorAll(".story-chapter").length,
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
}));
await noJsContext.close();

await browser.close();

process.stdout.write(
  `${JSON.stringify(
    {
      outputDir,
      results,
      reducedMotion,
      noJavaScript,
    },
    null,
    2,
  )}\n`,
);
