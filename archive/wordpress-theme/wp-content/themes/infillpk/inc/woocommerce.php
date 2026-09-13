<?php
/**
 * WooCommerce integration glue. We rely on WooCommerce's own templates/hooks for
 * everything (cart, checkout, my-account, product loop, single product) — the
 * `woocommerce/` folder only overrides markup where the design genuinely differs
 * from the WooCommerce default, per WooCommerce's own template hierarchy.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce expects the theme to wrap its templates in the theme's own
 * <main> markup — classic (non-block) themes must supply these wrapper hooks.
 */
function infillpk_wc_content_wrapper_start() {
	echo '<main id="primary" class="site-main container-page">';
}
add_action( 'woocommerce_before_main_content', 'infillpk_wc_content_wrapper_start' );

function infillpk_wc_content_wrapper_end() {
	echo '</main>';
}
add_action( 'woocommerce_after_main_content', 'infillpk_wc_content_wrapper_end' );

// Use our own product grid columns.
function infillpk_wc_loop_columns() {
	return 4;
}
add_filter( 'loop_shop_columns', 'infillpk_wc_loop_columns' );

// Number of products per page.
add_filter(
	'loop_shop_per_page',
	function () {
		return 24;
	},
	20
);

/**
 * WooCommerce core has no brand taxonomy (that's the paid "WooCommerce
 * Brands" extension) — this is the one place a custom taxonomy is justified,
 * since there's no built-in equivalent to reuse.
 */
function infillpk_register_brand_taxonomy() {
	register_taxonomy(
		'product_brand',
		'product',
		array(
			'label'             => __( 'Brands', 'infillpk' ),
			'hierarchical'      => false,
			'public'            => true,
			'show_ui'           => true,
			'show_in_nav_menus' => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rewrite'           => array( 'slug' => 'brand' ),
		)
	);
}
add_action( 'init', 'infillpk_register_brand_taxonomy' );

/**
 * Register the product attributes the catalog relies on (technology,
 * experience level, use case) if they don't already exist, so the WooCommerce
 * product importer (tools/import-products.php) has somewhere to write to.
 * Safe to run multiple times — wc_create_attribute() checks for an existing
 * attribute by slug first.
 */
function infillpk_register_product_attributes() {
	if ( ! function_exists( 'wc_create_attribute' ) || ! function_exists( 'wc_attribute_taxonomy_name' ) ) {
		return;
	}

	$attributes = array(
		'technology'       => __( 'Technology', 'infillpk' ),
		'experience-level' => __( 'Experience Level', 'infillpk' ),
		'use-case'         => __( 'Use Case', 'infillpk' ),
		'machine-category' => __( 'Machine Category', 'infillpk' ),
	);

	foreach ( $attributes as $slug => $label ) {
		if ( taxonomy_exists( wc_attribute_taxonomy_name( $slug ) ) ) {
			continue;
		}

		wc_create_attribute(
			array(
				'name'         => $label,
				'slug'         => $slug,
				'type'         => 'select',
				'order_by'     => 'menu_order',
				'has_archives' => false,
			)
		);
	}
}
add_action( 'init', 'infillpk_register_product_attributes', 20 );

/**
 * Availability (in-stock / out-of-stock / preorder) reuses WooCommerce's native
 * stock status field — "preorder" is stored as a product tag `preorder` layered
 * on top of WooCommerce's own stock status, rather than a bespoke meta field,
 * since WooCommerce has no third native state.
 */
function infillpk_is_preorder( $product ) {
	return $product && has_term( 'preorder', 'product_tag', $product->get_id() );
}

/**
 * Build a product-category archive URL, optionally with WooCommerce's native
 * `filter_{attribute}` query vars (its built-in attribute-filtering
 * mechanism — see WC_Query::get_layered_nav_chosen_attributes()) so "Shop by
 * technology / experience / use case" links need no custom filtering code.
 */
function infillpk_shop_url( $category_slug, $filters = array() ) {
	$term = get_term_by( 'slug', $category_slug, 'product_cat' );
	$url  = $term ? get_term_link( $term ) : ( function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'shop' ) : home_url( '/' ) );

	if ( is_wp_error( $url ) ) {
		$url = home_url( '/' );
	}

	if ( ! empty( $filters ) ) {
		$query_args = array();
		foreach ( $filters as $attribute => $value ) {
			$query_args[ 'filter_' . $attribute ] = sanitize_title( $value );
		}
		$url = add_query_arg( $query_args, $url );
	}

	return $url;
}

function infillpk_availability_label( $product ) {
	if ( infillpk_is_preorder( $product ) ) {
		return __( 'Preorder', 'infillpk' );
	}
	if ( ! $product->is_in_stock() ) {
		return __( 'Out of stock', 'infillpk' );
	}
	return __( 'In stock', 'infillpk' );
}
