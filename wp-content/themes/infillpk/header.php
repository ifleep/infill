<?php
/**
 * Site header: skip link, <head>, top utility bar, primary mega-menu nav, mobile nav.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class( 'bg-paper text-ink antialiased' ); ?>>
<?php wp_body_open(); ?>

<a class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white" href="#content">
	<?php esc_html_e( 'Skip to content', 'infillpk' ); ?>
</a>

<header class="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
	<div class="container-page flex h-16 items-center justify-between gap-6">
		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="focus-ring font-display text-lg font-semibold tracking-tight text-ink">
			<?php bloginfo( 'name' ); ?>
		</a>

		<nav class="hidden lg:flex lg:items-center" aria-label="<?php esc_attr_e( 'Primary', 'infillpk' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'items_wrap'     => '<div class="flex items-center">%3$s</div>',
					'walker'         => new INFiLLPK_Mega_Menu_Walker(),
					'fallback_cb'    => false,
				)
			);
			?>
		</nav>

		<div class="flex items-center gap-4">
			<button type="button" class="focus-ring js-search-toggle text-ink-muted hover:text-ink" aria-label="<?php esc_attr_e( 'Search', 'infillpk' ); ?>">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m17 17-3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			</button>

			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a href="<?php echo esc_url( wc_get_account_endpoint_url( 'dashboard' ) ); ?>" class="focus-ring hidden text-ink-muted hover:text-ink sm:block" aria-label="<?php esc_attr_e( 'Account', 'infillpk' ); ?>">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="6.5" r="3.25" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 17c1.3-3.2 4-4.5 6.5-4.5s5.2 1.3 6.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
				</a>
				<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="focus-ring relative text-ink-muted hover:text-ink" aria-label="<?php esc_attr_e( 'Cart', 'infillpk' ); ?>">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 6h13l-1.4 8.2a1.5 1.5 0 0 1-1.48 1.3H6.88a1.5 1.5 0 0 1-1.48-1.3L4 6Z" stroke="currentColor" stroke-width="1.6"/><path d="M7 6a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="1.6"/></svg>
					<span class="js-cart-count absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white"><?php echo esc_html( WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ); ?></span>
				</a>
			<?php endif; ?>

			<button type="button" class="js-mobile-nav-toggle focus-ring text-ink lg:hidden" aria-label="<?php esc_attr_e( 'Menu', 'infillpk' ); ?>" aria-expanded="false">
				<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			</button>
		</div>
	</div>

	<div class="js-search-overlay fixed inset-0 z-50 hidden bg-navy-900/80 backdrop-blur-sm">
		<div class="container-page pt-24">
			<div class="mx-auto max-w-2xl rounded-xl bg-surface p-6 shadow-2xl">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium text-ink-muted"><?php esc_html_e( 'Search', 'infillpk' ); ?></span>
					<button type="button" class="js-search-close focus-ring text-ink-muted hover:text-ink" aria-label="<?php esc_attr_e( 'Close', 'infillpk' ); ?>">&times;</button>
				</div>
				<div class="mt-3">
					<?php get_search_form(); ?>
				</div>
			</div>
		</div>
	</div>

	<div class="js-mobile-nav hidden border-t border-border bg-surface lg:hidden" id="mobile-nav">
		<?php
		wp_nav_menu(
			array(
				'theme_location' => 'primary',
				'container'      => 'nav',
				'container_class' => 'container-page py-4',
				'menu_class'     => 'space-y-1',
				'depth'          => 1,
				'fallback_cb'    => false,
			)
		);
		?>
	</div>
</header>

<div id="content">
