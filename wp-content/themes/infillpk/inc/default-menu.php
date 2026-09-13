<?php
/**
 * Auto-creates the Primary mega menu and Footer menu on theme activation,
 * mirroring archive/nextjs-prototype/src/components/layout/nav-data.ts —
 * so the site has a real, correctly-structured nav menu immediately instead
 * of falling back to a plain list of every page (including WooCommerce's own
 * Cart/Checkout/My Account infrastructure pages, which don't belong in a nav
 * next to the cart/account icons already in the header).
 *
 * Everything here is just pre-filling real WP nav menu items — it's fully
 * editable afterwards from Appearance > Menus like any other menu.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * label => resolver that returns a real URL once WooCommerce's taxonomies exist.
 */
function infillpk_default_mega_menu_structure() {
	return array(
		array(
			'label'        => __( '3D Printing', 'infillpk' ),
			'href'         => fn() => infillpk_shop_url( '3d-printers' ),
			'view_all'     => __( 'View all 3D printers', 'infillpk' ),
			'columns'      => array(
				array(
					'heading' => __( '3D Printers', 'infillpk' ),
					'links'   => array(
						array( 'label' => __( 'FDM / FFF', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'technology' => 'FDM' ) ) ),
						array( 'label' => __( 'Resin', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'technology' => 'Resin' ) ) ),
						array( 'label' => __( 'CoreXY', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'technology' => 'CoreXY' ) ) ),
						array( 'label' => __( 'Large Format', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'technology' => 'Large Format' ) ) ),
						array( 'label' => __( 'Industrial', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'technology' => 'Industrial' ) ) ),
						array( 'label' => __( 'Educational', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'technology' => 'Educational' ) ) ),
					),
				),
				array(
					'heading' => __( 'Shop by Experience', 'infillpk' ),
					'links'   => array(
						array( 'label' => __( 'Beginner', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'experience-level' => 'Beginner' ) ) ),
						array( 'label' => __( 'Intermediate', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'experience-level' => 'Intermediate' ) ) ),
						array( 'label' => __( 'Professional', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'experience-level' => 'Professional' ) ) ),
						array( 'label' => __( 'Industrial', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'experience-level' => 'Industrial' ) ) ),
					),
				),
				array(
					'heading' => __( 'Shop by Use', 'infillpk' ),
					'links'   => array(
						array( 'label' => __( 'Hobby', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'use-case' => 'Hobby' ) ) ),
						array( 'label' => __( 'Engineering', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'use-case' => 'Engineering' ) ) ),
						array( 'label' => __( 'Prototyping', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'use-case' => 'Prototyping' ) ) ),
						array( 'label' => __( 'Education', 'infillpk' ), 'href' => fn() => infillpk_shop_url( '3d-printers', array( 'use-case' => 'Education' ) ) ),
					),
				),
				array(
					'heading' => __( 'Brands', 'infillpk' ),
					'links'   => array(
						array( 'label' => 'Bambu Lab', 'href' => fn() => infillpk_brand_url( 'bambu-lab' ) ),
						array( 'label' => 'Creality', 'href' => fn() => infillpk_brand_url( 'creality' ) ),
						array( 'label' => 'Prusa Research', 'href' => fn() => infillpk_brand_url( 'prusa-research' ) ),
						array( 'label' => 'Elegoo', 'href' => fn() => infillpk_brand_url( 'elegoo' ) ),
					),
				),
			),
		),
		array(
			'label'    => __( 'Materials', 'infillpk' ),
			'href'     => fn() => infillpk_shop_url( 'filament' ),
			'view_all' => __( 'View all materials', 'infillpk' ),
			'columns'  => array(
				array(
					'heading' => __( 'Filament', 'infillpk' ),
					'links'   => array(
						array( 'label' => 'PLA', 'href' => fn() => infillpk_subcategory_url( 'filament', 'PLA' ) ),
						array( 'label' => 'PETG', 'href' => fn() => infillpk_subcategory_url( 'filament', 'PETG' ) ),
						array( 'label' => 'ABS', 'href' => fn() => infillpk_subcategory_url( 'filament', 'ABS' ) ),
						array( 'label' => 'TPU', 'href' => fn() => infillpk_subcategory_url( 'filament', 'TPU' ) ),
					),
				),
				array(
					'heading' => __( 'Resin', 'infillpk' ),
					'links'   => array(
						array( 'label' => __( 'All resin', 'infillpk' ), 'href' => fn() => infillpk_shop_url( 'resin' ) ),
					),
				),
				array(
					'heading' => __( 'Filament Brands', 'infillpk' ),
					'links'   => array(
						array( 'label' => 'Polymaker', 'href' => fn() => infillpk_brand_url( 'polymaker' ) ),
						array( 'label' => 'eSUN', 'href' => fn() => infillpk_brand_url( 'esun' ) ),
						array( 'label' => 'Overture', 'href' => fn() => infillpk_brand_url( 'overture' ) ),
					),
				),
			),
		),
		array(
			'label'    => __( 'Parts & Accessories', 'infillpk' ),
			'href'     => fn() => infillpk_shop_url( 'parts-accessories' ),
			'view_all' => __( 'View all parts', 'infillpk' ),
			'columns'  => array(
				array(
					'heading' => __( 'Categories', 'infillpk' ),
					'links'   => array(
						array( 'label' => __( 'Nozzles', 'infillpk' ), 'href' => fn() => infillpk_subcategory_url( 'parts-accessories', 'Nozzles' ) ),
						array( 'label' => __( 'Hotends', 'infillpk' ), 'href' => fn() => infillpk_subcategory_url( 'parts-accessories', 'Hotends' ) ),
						array( 'label' => __( 'Build Plates', 'infillpk' ), 'href' => fn() => infillpk_subcategory_url( 'parts-accessories', 'Build Plates' ) ),
					),
				),
			),
		),
		array(
			'label'    => __( 'Machines', 'infillpk' ),
			'href'     => fn() => infillpk_shop_url( 'machines' ),
			'view_all' => __( 'View all machines', 'infillpk' ),
			'columns'  => array(
				array(
					'heading' => __( 'Digital Fabrication', 'infillpk' ),
					'links'   => array(
						array( 'label' => __( 'CNC', 'infillpk' ), 'href' => fn() => infillpk_shop_url( 'machines', array( 'machine-category' => 'cnc' ) ) ),
						array( 'label' => __( 'UV Printing', 'infillpk' ), 'href' => fn() => infillpk_shop_url( 'machines', array( 'machine-category' => 'uv-printing' ) ) ),
						array( 'label' => __( 'Laser', 'infillpk' ), 'href' => fn() => infillpk_shop_url( 'machines', array( 'machine-category' => 'laser' ) ) ),
					),
				),
			),
		),
	);
}

function infillpk_brand_url( $brand_slug ) {
	$term = get_term_by( 'slug', $brand_slug, 'product_brand' );
	$link = $term ? get_term_link( $term ) : home_url( '/' );
	return is_wp_error( $link ) ? home_url( '/' ) : $link;
}

/**
 * Resolves to the real child product_cat term the importer creates for each
 * product's `subcategory` (e.g. "PLA" under "Filament"), falling back to the
 * parent category if that child doesn't exist yet (e.g. before the catalog
 * has been imported).
 */
function infillpk_subcategory_url( $parent_slug, $subcategory_name ) {
	$child = get_term_by( 'slug', sanitize_title( $subcategory_name ), 'product_cat' );
	if ( $child ) {
		$link = get_term_link( $child );
		if ( ! is_wp_error( $link ) ) {
			return $link;
		}
	}
	return infillpk_shop_url( $parent_slug );
}

/**
 * Creates the Primary + Footer menus, assigns them to their theme locations,
 * and skips entirely if a menu is already assigned (so re-activating the
 * theme, or a site where the owner already customized the menu, never gets
 * overwritten).
 */
function infillpk_create_default_menus() {
	$locations = get_nav_menu_locations();

	if ( empty( $locations['primary'] ) ) {
		$menu_id = wp_create_nav_menu( __( 'Primary', 'infillpk' ) );
		if ( ! is_wp_error( $menu_id ) ) {
			foreach ( infillpk_default_mega_menu_structure() as $top ) {
				$top_id = wp_update_nav_menu_item(
					$menu_id,
					0,
					array(
						'menu-item-title'  => $top['label'],
						'menu-item-url'    => call_user_func( $top['href'] ),
						'menu-item-status' => 'publish',
					)
				);
				foreach ( $top['columns'] as $col ) {
					$col_id = wp_update_nav_menu_item(
						$menu_id,
						0,
						array(
							'menu-item-title'     => $col['heading'],
							'menu-item-url'       => '#',
							'menu-item-parent-id' => $top_id,
							'menu-item-status'    => 'publish',
						)
					);
					foreach ( $col['links'] as $link ) {
						wp_update_nav_menu_item(
							$menu_id,
							0,
							array(
								'menu-item-title'     => $link['label'],
								'menu-item-url'       => call_user_func( $link['href'] ),
								'menu-item-parent-id' => $col_id,
								'menu-item-status'    => 'publish',
							)
						);
					}
				}
			}

			// Simple (non-mega) top-level items, matching simpleNavLinks in nav-data.ts.
			$services_page = get_page_by_path( 'services' );
			$lab_category  = get_category_by_slug( 'infill-lab' );
			if ( $services_page ) {
				wp_update_nav_menu_item( $menu_id, 0, array( 'menu-item-title' => __( 'Services', 'infillpk' ), 'menu-item-object-id' => $services_page->ID, 'menu-item-object' => 'page', 'menu-item-type' => 'post_type', 'menu-item-status' => 'publish' ) );
			}
			if ( $lab_category ) {
				wp_update_nav_menu_item( $menu_id, 0, array( 'menu-item-title' => __( 'Learn', 'infillpk' ), 'menu-item-object-id' => $lab_category->term_id, 'menu-item-object' => 'category', 'menu-item-type' => 'taxonomy', 'menu-item-status' => 'publish' ) );
			}

			$locations['primary'] = $menu_id;
		}
	}

	if ( empty( $locations['footer'] ) ) {
		$footer_id = wp_create_nav_menu( __( 'Footer', 'infillpk' ) );
		if ( ! is_wp_error( $footer_id ) ) {
			$footer_links = array(
				__( 'About', 'infillpk' )   => home_url( '/about/' ),
				__( 'Contact', 'infillpk' ) => home_url( '/contact/' ),
				__( 'Shop', 'infillpk' )     => infillpk_shop_url( '3d-printers' ),
			);
			foreach ( $footer_links as $label => $url ) {
				wp_update_nav_menu_item( $footer_id, 0, array( 'menu-item-title' => $label, 'menu-item-url' => $url, 'menu-item-status' => 'publish' ) );
			}
			$locations['footer'] = $footer_id;
		}
	}

	set_theme_mod( 'nav_menu_locations', $locations );
}
add_action( 'after_switch_theme', 'infillpk_create_default_menus', 20 );
