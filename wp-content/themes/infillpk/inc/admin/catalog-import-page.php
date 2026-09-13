<?php
/**
 * Tools > Import Demo Catalog — a one-click way to run
 * infillpk_run_catalog_import() from wp-admin, for hosting plans (many
 * Hostinger shared-hosting plans included) that don't provide SSH/WP-CLI
 * access to run tools/import-products.php from the command line.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function infillpk_register_catalog_import_page() {
	add_management_page(
		__( 'INFiLLPK Setup', 'infillpk' ),
		__( 'INFiLLPK Setup', 'infillpk' ),
		'manage_woocommerce',
		'infillpk-import-catalog',
		'infillpk_render_catalog_import_page'
	);
}
add_action( 'admin_menu', 'infillpk_register_catalog_import_page' );

function infillpk_render_catalog_import_page() {
	if ( ! current_user_can( 'manage_woocommerce' ) ) {
		wp_die( esc_html__( 'You do not have permission to do this.', 'infillpk' ) );
	}

	// Idempotent — cheap to run on every visit, and picks up pages added to
	// infillpk_create_default_content() after the theme's first activation
	// (e.g. the Privacy/Returns/Shipping pages the footer links to).
	if ( function_exists( 'infillpk_create_default_content' ) ) {
		infillpk_create_default_content();
	}

	$log = null;
	$menu_result = null;

	if ( isset( $_POST['infillpk_run_import'] ) && check_admin_referer( 'infillpk_import_catalog' ) ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			$log = array( __( 'WooCommerce is not active — activate it first, then come back here.', 'infillpk' ) );
		} else {
			set_time_limit( 120 );
			$log = infillpk_run_catalog_import();
		}
	}

	if ( isset( $_POST['infillpk_run_menu'] ) && check_admin_referer( 'infillpk_create_menu' ) ) {
		// Force recreation even if after_switch_theme already ran (or ran before
		// the catalog existed, leaving menu links pointing at nothing yet).
		$locations = get_nav_menu_locations();
		unset( $locations['primary'], $locations['footer'] );
		set_theme_mod( 'nav_menu_locations', $locations );

		$existing_primary = get_term_by( 'name', __( 'Primary', 'infillpk' ), 'nav_menu' );
		if ( $existing_primary ) {
			wp_delete_nav_menu( $existing_primary->term_id );
		}
		$existing_footer = get_term_by( 'name', __( 'Footer', 'infillpk' ), 'nav_menu' );
		if ( $existing_footer ) {
			wp_delete_nav_menu( $existing_footer->term_id );
		}

		infillpk_create_default_menus();
		$menu_result = __( 'Menu created and assigned.', 'infillpk' );
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'INFiLLPK Setup', 'infillpk' ); ?></h1>

		<h2><?php esc_html_e( 'Step 1: Import Demo Catalog', 'infillpk' ); ?></h2>
		<p><?php esc_html_e( 'Loads the 34-item demo catalog (Bambu Lab, Creality, Prusa, Elegoo, and more — real brand names and public specs) into WooCommerce as real products, with categories, brands and attributes set up. Safe to run more than once — it updates existing products instead of duplicating them.', 'infillpk' ); ?></p>

		<?php if ( null === $log ) : ?>
			<form method="post">
				<?php wp_nonce_field( 'infillpk_import_catalog' ); ?>
				<p>
					<button type="submit" name="infillpk_run_import" value="1" class="button button-primary button-hero">
						<?php esc_html_e( 'Import Demo Catalog Now', 'infillpk' ); ?>
					</button>
				</p>
			</form>
		<?php else : ?>
			<div class="notice notice-success">
				<p><strong><?php esc_html_e( 'Import finished.', 'infillpk' ); ?></strong>
				<a href="<?php echo esc_url( admin_url( 'edit.php?post_type=product' ) ); ?>"><?php esc_html_e( 'View your products', 'infillpk' ); ?></a></p>
			</div>
			<h3><?php esc_html_e( 'Log', 'infillpk' ); ?></h3>
			<pre style="background:#fff;border:1px solid #ccd0d4;padding:12px;max-height:480px;overflow:auto;"><?php echo esc_html( implode( "\n", $log ) ); ?></pre>
			<p>
				<a href="<?php echo esc_url( admin_url( 'tools.php?page=infillpk-import-catalog' ) ); ?>" class="button"><?php esc_html_e( 'Run again', 'infillpk' ); ?></a>
			</p>
		<?php endif; ?>

		<hr>

		<h2><?php esc_html_e( 'Step 2: Create the mega menu', 'infillpk' ); ?></h2>
		<p><?php esc_html_e( 'Builds the "Primary" navigation menu (3D Printing, Materials, Parts & Accessories, Machines, Services, Learn) with real links into your catalog, and assigns it to the header automatically. Run this after importing the catalog, so the brand/category links resolve correctly. Safe to run again — it replaces the previous auto-created menu rather than duplicating it.', 'infillpk' ); ?></p>

		<?php if ( null === $menu_result ) : ?>
			<form method="post">
				<?php wp_nonce_field( 'infillpk_create_menu' ); ?>
				<p>
					<button type="submit" name="infillpk_run_menu" value="1" class="button button-primary button-hero">
						<?php esc_html_e( 'Create Menu Now', 'infillpk' ); ?>
					</button>
				</p>
			</form>
		<?php else : ?>
			<div class="notice notice-success">
				<p><strong><?php echo esc_html( $menu_result ); ?></strong>
				<a href="<?php echo esc_url( admin_url( 'nav-menus.php' ) ); ?>"><?php esc_html_e( 'Review it in Appearance > Menus', 'infillpk' ); ?></a></p>
			</div>
		<?php endif; ?>
	</div>
	<?php
}
