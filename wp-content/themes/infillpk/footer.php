<?php
/**
 * Site footer.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
</div><!-- #content -->

<footer class="mt-24 bg-navy-900 text-on-navy">
	<div class="container-page grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
		<div>
			<span class="font-display text-lg font-semibold text-on-navy"><?php bloginfo( 'name' ); ?></span>
			<p class="mt-3 max-w-xs text-sm text-on-navy-muted"><?php bloginfo( 'description' ); ?></p>
		</div>

		<?php if ( is_active_sidebar( 'footer-1' ) ) : ?>
			<div class="footer-widgets col-span-1 grid grid-cols-1 gap-8 sm:col-span-1 lg:col-span-2 lg:grid-cols-2">
				<?php dynamic_sidebar( 'footer-1' ); ?>
			</div>
		<?php else : ?>
			<div>
				<h3 class="text-sm font-semibold text-on-navy">
					<?php esc_html_e( 'Shop', 'infillpk' ); ?>
				</h3>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => 'footer',
						'container'      => false,
						'menu_class'     => 'mt-3 space-y-2 text-sm text-on-navy-muted',
						'fallback_cb'    => false,
					)
				);
				?>
			</div>
		<?php endif; ?>

		<div>
			<h3 class="text-sm font-semibold text-on-navy"><?php esc_html_e( 'Contact', 'infillpk' ); ?></h3>
			<p class="mt-3 text-sm text-on-navy-muted"><?php echo esc_html( get_theme_mod( 'infillpk_contact_email', 'hello@infillpk.com' ) ); ?></p>
		</div>
	</div>

	<div class="border-t border-border-on-navy py-6">
		<div class="container-page flex flex-col items-center justify-between gap-2 text-xs text-on-navy-muted sm:flex-row">
			<p>&copy; <?php echo esc_html( gmdate( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?>. <?php esc_html_e( 'All rights reserved.', 'infillpk' ); ?></p>
		</div>
	</div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
