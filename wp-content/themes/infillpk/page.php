<?php
/**
 * Default page template. Elementor's own Canvas / Full Width page templates
 * bypass this file entirely (Elementor hooks `template_include` for those).
 * A page left on "Default (from theme)" still renders through here, though —
 * so when that page's content was built with Elementor, this skips the
 * prose/max-width wrapper (which would otherwise clip Elementor's own
 * full-width sections) and lets Elementor's output run edge-to-edge.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();

while ( have_posts() ) :
	the_post();

	$is_elementor_page = did_action( 'elementor/loaded' ) && \Elementor\Plugin::$instance->documents->get( get_the_ID() )->is_built_with_elementor();
	?>
	<main id="primary" class="site-main <?php echo $is_elementor_page ? '' : 'container-page py-16'; ?>">
		<?php if ( $is_elementor_page ) : ?>
			<?php the_content(); ?>
		<?php else : ?>
			<article <?php post_class( 'prose max-w-3xl mx-auto' ); ?>>
				<h1 class="font-display text-3xl font-semibold text-ink sm:text-4xl"><?php the_title(); ?></h1>
				<div class="mt-6 text-ink-muted">
					<?php the_content(); ?>
				</div>
			</article>
		<?php endif; ?>
	</main>
	<?php
endwhile;

get_footer();
