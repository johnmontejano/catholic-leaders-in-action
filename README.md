# Catholic Leaders in Action

A cinematic, responsive homepage for Catholic Leaders in Action, a community formed in partnership with the Archdiocese of San Francisco for Catholic young professionals ages 21 to 40.

## Local development

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run build
npm run test:smoke
npm run lint:design
```

The `DESIGN.md` file records the visual system, typography, palette, spacing, components, and motion direction used by the site.

## Deployment

Every push to `main` builds the Vite app and deploys the `dist` output to GitHub Pages. The custom domain is preserved through `public/CNAME`.
