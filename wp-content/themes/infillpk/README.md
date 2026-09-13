# INFiLLPK — WordPress theme

A custom WordPress theme for **WooCommerce** (storefront, cart, checkout, product catalog) and
**Elementor** (visual page editing), built to carry over the design, animations and UX concepts of
the original Next.js prototype (`archive/nextjs-prototype/`) while relying on WordPress/WooCommerce's
own systems for anything they already provide — nothing here reimplements what a plugin or WP core
already does well.

## Architecture at a glance

- **Classic PHP theme**, not a block/FSE theme — maximizes Elementor and WooCommerce compatibility.
- **Homepage (`front-page.php`) is hand-built PHP**, the one page that isn't Elementor-edited, because
  of the Three.js scroll-driven hero's technical requirements. Every other page (About, Contact,
  Services, and anything else you create) is a **plain WP Page**, editable in Elementor like normal.
- **Products, cart, checkout, stock, sale pricing** are all native WooCommerce — see `woocommerce/`
  for the one template override that was actually needed (the product card).
- **Menus** are a normal WP nav menu (Appearance → Menus) rendered by a custom `Walker_Nav_Menu`
  (`inc/nav-walker.php`) as a mega menu — the *menu content* is fully editable from wp-admin, only the
  *rendering* is custom.
- **INFiLL Lab** (the articles/learning hub) is just WordPress Posts in a category, not a custom post
  type — Posts already do everything an article hub needs.
- **Pakistan regions map** and **Find Your Printer quiz** are shortcodes (`inc/shortcodes/`) — the one
  place custom code was justified, since neither WordPress nor WooCommerce has anything like them.
  Drop `[infillpk_pakistan_map]` or `[infillpk_find_your_printer]` into any Elementor page via its
  Shortcode widget.
- **Brands** are a small custom taxonomy (`product_brand`, registered in `inc/woocommerce.php`) —
  WooCommerce core has no brand taxonomy (that's the paid "WooCommerce Brands" extension), so this is
  the other place a custom addition was justified.
- **Availability** (in-stock / out-of-stock / preorder) reuses WooCommerce's native stock status for
  the first two; "preorder" is a `preorder` product tag layered on top, since WooCommerce has no third
  native state.

## Requirements

- WordPress 6.4+, PHP 8.1+
- **WooCommerce** and **Elementor** plugins (both required)
- Node.js 20+ for the asset build (theme development only — not needed to run the live site)

## Local development

```bash
cd wp-content/themes/infillpk
npm install
npm run build        # compiles assets/css/main.build.css and assets/js/*.bundle.js
# or: npm run watch:css / npm run watch:js while iterating
```

The build output (`assets/css/main.build.css`, `assets/js/*.bundle.js`) is gitignored — build it
before deploying (see below).

### Testing with a local WordPress install

Point WordPress at a MySQL (or the [SQLite integration
plugin](https://github.com/WordPress/sqlite-database-integration) for a zero-MySQL local setup),
install WooCommerce + Elementor, then either:

- `wp theme activate infillpk` (WP-CLI), or
- symlink/copy this folder into `wp-content/themes/infillpk` and activate it from Appearance → Themes.

Then import the demo catalog (see below).

## Importing the demo catalog

`tools/data/{brands,products}.json` is the same 34-product demo catalog from the Next.js prototype
(real brand names, real public specs — see `archive/nextjs-prototype/prisma/seed-data.ts` for
provenance) extracted to JSON. `tools/import-products.php` loads it into WooCommerce as real products,
categories, the `product_brand` taxonomy, and the `pa_technology` / `pa_experience-level` /
`pa_use-case` / `pa_machine-category` attributes. Safe to re-run (upserts by SKU/slug).

```bash
php wp-content/themes/infillpk/tools/import-products.php /absolute/path/to/wordpress
```

This needs shell (SSH or WP-CLI) access to the WordPress install — see the Hostinger section below
for what to do if your plan doesn't have that.

## Deploying to Hostinger

Hostinger's WordPress hosting is a normal self-managed WordPress install (their "WordPress Starter" /
"Business" / "Cloud" plans all give you wp-admin + file access; Business and above also give SSH).

1. **Install WordPress** via Hostinger's hPanel (Websites → Add Website → WordPress), or point an
   existing WordPress install's `wp-content/themes/` at this theme.

2. **Install the plugins.** In wp-admin → Plugins → Add New, install and activate **WooCommerce**
   (it will offer a setup wizard — store address, currency PKR, etc.) and **Elementor**.

3. **Build the theme assets locally first** — Hostinger doesn't run your `npm run build` for you:
   ```bash
   cd wp-content/themes/infillpk && npm install && npm run build
   ```
   Then upload the whole `wp-content/themes/infillpk/` folder (build output included) via Hostinger's
   File Manager or SFTP, or zip it and use Appearance → Themes → Add New → Upload Theme in wp-admin.

4. **Activate the theme** (Appearance → Themes). On first activation it creates the INFiLL Lab
   category and the About/Contact/Services pages automatically (`inc/theme-setup.php`) — open each in
   Elementor to design it.

5. **Set permalinks** to "Post name" (Settings → Permalinks) for clean URLs — WooCommerce's cart/
   checkout/account endpoints expect this.

6. **Build the primary menu**: Appearance → Menus → create a menu, add your top-level items (3D
   Printing, Materials, etc.), then nest a column heading under each as a child item, and links under
   *those* as grandchildren — that 3-level nesting is what the mega menu walker renders as panels/
   columns/links. Assign it to the "Primary — Mega Menu" location.

7. **Import the catalog:**
   - **If your plan has SSH** (Business/Cloud): SSH in, then
     `php wp-content/themes/infillpk/tools/import-products.php /home/<user>/public_html`
     (adjust the WordPress root path to match your account).
   - **If not**: either enable SSH by upgrading, ask Hostinger support about WP-CLI access on your
     plan, or add products by hand in Products → Add New — the importer is a convenience, not a
     requirement (WooCommerce works the same either way).

8. **Add a contact form.** WordPress has no built-in contact form; install Contact Form 7 or WPForms
   (either is a normal, well-supported plugin — not something worth hand-rolling) and drop the form
   into the Contact page in Elementor.

9. **SSL**: Hostinger auto-issues a free SSL certificate — make sure "Force HTTPS" is on in hPanel and
   that Settings → General uses an `https://` site address in wp-admin.

No code differences are needed between local testing and Hostinger — the theme only uses standard
WordPress/WooCommerce APIs (no raw SQL, no filesystem assumptions beyond `wp-content/uploads`), so
whatever database Hostinger provisions (MySQL/MariaDB) works without changes.

## What's still simplified vs. the original design brief

This is a first working pass, not a pixel-perfect recreation of every flourish in the original 76-
section brief:

- Product photography is a placeholder (`wc_placeholder_img()`) — the prototype didn't have real
  photos either (see its `product-visual.tsx`), so this carries the same gap forward rather than
  faking imagery.
- Cart/checkout/single-product/my-account pages use WooCommerce's default templates styled only by the
  shared design tokens (`assets/css/main.css`), not a full custom redesign — `content-product.php` (the
  product card, used everywhere WooCommerce lists products) is the one template override that was
  worth doing given how visible it is; the rest is a good follow-up if you want tighter visual parity.
- Outfit/Inter are wired up as self-hosted variable fonts but the actual `.woff2` files aren't
  bundled — drop them into `assets/fonts/` (see the comment in `assets/css/main.css`) to activate;
  until then the system-font fallback is used.
