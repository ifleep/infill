# INFiLLPK — WordPress Theme

Modern 3D printing and digital fabrication technology for Pakistan. This repo is a **custom
WordPress theme** (`wp-content/themes/infillpk/`) built for **WooCommerce** (storefront/catalog)
and **Elementor** (visual page editing), deployed on Hostinger's WordPress hosting.

> An earlier Next.js prototype of this site lives in [`archive/nextjs-prototype/`](archive/nextjs-prototype/)
> — kept as a design/asset reference, no longer the production codebase. See that folder's README
> for what's worth reusing from it (design tokens, the Three.js hero animation, the demo catalog).

## Requirements

- WordPress (self-hosted, e.g. Hostinger's WordPress hosting)
- Plugins: **WooCommerce** (required), **Elementor** (required for visual page editing)
- PHP 8.1+
- Node.js 20+ (theme development only — for building CSS/JS assets; not needed to run the site)

## Theme structure

See [`wp-content/themes/infillpk/README.md`](wp-content/themes/infillpk/README.md) for the full
theme documentation: setup, asset build, demo product import, and how each part of the original
design was ported (mega menu, hero animation, Pakistan map, Find Your Printer quiz, etc.).

## Quick start (local development)

```bash
cd wp-content/themes/infillpk
npm install
npm run build      # compiles CSS/JS into assets/css and assets/js
```

Then install the theme + WooCommerce + Elementor on a WordPress site (local or Hostinger) as
described in the theme README.
