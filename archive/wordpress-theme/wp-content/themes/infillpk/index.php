<?php
/**
 * Fallback template (also used for the blog/post archives).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main container-page py-16">
	<?php if ( have_posts() ) : ?>
		<div class="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
			<?php
			while ( have_posts() ) :
				the_post();
				get_template_part( 'template-parts/content', get_post_type() );
			endwhile;
			?>
		</div>
		<div class="mt-12">
			<?php the_posts_pagination(); ?>
		</div>
	<?php else : ?>
		<p class="text-ink-muted"><?php esc_html_e( 'Nothing found.', 'infillpk' ); ?></p>
	<?php endif; ?>
</main>

<?php
get_footer();
