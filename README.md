# Catholic Leaders in Action

Production landing page for Catholic Leaders in Action, built with Next.js,
TypeScript, Tailwind CSS, and GSAP.

## Local development

```bash
npm install
npm run dev
```

Run the complete verification suite with:

```bash
npm run verify
```

## Events

The single source of truth is `src/data/events.ts`. Add only confirmed event
details, keep unapproved events as `draft`, and use ISO 8601 datetimes with the
`America/Los_Angeles` timezone. Upcoming and past states are calculated from
the current time.

## Deployment

Pushes to `main` are verified, statically exported, and deployed through the
GitHub Pages workflow in `.github/workflows/pages.yml`. The workflow also
rebuilds hourly so timestamp-derived upcoming and past event states stay
current on static hosting.
