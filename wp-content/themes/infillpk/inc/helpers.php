<?php
/**
 * Small template helpers shared across templates.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function infillpk_reading_time( $content ) {
	$words = str_word_count( wp_strip_all_tags( $content ) );
	return max( 1, (int) round( $words / 200 ) );
}

/**
 * Section eyebrow + title + description block, ported from
 * src/components/ui/section-heading.tsx.
 */
function infillpk_section_heading( $args ) {
	$args = wp_parse_args(
		$args,
		array(
			'eyebrow'     => '',
			'title'       => '',
			'description' => '',
			'inverted'    => false,
			'class'       => '',
		)
	);

	$title_color = $args['inverted'] ? 'text-on-navy' : 'text-ink';
	$eyebrow_color = $args['inverted'] ? 'text-blue-300' : 'text-blue-700';
	$desc_color = $args['inverted'] ? 'text-on-navy-muted' : 'text-ink-muted';
	?>
	<div class="max-w-2xl <?php echo esc_attr( $args['class'] ); ?>">
		<?php if ( $args['eyebrow'] ) : ?>
			<p class="mb-3 text-xs font-semibold uppercase tracking-wide <?php echo esc_attr( $eyebrow_color ); ?>"><?php echo esc_html( $args['eyebrow'] ); ?></p>
		<?php endif; ?>
		<h2 class="font-display text-3xl font-semibold tracking-tight sm:text-4xl <?php echo esc_attr( $title_color ); ?>"><?php echo esc_html( $args['title'] ); ?></h2>
		<?php if ( $args['description'] ) : ?>
			<p class="mt-3 text-base <?php echo esc_attr( $desc_color ); ?>"><?php echo esc_html( $args['description'] ); ?></p>
		<?php endif; ?>
	</div>
	<?php
}
