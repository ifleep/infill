<?php
/**
 * Full search overlay — ported from src/components/search/search-overlay.tsx:
 * popular-search chips, live brand + product matches as you type. Live
 * results are fetched client-side (assets/js/search.js) from WooCommerce's
 * own public Store API (/wp-json/wc/store/v1/products) and the product_brand
 * taxonomy's REST endpoint — no custom search backend needed.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$popular_searches = array( '3D printers', 'PLA filament', 'PETG filament', 'Bambu Lab', 'Resin', 'Nozzles', 'Build plates' );
?>
<div class="js-search-overlay fixed inset-0 z-50 hidden" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Search', 'infillpk' ); ?>">
	<div class="js-search-backdrop absolute inset-0 bg-ink/50"></div>
	<div class="relative mx-auto mt-0 w-full max-w-3xl bg-surface px-5 pb-8 pt-6 shadow-2xl sm:mt-16 sm:rounded-xl sm:px-8">
		<div class="mb-6 flex items-center gap-3">
			<svg width="22" height="22" viewBox="0 0 22 22" fill="none" class="shrink-0 text-ink-faint" aria-hidden="true"><circle cx="10" cy="10" r="7.2" stroke="currentColor" stroke-width="1.6"/><path d="m19 19-4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			<input type="search" class="js-search-input focus-ring w-full border-none bg-transparent text-lg text-ink placeholder:text-ink-faint focus:outline-none" placeholder="<?php esc_attr_e( 'What are you looking for?', 'infillpk' ); ?>" autocomplete="off">
			<button type="button" class="js-search-close focus-ring shrink-0 cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken" aria-label="<?php esc_attr_e( 'Close search', 'infillpk' ); ?>">
				<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="m5 5 12 12M17 5 5 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			</button>
		</div>

		<div class="js-search-popular">
			<p class="mb-3 text-xs font-medium uppercase tracking-wide text-ink-faint"><?php esc_html_e( 'Popular searches', 'infillpk' ); ?></p>
			<div class="flex flex-wrap gap-2">
				<?php foreach ( $popular_searches as $term ) : ?>
					<button type="button" class="js-search-suggestion focus-ring cursor-pointer rounded-full border border-border px-3.5 py-1.5 text-sm text-ink hover:border-blue-300 hover:bg-blue-50"><?php echo esc_html( $term ); ?></button>
				<?php endforeach; ?>
			</div>
		</div>

		<p class="js-search-empty hidden text-sm text-ink-muted"></p>

		<div class="js-search-brands mb-5 hidden">
			<p class="mb-2 text-xs font-medium uppercase tracking-wide text-ink-faint"><?php esc_html_e( 'Brands', 'infillpk' ); ?></p>
			<div class="js-search-brands-list flex flex-wrap gap-2"></div>
		</div>

		<ul class="js-search-products hidden divide-y divide-border"></ul>
	</div>
</div>
