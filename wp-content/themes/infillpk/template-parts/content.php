<?php
/**
 * Post card used in archive/blog listings (index.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<article <?php post_class( 'group' ); ?>>
	<a href="<?php the_permalink(); ?>" class="focus-ring block">
		<?php if ( has_post_thumbnail() ) : ?>
			<div class="aspect-[4/3] overflow-hidden rounded-xl bg-surface-sunken">
				<?php the_post_thumbnail( 'infillpk-product-card', array( 'class' => 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105' ) ); ?>
			</div>
		<?php endif; ?>
		<h2 class="font-display mt-4 text-lg font-semibold text-ink group-hover:text-blue-600"><?php the_title(); ?></h2>
		<p class="mt-2 text-sm text-ink-muted"><?php echo esc_html( wp_trim_words( get_the_excerpt(), 20 ) ); ?></p>
	</a>
</article>
