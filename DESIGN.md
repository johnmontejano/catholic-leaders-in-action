---
version: alpha
name: Catholic Leaders in Action - Sequel-inspired system
description: Reconstructed dark cinematic system for the CLIA homepage, measured from the supplied Sequel and Refero references.
colors:
  primary: "#f5f5f0"
  void-black: "#000000"
  pure-white: "#ffffff"
  charcoal: "#202020"
  graphite: "#333333"
  smoke: "#999999"
  hero-scrim: "rgba(0, 0, 0, 0.55)"
typography:
  label-sm:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0.55px
  body:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-lg:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
  subheading:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: -0.75px
  heading:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 54px
    fontWeight: 300
    lineHeight: 1.2
  heading-lg:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 57px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -2.85px
  display:
    fontFamily: Satoshi, system-ui, sans-serif
    fontSize: 128px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: -3.2px
  display-accent:
    fontFamily: Newsreader, Georgia, serif
    fontSize: 128px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -3.2px
spacing:
  4: 4px
  8: 8px
  12: 12px
  16: 16px
  20: 20px
  24: 24px
  28: 28px
  32: 32px
  40: 40px
  64: 64px
  80: 80px
  96: 96px
  120: 120px
rounded:
  cards: 10px
  full: 9999px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.void-black}"
    rounded: "{rounded.full}"
    height: 45px
    padding: 24px
    typography: "{typography.body}"
  media-card:
    backgroundColor: "{colors.charcoal}"
    rounded: "{rounded.cards}"
    padding: 0px
  glass-badge:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.full}"
    padding: 16px
    typography: "{typography.label-sm}"
  supporting-copy:
    backgroundColor: "{colors.void-black}"
    textColor: "{colors.smoke}"
    typography: "{typography.body}"
  divider:
    backgroundColor: "{colors.graphite}"
    height: 1px
  hero-overlay:
    backgroundColor: "{colors.hero-scrim}"
---

## Overview

This reconstructed system adapts Sequel's observable dark cinematic presentation to Catholic Leaders in Action, a monthly San Francisco community for Catholic young professionals ages 21–40. Real CLIA documentary photography and film carry the experience, while restrained typography and a single warm off-white action color keep the page contemporary, focused, and human.

## Colors

Keep the page canvas at {colors.void-black}. Use {colors.pure-white} for primary copy, {colors.smoke} for supporting copy, {colors.charcoal} for raised surfaces, and {colors.graphite} for quiet dividers. Reserve {colors.primary} for the primary action and selected controls. Use {colors.hero-scrim} only as a readability layer over media.

## Typography

Use Satoshi as the workhorse for navigation, body copy, labels, statistics, and headlines. Narrative headings use weight 300 or 500. Reserve Newsreader Italic for one emotional word inside a display headline, at the same size and color as the surrounding sans text. Use the measured positive tracking only for uppercase labels and the measured negative tracking for large display type.

## Layout

Use a full-bleed black canvas with content centered in a 1200px column. The hero fills at least one dynamic viewport and anchors its headline and actions near the bottom edge over a media scrim. Alternate compact 96–120px transitions with deliberate 180–208px pauses and full-viewport cinematic chapters. Use a 12-column desktop grid with 16–24px gaps inside asymmetric media and bento compositions. Collapse editorial layouts thoughtfully below 768px while preserving swipeable media where it helps discovery.

## Elevation & Depth

Create hierarchy through the single tonal step from {colors.void-black} to {colors.charcoal}. Cards and images do not use drop shadows. The primary cream button may use a soft functional shadow, and glass controls may use one subtle inset top highlight.

## Shapes

All media, bento cells, and card containers use {rounded.cards}. All buttons, badges, and segmented controls use {rounded.full}. Do not introduce a third corner-radius family.

## Components

The persistent navigation uses a monochrome CLIA mark at left, three short anchor links at center, and one cream pill action at right. It begins transparent over the hero and gains a black surface after scroll.

The primary button uses {components.button-primary}. Secondary actions use transparent pill controls with a graphite border and white text. Both include visible focus states and a minimum 44px target.

Media cards use {components.media-card} with full-bleed real photography, a bottom readability scrim, and concise copy anchored inside the lower edge. Frosted labels use {components.glass-badge} only when they communicate category or state.

The social feed behaves like an editorial Stories surface: one dominant reel, two supporting landscape moments, and a quieter six-image grid. Every tile links to the represented Instagram post, uses descriptive accessible text, keeps 10px clipping, and reveals only a restrained interaction cue on hover or focus.

Motion has four authored voices rather than one repeated reveal. Copy uses a 520ms enter curve, headings use a 900ms cinematic mask, media uses a 900ms clip reveal, and the hero settles over 1200ms. Controls use 160–240ms feedback. The layered story chapter reveals each incoming scene over the prior scene, while the membership rail loops slowly on desktop and remains manually scrollable with visible controls. Pause continuous media when the page is hidden. When reduced motion is requested, render the hero poster, replace the sticky story with static cards, and disable the membership loop.

## Do's and Don'ts

- Do use lamp cream exclusively for primary filled actions.
- Do keep warm, slightly desaturated documentary photography full bleed.
- Do use one italic serif payoff word within selected display headlines.
- Do provide a bottom scrim whenever text sits over photography.
- Don't introduce chromatic interface accents beyond the supplied CLIA imagery.
- Don't add shadows to cards, content surfaces, or images.
- Don't use heading weights above 500.
- Don't place body text below 16px.
- Don't use raw white borders where graphite or a glass edge provides the needed separation.
