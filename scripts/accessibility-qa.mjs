import axe from "axe-core";
import { chromium } from "playwright-core";

const executablePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.CLA_QA_URL ?? "http://127.0.0.1:3000";

const browser = await chromium.launch({
  executablePath,
  headless: true,
});

const viewports = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "desktop-1440", width: 1440, height: 1000 },
];

const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.addScriptTag({ content: axe.source });
  const audit = await page.evaluate(async () => {
    return window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
      },
      resultTypes: ["violations"],
    });
  });

  results.push({
    viewport,
    violations: audit.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  });
  await page.close();
}

await browser.close();

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);

if (results.some((result) => result.violations.length > 0)) {
  process.exitCode = 1;
}
