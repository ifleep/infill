<?php
/**
 * Slide-in mobile nav panel — ported from src/components/layout/mobile-nav.tsx.
 * Toggled by .js-mobile-nav-toggle in header.php (assets/js/main.js).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="js-mobile-nav-root fixed inset-0 z-50 hidden lg:hidden" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Site menu', 'infillpk' ); ?>">
	<div class="js-mobile-nav-backdrop absolute inset-0 bg-ink/40"></div>
	<div class="js-mobile-nav-panel absolute left-0 top-0 h-full w-[85%] max-w-sm -translate-x-full overflow-y-auto bg-surface shadow-2xl transition-transform duration-300">
		<div class="flex items-center justify-between border-b border-border px-5 py-4">
			<span class="font-display select-none text-xl font-semibold tracking-tight text-ink">INFiLL<span class="text-blue-700">PK</span></span>
			<button type="button" class="js-mobile-nav-close focus-ring cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface-sunken" aria-label="<?php esc_attr_e( 'Close menu', 'infillpk' ); ?>">
				<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="m5 5 12 12M17 5 5 17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			</button>
		</div>
		<nav class="px-2 py-2">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'items_wrap'     => '%3$s',
					'walker'         => new INFiLLPK_Mobile_Nav_Walker(),
					'fallback_cb'    => 'infillpk_nav_fallback',
				)
			);
			?>
			<a href="<?php echo esc_url( add_query_arg( 'type', 'quote', home_url( '/contact/' ) ) ); ?>" class="focus-ring block px-3 py-3.5 text-sm font-medium text-blue-700">
				<?php esc_html_e( 'Get a Quote', 'infillpk' ); ?>
			</a>
		</nav>
	</div>
</div>
