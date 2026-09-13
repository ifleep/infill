<?php
/**
 * [infillpk_find_your_printer] — 4-question printer recommendation quiz.
 * Ported from archive/nextjs-prototype/src/components/sections/find-your-printer-section.tsx.
 * No native WordPress/WooCommerce equivalent (WooCommerce has no
 * recommendation-quiz feature), so this is a justified custom shortcode.
 * Scoring runs client-side (assets/js/find-your-printer.js) against a small
 * JSON snapshot of the "3d-printers" category, built here from live
 * WooCommerce data (price, stock, and the pa_* attributes/meta the importer
 * set) so the quiz never drifts from the catalog.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function infillpk_get_printer_quiz_data() {
	if ( ! class_exists( 'WooCommerce' ) ) {
		return array();
	}

	$query = new WP_Query(
		array(
			'post_type'      => 'product',
			'posts_per_page' => 100,
			'tax_query'      => array(
				array(
					'taxonomy' => 'product_cat',
					'field'    => 'slug',
					'terms'    => '3d-printers',
				),
			),
		)
	);

	$printers = array();
	while ( $query->have_posts() ) {
		$query->the_post();
		$product = wc_get_product( get_the_ID() );
		if ( ! $product ) {
			continue;
		}

		$build_volume = json_decode( get_post_meta( $product->get_id(), '_infillpk_build_volume', true ), true );
		$materials    = json_decode( get_post_meta( $product->get_id(), '_infillpk_materials', true ), true );

		$printers[] = array(
			'id'             => $product->get_id(),
			'name'           => $product->get_name(),
			'url'            => get_permalink( $product->get_id() ),
			'image'          => wp_get_attachment_image_url( $product->get_image_id(), 'infillpk-product-card' ) ?: wc_placeholder_img_src(),
			'priceHtml'      => wp_strip_all_tags( $product->get_price_html() ),
			'price'          => (float) $product->get_price(),
			'useCases'       => wp_get_post_terms( $product->get_id(), 'pa_use-case', array( 'fields' => 'names' ) ),
			'experienceLevel'=> wp_get_post_terms( $product->get_id(), 'pa_experience-level', array( 'fields' => 'names' ) ),
			'technology'     => wp_get_post_terms( $product->get_id(), 'pa_technology', array( 'fields' => 'names' ) ),
			'speedMmPerSec'  => (float) get_post_meta( $product->get_id(), '_infillpk_speed_mm_s', true ),
			'buildVolumeCc'  => is_array( $build_volume ) ? ( $build_volume['x'] * $build_volume['y'] * $build_volume['z'] ) : 0,
			'materialsCount' => is_array( $materials ) ? count( $materials ) : 0,
			'rating'         => (float) $product->get_average_rating(),
		);
	}
	wp_reset_postdata();

	return $printers;
}

function infillpk_find_your_printer_shortcode() {
	$printers = infillpk_get_printer_quiz_data();

	$fyp_asset = infillpk_asset_uri( 'assets/js/find-your-printer.bundle.js' );
	if ( $fyp_asset ) {
		wp_enqueue_script( 'infillpk-find-your-printer', $fyp_asset[0], array(), $fyp_asset[1], true );
		wp_localize_script( 'infillpk-find-your-printer', 'infillpkPrinters', $printers );
	}

	ob_start();
	?>
	<section class="bg-surface-sunken py-20 sm:py-28">
		<div class="container-page">
			<?php
			infillpk_section_heading(
				array(
					'eyebrow' => __( 'Find Your Printer', 'infillpk' ),
					'title'   => __( 'Answer four questions. Get real matches.', 'infillpk' ),
				)
			);
			?>
			<div class="js-fyp mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-10" data-step="0">
				<div class="mb-6 flex items-center gap-2 js-fyp-progress">
					<?php for ( $i = 0; $i < 4; $i++ ) : ?>
						<div class="js-fyp-progress-bar h-1.5 flex-1 rounded-full <?php echo 0 === $i ? 'bg-blue-700' : 'bg-border'; ?>" data-index="<?php echo esc_attr( $i ); ?>"></div>
					<?php endfor; ?>
				</div>

				<div class="js-fyp-step" data-step="0">
					<h3 class="font-display mb-6 text-xl font-semibold text-ink"><?php esc_html_e( 'What are you making?', 'infillpk' ); ?></h3>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<?php foreach ( array( 'Hobby', 'Prototyping', 'Engineering', 'Education', 'Business', 'Industrial' ) as $opt ) : ?>
							<button type="button" class="js-fyp-choice focus-ring cursor-pointer rounded-lg border border-border px-4 py-3.5 text-left text-sm font-medium text-ink transition-colors hover:border-blue-300 hover:bg-blue-50" data-question="useCase" data-value="<?php echo esc_attr( $opt ); ?>"><?php echo esc_html( $opt ); ?></button>
						<?php endforeach; ?>
					</div>
				</div>

				<div class="js-fyp-step hidden" data-step="1">
					<h3 class="font-display mb-6 text-xl font-semibold text-ink"><?php esc_html_e( "What's your experience?", 'infillpk' ); ?></h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						<?php foreach ( array( 'Beginner', 'Intermediate', 'Professional' ) as $opt ) : ?>
							<button type="button" class="js-fyp-choice focus-ring cursor-pointer rounded-lg border border-border px-4 py-3.5 text-left text-sm font-medium text-ink transition-colors hover:border-blue-300 hover:bg-blue-50" data-question="experience" data-value="<?php echo esc_attr( $opt ); ?>"><?php echo esc_html( $opt ); ?></button>
						<?php endforeach; ?>
					</div>
				</div>

				<div class="js-fyp-step hidden" data-step="2">
					<h3 class="font-display mb-6 text-xl font-semibold text-ink"><?php esc_html_e( 'What matters most?', 'infillpk' ); ?></h3>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<?php foreach ( array( 'Speed', 'Quality', 'Large build volume', 'Ease of use', 'Materials', 'Reliability', 'Price' ) as $opt ) : ?>
							<button type="button" class="js-fyp-choice focus-ring cursor-pointer rounded-lg border border-border px-4 py-3.5 text-left text-sm font-medium text-ink transition-colors hover:border-blue-300 hover:bg-blue-50" data-question="priority" data-value="<?php echo esc_attr( $opt ); ?>"><?php echo esc_html( $opt ); ?></button>
						<?php endforeach; ?>
					</div>
				</div>

				<div class="js-fyp-step hidden" data-step="3">
					<h3 class="font-display mb-6 text-xl font-semibold text-ink"><?php esc_html_e( "What's your budget?", 'infillpk' ); ?></h3>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-4">
						<?php
						$budgets = array(
							array( __( 'Under Rs 75,000', 'infillpk' ), 75000 ),
							array( __( 'Rs 75,000 – 150,000', 'infillpk' ), 150000 ),
							array( __( 'Rs 150,000 – 350,000', 'infillpk' ), 350000 ),
							array( __( 'Rs 350,000+', 'infillpk' ), 'Infinity' ),
						);
						foreach ( $budgets as $b ) :
							?>
							<button type="button" class="js-fyp-choice focus-ring cursor-pointer rounded-lg border border-border px-4 py-3.5 text-left text-sm font-medium text-ink transition-colors hover:border-blue-300 hover:bg-blue-50" data-question="budgetMax" data-value="<?php echo esc_attr( $b[1] ); ?>"><?php echo esc_html( $b[0] ); ?></button>
						<?php endforeach; ?>
					</div>
				</div>

				<button type="button" class="js-fyp-back focus-ring mt-6 hidden items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
					&larr; <?php esc_html_e( 'Back', 'infillpk' ); ?>
				</button>

				<div class="js-fyp-results hidden">
					<div class="mb-6 flex items-center justify-between">
						<h3 class="font-display flex items-center gap-2 text-xl font-semibold text-ink"><?php esc_html_e( 'Your best matches', 'infillpk' ); ?></h3>
						<button type="button" class="js-fyp-restart focus-ring text-sm font-medium text-blue-700 hover:text-blue-600"><?php esc_html_e( 'Start over', 'infillpk' ); ?></button>
					</div>
					<div class="js-fyp-results-grid grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"></div>
					<p class="js-fyp-no-results hidden text-sm text-ink-muted"><?php esc_html_e( 'No close matches in the current catalog — browse all printers instead.', 'infillpk' ); ?></p>
				</div>
			</div>
		</div>
	</section>
	<?php
	return ob_get_clean();
}
add_shortcode( 'infillpk_find_your_printer', 'infillpk_find_your_printer_shortcode' );
