<?php
/**
 * Product card — overrides WooCommerce's default content-product.php
 * (loaded by the shop archive loop, related products, and our own
 * wc_get_template_part('content', 'product') calls) to match the design
 * ported from src/components/product/product-card.tsx. Everything here is
 * still driven by WooCommerce's own product object/price/stock APIs —
 * only the markup differs from the WooCommerce default.
 *
 * @package WooCommerce
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $product;

if ( ! $product || ! $product->is_visible() ) {
	return;
}

$availability_label = infillpk_availability_label( $product );
$is_preorder = infillpk_is_preorder( $product );
$is_out_of_stock = ! $product->is_in_stock();
$specs = json_decode( get_post_meta( $product->get_id(), '_infillpk_specifications', true ), true );
$build_volume = json_decode( get_post_meta( $product->get_id(), '_infillpk_build_volume', true ), true );
$key_spec = '';
if ( is_array( $build_volume ) && isset( $build_volume['x'] ) ) {
	$key_spec = "{$build_volume['x']} × {$build_volume['y']} × {$build_volume['z']} mm";
} elseif ( is_array( $specs ) && ! empty( $specs ) ) {
	$key_spec = $specs[0]['value'] ?? '';
}
$brand_terms = get_the_terms( $product->get_id(), 'product_brand' );
$brand_name = $brand_terms && ! is_wp_error( $brand_terms ) ? $brand_terms[0]->name : '';
$is_quote_only = (bool) get_post_meta( $product->get_id(), '_infillpk_quote_only', true );
?>
<li <?php wc_product_class( 'group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md list-none', $product ); ?>>
	<a href="<?php the_permalink(); ?>" class="focus-ring relative block p-4 pb-0">
		<div class="aspect-square overflow-hidden rounded-lg bg-surface-sunken">
			<?php echo $product->get_image( 'infillpk-product-card', array( 'class' => 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]' ) ); ?>
		</div>
		<?php if ( $product->is_on_sale() ) : ?>
			<span class="absolute left-6 top-6 rounded bg-destructive px-2 py-0.5 text-xs font-semibold text-white"><?php esc_html_e( 'Sale', 'infillpk' ); ?></span>
		<?php endif; ?>
	</a>

	<div class="flex flex-1 flex-col p-4">
		<?php if ( $brand_name ) : ?>
			<p class="text-xs uppercase tracking-wide text-ink-faint"><?php echo esc_html( $brand_name ); ?></p>
		<?php endif; ?>

		<a href="<?php the_permalink(); ?>" class="focus-ring mt-0.5 text-sm font-semibold text-ink hover:text-blue-700"><?php the_title(); ?></a>

		<?php if ( $key_spec ) : ?>
			<p class="mt-1 text-xs text-ink-muted"><?php echo esc_html( $key_spec ); ?></p>
		<?php endif; ?>

		<?php if ( $is_out_of_stock || $is_preorder ) : ?>
			<div class="mt-1.5">
				<span class="inline-flex items-center gap-1 text-xs font-medium <?php echo $is_preorder ? 'text-blue-700' : 'text-destructive'; ?>">
					<?php echo esc_html( $availability_label ); ?>
				</span>
			</div>
		<?php endif; ?>

		<?php if ( $product->get_average_rating() ) : ?>
			<div class="mt-1.5 flex items-center gap-1 text-xs text-ink-muted">
				<span class="text-amber-600">&#9733;</span>
				<span class="tabular"><?php echo esc_html( $product->get_average_rating() ); ?></span>
				<span class="text-ink-faint">(<?php echo esc_html( $product->get_review_count() ); ?>)</span>
			</div>
		<?php endif; ?>

		<div class="mt-3 flex items-baseline gap-2 tabular">
			<?php echo wp_kses_post( $product->get_price_html() ); ?>
		</div>

		<div class="mt-4 flex gap-2">
			<?php if ( $is_quote_only ) : ?>
				<a href="<?php echo esc_url( add_query_arg( array( 'type' => 'quote', 'product' => $product->get_slug() ), home_url( '/contact/' ) ) ); ?>" class="focus-ring flex h-9 flex-1 items-center justify-center rounded bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-600">
					<?php esc_html_e( 'Request a Quote', 'infillpk' ); ?>
				</a>
			<?php elseif ( $is_out_of_stock ) : ?>
				<button disabled class="flex h-9 flex-1 cursor-not-allowed items-center justify-center rounded bg-surface-sunken px-3 text-sm font-medium text-ink-faint">
					<?php esc_html_e( 'Out of Stock', 'infillpk' ); ?>
				</button>
			<?php else : ?>
				<?php
				echo apply_filters( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
					'woocommerce_loop_add_to_cart_link',
					sprintf(
						'<a href="%s" data-quantity="1" class="%s" %s>%s</a>',
						esc_url( $product->add_to_cart_url() ),
						esc_attr( 'focus-ring flex h-9 flex-1 items-center justify-center gap-1.5 rounded bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-600 ' . implode( ' ', array_filter( array( 'add_to_cart_button', 'ajax_add_to_cart' ) ) ) ),
						'data-product_id="' . esc_attr( $product->get_id() ) . '" data-product_sku="' . esc_attr( $product->get_sku() ) . '" aria-label="' . esc_attr( $product->add_to_cart_description() ) . '" rel="nofollow"',
						esc_html( $is_preorder ? __( 'Preorder', 'infillpk' ) : $product->add_to_cart_text() )
					),
					$product
				);
				?>
			<?php endif; ?>
			<a href="<?php the_permalink(); ?>" class="focus-ring flex h-9 flex-1 items-center justify-center rounded border border-border-strong px-3 text-sm font-medium text-ink hover:bg-surface-sunken">
				<?php esc_html_e( 'View Details', 'infillpk' ); ?>
			</a>
		</div>
	</div>
</li>
