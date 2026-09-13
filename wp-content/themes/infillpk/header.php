<?php
/**
 * Site header — ported from src/components/layout/site-header.tsx: wordmark,
 * mega-menu nav, icon-only search/account/cart (no redundant Cart/Checkout/
 * My Account text links — those already have icons), "Get a Quote" button.
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

<header class="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
	<div class="container-page flex h-16 items-center gap-6 lg:h-20">
		<button type="button" class="js-mobile-nav-toggle focus-ring cursor-pointer p-1 lg:hidden" aria-label="<?php esc_attr_e( 'Open menu', 'infillpk' ); ?>" aria-expanded="false">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 7h17M3.5 12h17M3.5 17h17" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
		</button>

		<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="focus-ring shrink-0 font-display select-none text-xl font-semibold tracking-tight text-ink">
			INFiLL<span class="text-blue-700">PK</span>
		</a>

		<nav class="hidden flex-1 items-center gap-1 lg:flex" aria-label="<?php esc_attr_e( 'Primary', 'infillpk' ); ?>">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'items_wrap'     => '<div class="flex items-center">%3$s</div>',
					'walker'         => new INFiLLPK_Mega_Menu_Walker(),
					'fallback_cb'    => 'infillpk_nav_fallback',
				)
			);
			?>
		</nav>

		<div class="ml-auto flex items-center gap-1 lg:ml-0">
			<button type="button" class="js-search-toggle focus-ring cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken" aria-label="<?php esc_attr_e( 'Search', 'infillpk' ); ?>">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.6"/><path d="m17 17-3.5-3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
			</button>

			<?php if ( class_exists( 'WooCommerce' ) ) : ?>
				<a href="<?php echo esc_url( wc_get_account_endpoint_url( 'dashboard' ) ); ?>" class="focus-ring hidden cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken sm:block" aria-label="<?php esc_attr_e( 'Account', 'infillpk' ); ?>">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="6.5" r="3.25" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 17c1.3-3.2 4-4.5 6.5-4.5s5.2 1.3 6.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
				</a>
				<a href="<?php echo esc_url( wc_get_cart_url() ); ?>" class="focus-ring relative cursor-pointer rounded p-2 text-ink hover:bg-surface-sunken" aria-label="<?php echo esc_attr( sprintf( /* translators: %d: item count */ __( 'Cart, %d items', 'infillpk' ), WC()->cart ? WC()->cart->get_cart_contents_count() : 0 ) ); ?>">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 6h13l-1.4 8.2a1.5 1.5 0 0 1-1.48 1.3H6.88a1.5 1.5 0 0 1-1.48-1.3L4 6Z" stroke="currentColor" stroke-width="1.6"/><path d="M7 6a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="1.6"/></svg>
					<?php $cart_count = WC()->cart ? WC()->cart->get_cart_contents_count() : 0; ?>
					<span class="js-cart-count tabular absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-semibold text-white <?php echo $cart_count > 0 ? '' : 'hidden'; ?>"><?php echo esc_html( $cart_count ); ?></span>
				</a>
			<?php endif; ?>

			<div class="ml-2 hidden xl:block">
				<a href="<?php echo esc_url( add_query_arg( 'type', 'quote', home_url( '/contact/' ) ) ); ?>" class="focus-ring inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
					<?php esc_html_e( 'Get a Quote', 'infillpk' ); ?>
				</a>
			</div>
		</div>
	</div>
</header>

<?php get_template_part( 'template-parts/search-overlay' ); ?>
<?php get_template_part( 'template-parts/mobile-nav' ); ?>

<div id="content">
