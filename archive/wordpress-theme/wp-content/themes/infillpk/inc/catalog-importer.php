<?php
/**
 * Shared logic for loading tools/data/{brands,products}.json (the demo
 * catalog extracted from the archived Next.js prototype — real brand names,
 * real public specs) into WooCommerce as real products, categories, the
 * `product_brand` taxonomy, and the pa_technology / pa_experience-level /
 * pa_use-case / pa_machine-category attributes.
 *
 * Used by both tools/import-products.php (CLI, needs SSH) and the wp-admin
 * "Import Demo Catalog" page under Tools (inc/admin/catalog-import-page.php,
 * no SSH needed) — kept in one place so both stay in sync.
 *
 * Safe to re-run: products are upserted by slug/SKU.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function infillpk_import_term( $name, $taxonomy, $parent_id, array &$log ) {
	$slug = sanitize_title( $name );
	$existing = get_term_by( 'slug', $slug, $taxonomy );
	if ( $existing ) {
		return $existing->term_id;
	}
	$result = wp_insert_term( $name, $taxonomy, array( 'slug' => $slug, 'parent' => $parent_id ) );
	if ( is_wp_error( $result ) ) {
		$log[] = "! failed to create term '$name' in $taxonomy: " . $result->get_error_message();
		return 0;
	}
	return $result['term_id'];
}

/**
 * Runs the full import and returns an array of human-readable log lines.
 * Requires WooCommerce to be active.
 */
function infillpk_run_catalog_import() {
	$log = array();

	if ( ! class_exists( 'WooCommerce' ) ) {
		$log[] = 'WooCommerce is not active — activate it first.';
		return $log;
	}

	$data_dir = INFILLPK_DIR . '/tools/data';
	$brands   = json_decode( file_get_contents( $data_dir . '/brands.json' ), true );
	$products = json_decode( file_get_contents( $data_dir . '/products.json' ), true );

	if ( ! $brands || ! $products ) {
		$log[] = 'Could not read tools/data/brands.json or tools/data/products.json.';
		return $log;
	}

	/**
	 * category (seed data) -> [ WooCommerce product_cat slug, label ]
	 * Mirrors archive/nextjs-prototype/src/lib/data/categories.ts.
	 */
	$category_map = array(
		'printers' => array( '3d-printers', 'printers' ),
		'filament' => array( 'filament', 'filament' ),
		'resin'    => array( 'resin', 'resin' ),
		'parts'    => array( 'parts-accessories', 'parts' ),
		'machines' => array( 'machines', 'machines' ),
	);

	// ---------------------------------------------------------------- Brands
	$log[] = 'Importing ' . count( $brands ) . ' brands into product_brand...';
	$brand_term_ids = array();
	foreach ( $brands as $brand ) {
		$term_id = infillpk_import_term( $brand['name'], 'product_brand', 0, $log );
		if ( $term_id ) {
			update_term_meta( $term_id, 'country', $brand['country'] );
			update_term_meta( $term_id, 'description_short', $brand['description'] );
			wp_update_term( $term_id, 'product_brand', array( 'description' => $brand['description'] ) );
		}
		$brand_term_ids[ $brand['id'] ] = $term_id;
	}

	// ---------------------------------------------------------------- Categories
	$log[] = 'Importing product categories...';
	$category_term_ids = array();
	foreach ( $category_map as $seed_key => $info ) {
		list( $slug, $label ) = $info;
		$existing = get_term_by( 'slug', $slug, 'product_cat' );
		if ( $existing ) {
			$category_term_ids[ $seed_key ] = $existing->term_id;
			continue;
		}
		$result = wp_insert_term( ucwords( str_replace( '-', ' ', $slug ) ), 'product_cat', array( 'slug' => $slug ) );
		$category_term_ids[ $seed_key ] = is_wp_error( $result ) ? 0 : $result['term_id'];
	}

	$subcategory_term_ids = array();

	// ---------------------------------------------------------------- Products
	$log[] = 'Importing ' . count( $products ) . ' products...';

	foreach ( $products as $p ) {
		$slug = $p['slug'];
		$existing_id = wc_get_product_id_by_sku( $p['id'] );
		if ( ! $existing_id ) {
			$existing_page = get_page_by_path( $slug, OBJECT, 'product' );
			$existing_id = $existing_page ? $existing_page->ID : 0;
		}

		$product = $existing_id ? wc_get_product( $existing_id ) : new WC_Product_Simple();

		$product->set_name( $p['name'] );
		$product->set_slug( $slug );
		$product->set_sku( $p['id'] );
		$product->set_description( $p['description'] );
		$product->set_short_description( $p['shortDescription'] );
		$product->set_catalog_visibility( 'visible' );
		$product->set_status( 'publish' );

		// Price: seed data's `compareAtPrice` (when present) is the crossed-out
		// "was" price and `price` is what the customer actually pays — i.e.
		// WooCommerce's regular_price / sale_price pair.
		if ( ! empty( $p['compareAtPrice'] ) ) {
			$product->set_regular_price( (string) $p['compareAtPrice'] );
			$product->set_sale_price( (string) $p['price'] );
		} else {
			$product->set_regular_price( (string) $p['price'] );
			$product->set_sale_price( '' );
		}

		// Stock: availability (in-stock/out-of-stock/preorder) reuses WooCommerce's
		// native stock status; preorder is layered on top via a tag (see inc/woocommerce.php).
		$product->set_manage_stock( true );
		$product->set_stock_quantity( $p['stock'] );
		$product->set_stock_status( $p['stock'] > 0 ? 'instock' : 'outofstock' );

		if ( ! empty( $p['weightKg'] ) ) {
			$product->set_weight( $p['weightKg'] );
		}
		if ( ! empty( $p['dimensions'] ) ) {
			// WooCommerce dimensions default to cm; seed data is in mm.
			$product->set_length( round( $p['dimensions']['depth'] / 10, 1 ) );
			$product->set_width( round( $p['dimensions']['width'] / 10, 1 ) );
			$product->set_height( round( $p['dimensions']['height'] / 10, 1 ) );
		}

		// Categories: top-level + a subcategory child term.
		$cat_ids = array();
		$seed_cat = $p['category'];
		if ( isset( $category_term_ids[ $seed_cat ] ) && $category_term_ids[ $seed_cat ] ) {
			$cat_ids[] = $category_term_ids[ $seed_cat ];
		}
		if ( ! empty( $p['subcategory'] ) ) {
			$key = $seed_cat . ':' . $p['subcategory'];
			if ( ! isset( $subcategory_term_ids[ $key ] ) ) {
				$subcategory_term_ids[ $key ] = infillpk_import_term( $p['subcategory'], 'product_cat', $category_term_ids[ $seed_cat ] ?? 0, $log );
			}
			if ( $subcategory_term_ids[ $key ] ) {
				$cat_ids[] = $subcategory_term_ids[ $key ];
			}
		}
		$product->set_category_ids( array_unique( $cat_ids ) );

		// Tags.
		if ( ! empty( $p['tags'] ) ) {
			$product->set_tag_ids(
				array_map(
					function ( $tag ) use ( &$log ) {
						return infillpk_import_term( $tag, 'product_tag', 0, $log );
					},
					$p['tags']
				)
			);
		}

		if ( ! empty( $p['featured'] ) ) {
			$product->set_featured( true );
		}

		$product_id = $product->save();

		// Brand needs the real product_id (new products don't have one until save()).
		if ( ! empty( $brand_term_ids[ $p['brandId'] ] ) ) {
			wp_set_object_terms( $product_id, array( (int) $brand_term_ids[ $p['brandId'] ] ), 'product_brand' );
		}

		// Attributes (technology / experience level / use case / machine category)
		// as WooCommerce global (taxonomy-backed) product attributes.
		$wc_attributes = array();
		$attr_values = array(
			'pa_technology'       => ! empty( $p['technology'] ) ? array( $p['technology'] ) : array(),
			'pa_experience-level' => $p['experienceLevel'] ?? array(),
			'pa_use-case'         => $p['useCases'] ?? array(),
			'pa_machine-category' => ! empty( $p['machineCategory'] ) ? array( $p['machineCategory'] ) : array(),
		);
		foreach ( $attr_values as $taxonomy => $values ) {
			if ( empty( $values ) ) {
				continue;
			}
			$term_ids = array();
			foreach ( $values as $value ) {
				$term_ids[] = infillpk_import_term( $value, $taxonomy, 0, $log );
			}
			wp_set_object_terms( $product_id, array_filter( $term_ids ), $taxonomy );

			$attribute = new WC_Product_Attribute();
			$attribute->set_id( wc_attribute_taxonomy_id_by_name( $taxonomy ) );
			$attribute->set_name( $taxonomy );
			$attribute->set_options( array_filter( $term_ids ) );
			$attribute->set_visible( true );
			$attribute->set_variation( false );
			$wc_attributes[] = $attribute;
		}
		if ( $wc_attributes ) {
			$product = wc_get_product( $product_id );
			$product->set_attributes( $wc_attributes );
			$product->save();
		}

		// Catalog facts with no native WooCommerce field (build volume, print
		// speed, materials, structured specs, warranty, rating/reviews carried
		// over as display data) — stored as product meta since there's nothing
		// built-in to reuse for these.
		update_post_meta( $product_id, '_infillpk_specifications', wp_json_encode( $p['specifications'] ?? array() ) );
		if ( ! empty( $p['materials'] ) ) {
			update_post_meta( $product_id, '_infillpk_materials', wp_json_encode( $p['materials'] ) );
		}
		if ( ! empty( $p['buildVolume'] ) ) {
			update_post_meta( $product_id, '_infillpk_build_volume', wp_json_encode( $p['buildVolume'] ) );
		}
		if ( ! empty( $p['speedMmPerSec'] ) ) {
			update_post_meta( $product_id, '_infillpk_speed_mm_s', $p['speedMmPerSec'] );
		}
		if ( ! empty( $p['warrantyMonths'] ) ) {
			update_post_meta( $product_id, '_infillpk_warranty_months', $p['warrantyMonths'] );
		}
		if ( ! empty( $p['rating'] ) ) {
			update_post_meta( $product_id, '_wc_average_rating', $p['rating'] );
		}
		if ( ! empty( $p['reviewCount'] ) ) {
			update_post_meta( $product_id, '_wc_review_count', $p['reviewCount'] );
		}
		if ( ! empty( $p['quoteOnly'] ) ) {
			update_post_meta( $product_id, '_infillpk_quote_only', '1' );
		}

		$log[] = "imported: {$p['name']} (#$product_id)";
	}

	$log[] = 'Done.';

	return $log;
}
