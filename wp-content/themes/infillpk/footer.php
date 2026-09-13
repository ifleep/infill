<?php
/**
 * Site footer — ported from src/components/layout/site-footer.tsx: wordmark +
 * tagline, four link columns (Shop / Services / Learn / Company), bottom bar
 * with copyright and legal links.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$services_page = get_page_by_path( 'services' );
$services_url  = $services_page ? get_permalink( $services_page ) : home_url( '/services/' );
$lab_link      = get_category_by_slug( 'infill-lab' );
$lab_url       = $lab_link ? get_category_link( $lab_link ) : home_url( '/' );

$footer_columns = array(
	__( 'Shop', 'infillpk' )     => array(
		__( '3D Printers', 'infillpk' )        => infillpk_shop_url( '3d-printers' ),
		__( 'Filaments', 'infillpk' )          => infillpk_shop_url( 'filament' ),
		__( 'Parts & Accessories', 'infillpk' ) => infillpk_shop_url( 'parts-accessories' ),
		__( 'Machines', 'infillpk' )           => infillpk_shop_url( 'machines' ),
	),
	__( 'Services', 'infillpk' ) => array(
		__( '3D Printing', 'infillpk' )  => $services_url . '#printing',
		__( 'Prototyping', 'infillpk' )  => $services_url . '#prototyping',
		__( 'Design', 'infillpk' )       => $services_url . '#design',
		__( 'Installation & Training', 'infillpk' ) => $services_url . '#installation',
		__( 'Support', 'infillpk' )      => $services_url . '#support',
	),
	__( 'Learn', 'infillpk' )    => array(
		__( 'INFiLL Lab', 'infillpk' ) => $lab_url,
	),
	__( 'Company', 'infillpk' )  => array(
		__( 'About', 'infillpk' )   => home_url( '/about/' ),
		__( 'Contact', 'infillpk' ) => home_url( '/contact/' ),
	),
);
?>
</div><!-- #content -->

<footer class="bg-navy-900 text-on-navy">
	<div class="container-page py-14">
		<div class="grid grid-cols-2 gap-10 md:grid-cols-5">
			<div class="col-span-2 md:col-span-1">
				<span class="font-display select-none text-xl font-semibold tracking-tight text-on-navy">INFiLL<span class="text-blue-300">PK</span></span>
				<p class="mt-3 max-w-[22ch] text-sm text-on-navy-muted"><?php esc_html_e( '3D Printing & Digital Fabrication', 'infillpk' ); ?></p>
			</div>

			<?php foreach ( $footer_columns as $heading => $links ) : ?>
				<div>
					<p class="mb-3 text-xs font-semibold uppercase tracking-wide text-on-navy-muted"><?php echo esc_html( $heading ); ?></p>
					<ul class="space-y-2.5">
						<?php foreach ( $links as $label => $url ) : ?>
							<li><a href="<?php echo esc_url( $url ); ?>" class="focus-ring text-sm text-on-navy hover:text-blue-300"><?php echo esc_html( $label ); ?></a></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endforeach; ?>
		</div>

		<div class="mt-12 flex flex-col gap-4 border-t border-border-on-navy pt-6 text-xs text-on-navy-muted sm:flex-row sm:items-center sm:justify-between">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'All rights reserved.', 'infillpk' ); ?></p>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				<?php
				$legal_pages = array(
					'privacy-policy'   => __( 'Privacy Policy', 'infillpk' ),
					'returns-warranty' => __( 'Returns & Warranty', 'infillpk' ),
					'shipping'         => __( 'Shipping', 'infillpk' ),
				);
				foreach ( $legal_pages as $slug => $label ) :
					$page = get_page_by_path( $slug );
					if ( ! $page ) {
						continue;
					}
					?>
					<a href="<?php echo esc_url( get_permalink( $page ) ); ?>" class="focus-ring hover:text-on-navy"><?php echo esc_html( $label ); ?></a>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
