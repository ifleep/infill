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
		__( 'Import Demo Catalog', 'infillpk' ),
		__( 'Import Demo Catalog', 'infillpk' ),
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

	$log = null;

	if ( isset( $_POST['infillpk_run_import'] ) && check_admin_referer( 'infillpk_import_catalog' ) ) {
		if ( ! class_exists( 'WooCommerce' ) ) {
			$log = array( __( 'WooCommerce is not active — activate it first, then come back here.', 'infillpk' ) );
		} else {
			set_time_limit( 120 );
			$log = infillpk_run_catalog_import();
		}
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Import Demo Catalog', 'infillpk' ); ?></h1>
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
			<h2><?php esc_html_e( 'Log', 'infillpk' ); ?></h2>
			<pre style="background:#fff;border:1px solid #ccd0d4;padding:12px;max-height:480px;overflow:auto;"><?php echo esc_html( implode( "\n", $log ) ); ?></pre>
			<p>
				<a href="<?php echo esc_url( admin_url( 'tools.php?page=infillpk-import-catalog' ) ); ?>" class="button"><?php esc_html_e( 'Run again', 'infillpk' ); ?></a>
			</p>
		<?php endif; ?>
	</div>
	<?php
}
