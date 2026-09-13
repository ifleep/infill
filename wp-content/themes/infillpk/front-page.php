<?php
/**
 * Homepage. Hand-built (not an Elementor page) because of the Three.js hero's
 * technical requirements — every other page (About, Contact, Services) is a
 * regular, Elementor-editable WP Page. Narrative sections below the hero are
 * static content (same as the original prototype) except Featured Printers
 * (live WooCommerce query) and INFiLL Lab (live WP_Query on Posts).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main">

	<!-- ===== Hero ===== -->
	<div class="js-hero-wrapper relative">
		<div class="js-hero-pin relative h-screen min-h-[640px] w-full overflow-hidden">
			<div class="absolute inset-0">
				<div class="js-hero-static absolute inset-0 flex items-center justify-center overflow-hidden bg-navy-900">
					<div class="absolute inset-0 opacity-40" style="background-image:radial-gradient(circle at 30% 20%, rgba(47,88,174,0.35), transparent 55%), radial-gradient(circle at 75% 70%, rgba(31,63,138,0.3), transparent 50%);"></div>
					<svg viewBox="0 0 320 320" class="relative h-[65%] w-auto max-w-[420px] opacity-95" aria-hidden="true">
						<g stroke="#4d7bd6" stroke-width="1.5" fill="none" opacity="0.7">
							<rect x="60" y="40" width="200" height="220" rx="4" />
							<line x1="60" y1="90" x2="260" y2="90" />
							<line x1="90" y1="40" x2="90" y2="260" />
							<line x1="230" y1="40" x2="230" y2="260" />
						</g>
						<rect x="80" y="210" width="160" height="14" rx="3" fill="#efe9df" />
						<rect x="70" y="224" width="180" height="10" rx="2" fill="#23262c" />
						<rect x="140" y="95" width="40" height="24" rx="3" fill="#3a3f48" />
						<rect x="152" y="119" width="16" height="20" fill="#8b93a0" />
						<path d="M155 139 L165 139 L160 154 Z" fill="#b8863b" />
						<circle cx="90" cy="65" r="9" fill="#111318" />
						<circle cx="230" cy="65" r="9" fill="#111318" />
						<rect x="130" y="130" width="60" height="70" rx="2" fill="#2f58ae" opacity="0.5" />
					</svg>
				</div>
				<div class="js-hero-canvas hidden absolute inset-0"></div>
			</div>

			<div class="pointer-events-none absolute inset-0 bg-linear-to-t from-navy-900/75 to-navy-900/5"></div>

			<div class="container-page relative z-10 flex h-full items-center pointer-events-none">
				<div class="max-w-xl pointer-events-auto">
					<h1 class="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-on-navy sm:text-6xl lg:text-7xl">
						<?php esc_html_e( "Build what's next.", 'infillpk' ); ?>
					</h1>
					<p class="mt-5 max-w-md text-lg text-on-navy-muted">
						<?php esc_html_e( '3D printing technology, materials and digital fabrication for Pakistan.', 'infillpk' ); ?>
					</p>
					<div class="mt-8 flex flex-wrap gap-3">
						<a href="<?php echo esc_url( infillpk_shop_url( '3d-printers' ) ); ?>" class="focus-ring inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
							<?php esc_html_e( 'Shop 3D Printers', 'infillpk' ); ?>
						</a>
						<a href="<?php echo esc_url( home_url( '/about/' ) ); ?>" class="focus-ring inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-on-navy hover:bg-white/10 transition-colors">
							<?php esc_html_e( 'Explore Technology', 'infillpk' ); ?>
						</a>
					</div>
				</div>
			</div>

			<div class="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center text-on-navy-muted">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" class="animate-bounce" aria-hidden="true"><path d="m5 8 5 5 5-5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
				<span class="sr-only"><?php esc_html_e( 'Scroll to explore', 'infillpk' ); ?></span>
			</div>
		</div>
	</div>

	<!-- ===== 3D Printing technology discovery ===== -->
	<section class="container-page py-20 sm:py-28">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
			<?php
			infillpk_section_heading(
				array(
					'eyebrow'     => __( '3D Printing', 'infillpk' ),
					'title'       => __( 'One technology. Many ways to build.', 'infillpk' ),
					'description' => __( "From a first desktop printer to an enclosed production system, the right technology depends on what you're actually making.", 'infillpk' ),
				)
			);
			?>
			<a href="<?php echo esc_url( infillpk_shop_url( '3d-printers' ) ); ?>" class="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex">
				<?php esc_html_e( 'View all 3D printers', 'infillpk' ); ?> &rarr;
			</a>
		</div>

		<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<?php
			$technologies = array(
				array( 'label' => 'FDM / FFF', 'tech' => 'FDM', 'copy' => __( 'The everyday workhorse — accessible, versatile, and material-rich.', 'infillpk' ) ),
				array( 'label' => 'Resin', 'tech' => 'Resin', 'copy' => __( 'Fine detail and smooth surface finish for miniatures and masters.', 'infillpk' ) ),
				array( 'label' => 'CoreXY', 'tech' => 'CoreXY', 'copy' => __( 'Enclosed, high-speed motion systems built for volume.', 'infillpk' ) ),
				array( 'label' => 'Large Format', 'tech' => 'Large Format', 'copy' => __( 'For parts — and ambitions — that outgrow a standard bed.', 'infillpk' ) ),
				array( 'label' => 'Industrial', 'tech' => 'Industrial', 'copy' => __( 'Production-grade reliability for continuous duty.', 'infillpk' ) ),
				array( 'label' => 'Educational', 'tech' => 'Educational', 'copy' => __( 'Built for classrooms, labs, and first-time makers.', 'infillpk' ) ),
			);
			foreach ( $technologies as $t ) :
				?>
				<a href="<?php echo esc_url( infillpk_shop_url( '3d-printers', array( 'filter_technology' => $t['tech'] ) ) ); ?>" class="focus-ring group rounded-xl border border-border bg-surface p-6 transition-colors hover:border-blue-300 hover:bg-blue-50">
					<h3 class="font-display text-lg font-semibold text-ink"><?php echo esc_html( $t['label'] ); ?></h3>
					<p class="mt-2 text-sm text-ink-muted"><?php echo esc_html( $t['copy'] ); ?></p>
					<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-700 opacity-0 transition-opacity group-hover:opacity-100"><?php esc_html_e( 'Explore', 'infillpk' ); ?> &rarr;</span>
				</a>
			<?php endforeach; ?>
		</div>
	</section>

	<!-- ===== Featured printers (live WooCommerce query) ===== -->
	<?php
	if ( class_exists( 'WooCommerce' ) ) :
		$featured_query = new WP_Query(
			array(
				'post_type'      => 'product',
				'posts_per_page' => 4,
				'post__in'       => wc_get_featured_product_ids() ?: array( 0 ),
				'tax_query'      => array(
					array(
						'taxonomy' => 'product_cat',
						'field'    => 'slug',
						'terms'    => '3d-printers',
					),
				),
			)
		);
		if ( $featured_query->have_posts() ) :
			?>
			<section class="container-page py-20 sm:py-28">
				<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
					<?php infillpk_section_heading( array( 'eyebrow' => __( 'Featured', 'infillpk' ), 'title' => __( 'Start shopping.', 'infillpk' ) ) ); ?>
					<a href="<?php echo esc_url( infillpk_shop_url( '3d-printers' ) ); ?>" class="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex">
						<?php esc_html_e( 'View all printers', 'infillpk' ); ?> &rarr;
					</a>
				</div>
				<ul class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 products">
					<?php
					while ( $featured_query->have_posts() ) :
						$featured_query->the_post();
						wc_get_template_part( 'content', 'product' );
					endwhile;
					?>
				</ul>
			</section>
			<?php
		endif;
		wp_reset_postdata();
	endif;
	?>

	<!-- ===== Materials ===== -->
	<section class="container-page py-20 sm:py-28">
		<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
			<?php
			infillpk_section_heading(
				array(
					'eyebrow'     => __( 'Materials', 'infillpk' ),
					'title'       => __( 'Materials matter.', 'infillpk' ),
					'description' => __( 'Printers get the attention, but materials are what most customers come back for.', 'infillpk' ),
				)
			);
			?>
			<a href="<?php echo esc_url( infillpk_shop_url( 'filament' ) ); ?>" class="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex">
				<?php esc_html_e( 'View all materials', 'infillpk' ); ?> &rarr;
			</a>
		</div>

		<div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			<?php
			$materials = array(
				array( 'label' => 'PLA', 'sub' => 'PLA', 'copy' => __( 'Easy, reliable, the default starting point.', 'infillpk' ) ),
				array( 'label' => 'PETG', 'sub' => 'PETG', 'copy' => __( 'Tougher and more moisture-resistant than PLA.', 'infillpk' ) ),
				array( 'label' => 'ABS / ASA', 'sub' => 'ABS', 'copy' => __( 'Heat and impact resistance for demanding parts.', 'infillpk' ) ),
				array( 'label' => 'TPU', 'sub' => 'TPU', 'copy' => __( 'Flexible material for gaskets and wearables.', 'infillpk' ) ),
				array( 'label' => 'Nylon & Engineering', 'sub' => 'Nylon', 'copy' => __( 'Stiffness and heat resistance for functional parts.', 'infillpk' ) ),
				array( 'label' => 'Resin', 'sub' => '', 'copy' => __( 'Fine detail for miniatures, masters and dental work.', 'infillpk' ) ),
			);
			foreach ( $materials as $m ) :
				$href = 'Resin' === $m['label'] ? infillpk_shop_url( 'resin' ) : infillpk_shop_url( 'filament', array( 'filter_material' => $m['sub'] ) );
				?>
				<a href="<?php echo esc_url( $href ); ?>" class="focus-ring group flex flex-col rounded-xl border border-border bg-surface p-5 transition-colors hover:border-blue-300 hover:bg-blue-50">
					<h3 class="mt-1 text-sm font-semibold text-ink"><?php echo esc_html( $m['label'] ); ?></h3>
					<p class="mt-1 text-xs text-ink-muted"><?php echo esc_html( $m['copy'] ); ?></p>
				</a>
			<?php endforeach; ?>
		</div>

		<div class="mt-8 rounded-xl border border-dashed border-border-strong bg-surface-sunken p-5 text-sm text-ink-muted">
			<span class="font-medium text-ink"><?php esc_html_e( 'INFiLL Filament', 'infillpk' ); ?></span>
			&mdash; <?php esc_html_e( 'our own material line is in development. For now, we carry established and OEM filament brands.', 'infillpk' ); ?>
		</div>
	</section>

	<!-- ===== Digital fabrication (dark) ===== -->
	<section class="bg-navy-900 py-16 text-on-navy sm:py-20">
		<div class="container-page">
			<?php
			infillpk_section_heading(
				array(
					'eyebrow'     => __( 'Beyond 3D Printing', 'infillpk' ),
					'title'       => __( 'An expanding fabrication ecosystem.', 'infillpk' ),
					'description' => __( '3D printing remains the core of INFiLLPK. These are the machines that extend what\'s possible alongside it.', 'infillpk' ),
					'inverted'    => true,
				)
			);
			?>
			<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
				<?php
				$machines = array(
					array( 'label' => 'CNC', 'sub' => 'CNC', 'copy' => __( 'Desktop precision machining for wood, plastic and light metals.', 'infillpk' ) ),
					array( 'label' => 'UV Printing', 'sub' => 'UV Printing', 'copy' => __( 'Direct-to-object printing for signage and promotional items.', 'infillpk' ) ),
					array( 'label' => 'Laser', 'sub' => 'Laser', 'copy' => __( 'Cutting and engraving across wood, acrylic and leather.', 'infillpk' ) ),
				);
				foreach ( $machines as $m ) :
					?>
					<a href="<?php echo esc_url( infillpk_shop_url( 'machines', array( 'filter_machine-category' => $m['sub'] ) ) ); ?>" class="focus-ring group rounded-xl border border-border-on-navy p-6 transition-colors hover:border-blue-300 hover:bg-white/5">
						<h3 class="font-display mt-3 text-lg font-semibold text-on-navy"><?php echo esc_html( $m['label'] ); ?></h3>
						<p class="mt-2 text-sm text-on-navy-muted"><?php echo esc_html( $m['copy'] ); ?></p>
						<span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-300 opacity-0 transition-opacity group-hover:opacity-100"><?php esc_html_e( 'Explore', 'infillpk' ); ?> &rarr;</span>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- ===== Find Your Printer (custom shortcode — no WP/WooCommerce equivalent) ===== -->
	<?php echo do_shortcode( '[infillpk_find_your_printer]' ); ?>

	<!-- ===== Pakistan regions map (custom shortcode) ===== -->
	<?php echo do_shortcode( '[infillpk_pakistan_map]' ); ?>

	<!-- ===== Services ===== -->
	<section id="services" class="container-page py-20 sm:py-28">
		<?php
		infillpk_section_heading(
			array(
				'eyebrow'     => __( 'Services', 'infillpk' ),
				'title'       => __( 'From idea to object.', 'infillpk' ),
				'description' => __( "We don't just sell machines. We help you use them.", 'infillpk' ),
			)
		);
		?>
		<div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
			<?php
			$services = array(
				array( 'headline' => __( 'Turn digital models into physical parts.', 'infillpk' ), 'description' => __( 'Send us a file and get a finished part back — FDM or resin, in the material your application actually needs.', 'infillpk' ), 'bullets' => array( __( 'Single parts or small production runs', 'infillpk' ), __( 'FDM and resin technologies', 'infillpk' ), __( 'Material guidance included', 'infillpk' ) ) ),
				array( 'headline' => __( 'Rapidly iterate physical concepts.', 'infillpk' ), 'description' => __( 'Fast turnaround on design iterations so you can test fit, form and function before committing to tooling or a production run.', 'infillpk' ), 'bullets' => array( __( 'Same-week turnaround on most parts', 'infillpk' ), __( 'Multiple materials per iteration', 'infillpk' ), __( 'Design-for-manufacture feedback', 'infillpk' ) ) ),
				array( 'headline' => __( 'Help customers prepare and optimize models.', 'infillpk' ), 'description' => __( "Not every idea starts as a print-ready file. We help clean up, repair, and optimize models for the technology and material you're using.", 'infillpk' ), 'bullets' => array( __( 'Model repair and optimization', 'infillpk' ), __( 'Print-orientation and support strategy', 'infillpk' ), __( 'Reverse engineering from photos or sketches', 'infillpk' ) ) ),
				array( 'headline' => __( 'Get machines operating correctly.', 'infillpk' ), 'description' => __( 'On-site or remote setup, calibration, and hands-on training so your team is productive on day one, not week three.', 'infillpk' ), 'bullets' => array( __( 'Machine setup and calibration', 'infillpk' ), __( 'Operator training sessions', 'infillpk' ), __( 'Workflow and slicer configuration', 'infillpk' ) ) ),
				array( 'headline' => __( 'Long-term assistance after purchase.', 'infillpk' ), 'description' => __( 'Machines are only as good as the support behind them. Ongoing troubleshooting, maintenance guidance and spare parts access.', 'infillpk' ), 'bullets' => array( __( 'Remote troubleshooting', 'infillpk' ), __( 'Maintenance scheduling', 'infillpk' ), __( 'Genuine spare parts access', 'infillpk' ) ) ),
			);
			foreach ( $services as $svc ) :
				?>
				<div class="rounded-xl border border-border bg-surface p-6">
					<h3 class="font-display mt-3 text-base font-semibold text-ink"><?php echo esc_html( $svc['headline'] ); ?></h3>
					<p class="mt-2 text-sm text-ink-muted"><?php echo esc_html( $svc['description'] ); ?></p>
					<ul class="mt-4 space-y-1.5">
						<?php foreach ( $svc['bullets'] as $b ) : ?>
							<li class="text-xs text-ink-muted before:mr-1.5 before:text-blue-700 before:content-['—']"><?php echo esc_html( $b ); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
			<?php endforeach; ?>
		</div>
		<a href="<?php echo esc_url( home_url( '/services/' ) ); ?>" class="focus-ring mt-8 inline-flex text-sm font-medium text-blue-700 hover:text-blue-600">
			<?php esc_html_e( 'Learn more about our services', 'infillpk' ); ?> &rarr;
		</a>
	</section>

	<!-- ===== INFiLL Lab (live WP_Query on Posts) ===== -->
	<?php
	$lab_query = new WP_Query(
		array(
			'post_type'      => 'post',
			'posts_per_page' => 3,
			'category_name'  => 'infill-lab',
		)
	);
	if ( $lab_query->have_posts() ) :
		?>
		<section class="container-page py-20 sm:py-28">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<?php infillpk_section_heading( array( 'eyebrow' => __( 'INFiLL Lab', 'infillpk' ), 'title' => __( 'Learn before you buy.', 'infillpk' ) ) ); ?>
				<a href="<?php echo esc_url( get_category_link( get_category_by_slug( 'infill-lab' ) ) ); ?>" class="focus-ring hidden shrink-0 items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-600 sm:flex">
					<?php esc_html_e( 'Visit INFiLL Lab', 'infillpk' ); ?> &rarr;
				</a>
			</div>
			<div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
				<?php
				while ( $lab_query->have_posts() ) :
					$lab_query->the_post();
					?>
					<a href="<?php the_permalink(); ?>" class="focus-ring group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-blue-300">
						<p class="mt-3 text-xs font-medium uppercase tracking-wide text-ink-faint">
							<?php
							/* translators: %s: reading time in minutes. */
							printf( esc_html__( '%s min read', 'infillpk' ), esc_html( infillpk_reading_time( get_the_content() ) ) );
							?>
						</p>
						<h3 class="font-display mt-2 text-lg font-semibold text-ink group-hover:text-blue-700"><?php the_title(); ?></h3>
						<p class="mt-2 text-sm text-ink-muted"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?></p>
					</a>
					<?php
				endwhile;
				wp_reset_postdata();
				?>
			</div>
		</section>
	<?php endif; ?>

	<!-- ===== Final CTA ===== -->
	<section class="bg-navy-900 py-20 text-on-navy sm:py-28">
		<div class="container-page text-center">
			<h2 class="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
				<?php esc_html_e( 'Make something that matters.', 'infillpk' ); ?>
			</h2>
			<p class="mx-auto mt-4 max-w-xl text-on-navy-muted">
				<?php esc_html_e( "Whether you're printing your first model or building your next product, INFiLLPK gives you the technology to make it real.", 'infillpk' ); ?>
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-3">
				<a href="<?php echo esc_url( infillpk_shop_url( '3d-printers' ) ); ?>" class="focus-ring inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
					<?php esc_html_e( 'Shop 3D Printers', 'infillpk' ); ?>
				</a>
				<a href="<?php echo esc_url( home_url( '/about/' ) ); ?>" class="focus-ring inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-on-navy hover:bg-white/10 transition-colors">
					<?php esc_html_e( 'Explore INFiLLPK', 'infillpk' ); ?>
				</a>
			</div>
		</div>
	</section>

</main>

<?php
get_footer();
