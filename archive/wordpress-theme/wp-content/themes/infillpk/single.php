<?php
/**
 * Single post template — used for INFiLL Lab articles (a WP category on
 * regular Posts, not a custom post type; Posts already provide everything
 * an article hub needs).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

get_header();
?>

<main id="primary" class="site-main container-page py-16">
	<?php
	while ( have_posts() ) :
		the_post();
		?>
		<article <?php post_class( 'mx-auto max-w-3xl' ); ?>>
			<header class="mb-8">
				<?php
				$categories = get_the_category();
				if ( $categories ) :
					?>
					<p class="text-xs font-semibold uppercase tracking-wide text-blue-600"><?php echo esc_html( $categories[0]->name ); ?></p>
				<?php endif; ?>
				<h1 class="font-display mt-2 text-3xl font-semibold text-ink sm:text-4xl"><?php the_title(); ?></h1>
				<p class="mt-3 text-sm text-ink-faint">
					<?php echo esc_html( get_the_date() ); ?>
					&middot;
					<?php
					/* translators: %s: reading time in minutes. */
					printf( esc_html__( '%s min read', 'infillpk' ), esc_html( infillpk_reading_time( get_the_content() ) ) );
					?>
				</p>
			</header>

			<?php if ( has_post_thumbnail() ) : ?>
				<div class="mb-10 overflow-hidden rounded-2xl">
					<?php the_post_thumbnail( 'infillpk-hero', array( 'class' => 'w-full h-auto object-cover' ) ); ?>
				</div>
			<?php endif; ?>

			<div class="prose prose-neutral max-w-none text-ink">
				<?php the_content(); ?>
			</div>
		</article>
		<?php
	endwhile;
	?>
</main>

<?php
get_footer();
