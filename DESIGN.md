# Design System

## Direction

**Sacred civic documentary.** A young professional checks the site on a phone after an evening parish-hall gathering: cool San Francisco dusk outside, warm conversation inside, tailored jackets beside everyday clothes, and serious faith expressed through ordinary human presence.

The page is a long-form, photo-led invitation with event utility placed before narrative. Its aesthetic risk is a committed civic blue-teal field paired with real documentary frames and a single pinned sequence that makes the gathering visibly move from learning to prayer to outward action.

## Color

Use a committed strategy: saturated civic blue-teal carries roughly 35% of the experience, true white provides clarity, near-black blue ink provides authority, and a restrained ember accent marks action. The user-supplied hue direction overrides the palette generator’s generic seed.

```css
:root {
  --cla-bg: oklch(1 0 0);
  --cla-surface: oklch(0.965 0.012 210);
  --cla-ink: oklch(0.18 0.03 230);
  --cla-muted: oklch(0.42 0.032 220);
  --cla-primary: oklch(0.42 0.12 205);
  --cla-primary-deep: oklch(0.31 0.09 215);
  --cla-primary-bright: oklch(0.65 0.10 200);
  --cla-action: oklch(0.48 0.16 28);
  --cla-line: oklch(0.86 0.015 210);
}
```

White text is mandatory on saturated primary and action fills. Muted text is for supporting copy only and must retain at least 4.5:1 contrast; ordinary prose aims for 7:1. No gradients.

## Typography

- **STIX Two Text**: selected display headings, the mission statement, and attributed quotation. Use optical weight and measure to create institutional gravity without turning the page into a newspaper.
- **Atkinson Hyperlegible Next**: body, navigation, controls, dates, event logistics, labels, and captions.
- Maximum display size: `clamp(3rem, 7vw, 6rem)`.
- Display tracking never tighter than `-0.04em`; body tracking remains default.
- Headings use balanced wrapping. Prose uses pretty wrapping and a 65–72 character measure.
- Event dates and logistics use tabular numerals.

## Layout

Mobile begins as a direct invitation: compact navigation, full-height but content-safe hero, event state, mission, static story chapters, events, community proof, join/support, footer.

Desktop uses a disciplined twelve-column grid with asymmetric photo placement and strong full-width color fields. The event module is an editorial band, not a floating card. Smaller 600×400 and 400×600 images remain intentionally contained near their intrinsic scale.

```text
MOBILE                         DESKTOP
┌──────────────┐              ┌──────────────────────────────┐
│ nav          │              │ nav                  events  │
│              │              ├───────────────┬──────────────┤
│ mission      │              │ mission       │ hero photo   │
│ actions      │              │ + actions     │ focal crop   │
│ hero photo   │              └───────────────┴──────────────┘
├──────────────┤              ┌──────────────────────────────┐
│ event state  │              │ event state / announcement   │
├──────────────┤              └──────────────────────────────┘
│ formation    │              ┌────────────┬─────────────────┐
│ prayer       │              │ chapter    │ pinned frame    │
│ action       │              │ progression│                 │
└──────────────┘              └────────────┴─────────────────┘
```

## Signature Interaction

**The gathering becomes action.** On capable desktop viewports, one stage pins for approximately 240vh. Formation, Prayer, and Action advance one at a time while authentic photographs crossfade and settle with only transform and opacity. The stage reads like documentary frames coming into focus, not a carousel. Mobile, short viewports, reduced-motion, and no-JavaScript render the same content as a complete static vertical sequence.

The hero has one restrained load sequence under 1.2 seconds: navigation and copy rise 20–28px, the image settles from approximately 1.035 scale, and one solid primary reveal panel moves away. No entrance effect may hide default HTML content.

## Components

- **Site header:** native links, calm persistent “See events” CTA, accessible mobile disclosure using an established primitive.
- **Hero:** split editorial composition, documentary hero photograph, mission statement, two actions, Formation · Prayer · Action signature.
- **Event band:** data-driven next-event or purposeful empty state; scannable logistics and a single dominant next action.
- **Story stage:** three ordered chapters with restrained sequence markers because order carries meaning.
- **Event archive:** upcoming and past sections computed from timestamps; no manually stale labels.
- **Community proof:** disciplined asymmetric photo composition, Archdiocese source link, one accurate quotation.
- **Join/support field:** joining visually precedes giving; links explain exactly what the visitor receives.
- **Footer:** verified destinations only; no fabricated email, address, legal status, or privacy copy.

## Media

Use only the six supplied gathering photographs as primary imagery. Preserve faces, natural skin tones, and documentary character. The hero uses `community-reception-wide.png` with breakpoint-specific focal positions; all other files remain editorial frames rather than desktop backgrounds. `next/image` supplies AVIF/WebP negotiation, intrinsic dimensions, responsive sizes, and lazy loading below the fold.

## Responsive and Interaction Rules

- Design and inspect at 320, 375, 430, 768, 1024, 1440, and wide desktop sizes.
- Pinned motion requires both adequate width and height; never pin on small or short viewports.
- Use `min-height: 100dvh`, safe-area padding for fixed/sticky surfaces, and no horizontal scroll.
- Hover and focus feedback lasts 120–180ms and never carries essential information.
- Focus is clearly visible on every interactive element.
- Image focal points change by breakpoint rather than cropping through faces.

## Anti-pattern Check

No cream or parchment surfaces, gold-on-navy palette, decorative church motifs, generic cathedral imagery, faux paper texture, glass effects, gradient text, glowing buttons, giant rounded sections, soft ghost cards, repetitive icon grids, decorative numbers, repeated uppercase eyebrows, custom cursor, autoplay media, scroll hijacking, horizontal mobile scroll, or motion on every heading.
