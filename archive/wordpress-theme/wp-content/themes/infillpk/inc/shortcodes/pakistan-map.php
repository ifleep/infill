<?php
/**
 * [infillpk_pakistan_map] — interactive Pakistan regions map.
 * Ported from archive/nextjs-prototype/src/lib/data/pakistan-regions.ts and
 * src/components/pakistan/pakistan-map-section.tsx. An abstract, stylized
 * hotspot layout (not survey-accurate boundaries) evoking Pakistan's relative
 * geography, with a click/hover-revealed side panel per region.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function infillpk_pakistan_regions() {
	return array(
		array( 'id' => 'gb', 'name' => __( 'Gilgit-Baltistan', 'infillpk' ), 'short' => 'GB', 'motif' => __( 'Angular peak lattice — echoing the high mountain ranges of the north.', 'infillpk' ), 'copy' => __( "Home to some of the world's highest peaks, and the northern edge of INFiLLPK's reach.", 'infillpk' ), 'cx' => 150, 'cy' => 46, 'rx' => 46, 'ry' => 34 ),
		array( 'id' => 'kp', 'name' => __( 'Khyber Pakhtunkhwa', 'infillpk' ), 'short' => 'KP', 'motif' => __( 'Interlocking geometric border pattern drawn from Pashtun textile motifs.', 'infillpk' ), 'copy' => __( 'A growing base of makers and technical institutes across the province.', 'infillpk' ), 'cx' => 104, 'cy' => 118, 'rx' => 42, 'ry' => 40 ),
		array( 'id' => 'ajk', 'name' => __( 'Azad Jammu & Kashmir', 'infillpk' ), 'short' => 'AJK', 'motif' => __( 'Layered chevrons, referencing the terraced valleys of the region.', 'infillpk' ), 'copy' => __( 'Reachable through the same nationwide shipping network as every other region.', 'infillpk' ), 'cx' => 202, 'cy' => 120, 'rx' => 34, 'ry' => 32 ),
		array( 'id' => 'isb', 'name' => __( 'Islamabad', 'infillpk' ), 'short' => 'ISB', 'motif' => __( "A single precise grid mark — the capital, and INFiLLPK's logistics hub.", 'infillpk' ), 'copy' => __( 'Central hub for support, service and same-day dispatch across the twin cities.', 'infillpk' ), 'cx' => 158, 'cy' => 150, 'rx' => 14, 'ry' => 12 ),
		array( 'id' => 'punjab', 'name' => __( 'Punjab', 'infillpk' ), 'short' => 'Punjab', 'motif' => __( 'Repeating diamond lattice, drawn from Punjabi phulkari geometry.', 'infillpk' ), 'copy' => __( "Pakistan's manufacturing heartland — and the largest concentration of INFiLLPK customers.", 'infillpk' ), 'cx' => 172, 'cy' => 220, 'rx' => 58, 'ry' => 66 ),
		array( 'id' => 'balochistan', 'name' => __( 'Balochistan', 'infillpk' ), 'short' => 'Balochistan', 'motif' => __( 'Wide angular embroidery pattern inspired by Balochi needlework.', 'infillpk' ), 'copy' => __( "Pakistan's largest province by area — served the same as every other, no distance surcharge.", 'infillpk' ), 'cx' => 84, 'cy' => 300, 'rx' => 72, 'ry' => 84 ),
		array( 'id' => 'sindh', 'name' => __( 'Sindh', 'infillpk' ), 'short' => 'Sindh', 'motif' => __( "Ajrak block-print rhythm — one of Pakistan's most recognizable textile crafts.", 'infillpk' ), 'copy' => __( "From Karachi's industrial base to university labs across the province.", 'infillpk' ), 'cx' => 196, 'cy' => 320, 'rx' => 46, 'ry' => 60 ),
	);
}

function infillpk_pakistan_map_shortcode() {
	$regions = infillpk_pakistan_regions();
	ob_start();
	?>
	<section class="bg-surface-sunken py-20 sm:py-28">
		<div class="container-page">
			<?php
			infillpk_section_heading(
				array(
					'eyebrow'     => __( 'Nationwide', 'infillpk' ),
					'title'       => __( 'Serving every region of Pakistan.', 'infillpk' ),
					'description' => __( 'Select a region to learn more.', 'infillpk' ),
				)
			);
			?>
			<div class="js-pakistan-map mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
				<svg viewBox="0 0 300 420" class="mx-auto h-auto w-full max-w-xs" role="img" aria-label="<?php esc_attr_e( 'Map of Pakistan regions', 'infillpk' ); ?>">
					<?php foreach ( $regions as $r ) : ?>
						<ellipse
							class="js-pakistan-region cursor-pointer fill-blue-100 stroke-blue-500 transition-colors hover:fill-blue-300 focus-visible:fill-blue-300"
							data-region="<?php echo esc_attr( $r['id'] ); ?>"
							tabindex="0"
							role="button"
							aria-label="<?php echo esc_attr( $r['name'] ); ?>"
							cx="<?php echo esc_attr( $r['cx'] ); ?>" cy="<?php echo esc_attr( $r['cy'] ); ?>"
							rx="<?php echo esc_attr( $r['rx'] ); ?>" ry="<?php echo esc_attr( $r['ry'] ); ?>"
							stroke-width="1.5"
						></ellipse>
						<text x="<?php echo esc_attr( $r['cx'] ); ?>" y="<?php echo esc_attr( $r['cy'] ); ?>" text-anchor="middle" dominant-baseline="middle" class="pointer-events-none select-none fill-blue-900 text-[9px] font-medium"><?php echo esc_html( $r['short'] ); ?></text>
					<?php endforeach; ?>
				</svg>

				<div>
					<?php foreach ( $regions as $i => $r ) : ?>
						<div class="js-pakistan-panel <?php echo 0 === $i ? '' : 'hidden'; ?> rounded-2xl border border-border bg-surface p-6 sm:p-8" data-region-panel="<?php echo esc_attr( $r['id'] ); ?>">
							<p class="text-xs font-semibold uppercase tracking-wide text-blue-700"><?php echo esc_html( $r['short'] ); ?></p>
							<h3 class="font-display mt-1 text-xl font-semibold text-ink"><?php echo esc_html( $r['name'] ); ?></h3>
							<p class="mt-3 text-sm text-ink-muted"><?php echo esc_html( $r['copy'] ); ?></p>
							<p class="mt-4 text-xs italic text-ink-faint"><?php echo esc_html( $r['motif'] ); ?></p>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</div>
	</section>
	<?php
	return ob_get_clean();
}
add_shortcode( 'infillpk_pakistan_map', 'infillpk_pakistan_map_shortcode' );
