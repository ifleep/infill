<?php
/**
 * Core theme supports, nav menus, image sizes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function infillpk_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'customize-selective-refresh-widgets' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'align-wide' );

	// WooCommerce.
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wc-product-gallery-slider' );

	// Elementor: full width support for pages/canvas templates.
	add_theme_support( 'elementor' );

	register_nav_menus(
		array(
			'primary' => __( 'Primary — Mega Menu', 'infillpk' ),
			'footer'  => __( 'Footer', 'infillpk' ),
		)
	);

	add_image_size( 'infillpk-product-card', 640, 640, true );
	add_image_size( 'infillpk-hero', 1920, 1080, true );

	global $content_width;
	if ( ! isset( $content_width ) ) {
		$content_width = 1440;
	}
}
add_action( 'after_setup_theme', 'infillpk_setup' );

/**
 * Register widget areas (footer columns).
 */
function infillpk_widgets_init() {
	register_sidebar(
		array(
			'name'          => __( 'Footer', 'infillpk' ),
			'id'            => 'footer-1',
			'before_widget' => '<div class="footer-widget">',
			'after_widget'  => '</div>',
			'before_title'  => '<h3 class="footer-widget-title">',
			'after_title'   => '</h3>',
		)
	);
}
add_action( 'widgets_init', 'infillpk_widgets_init' );

/**
 * On activation: make sure the INFiLL Lab category and the three standard
 * pages exist, so the site isn't empty on first install. Pages are created
 * as plain WP Pages (not populated with a template) so they open straight
 * into Elementor for visual editing, per the "everything but the homepage
 * is a normal, Elementor-editable Page" decision.
 */
function infillpk_create_default_content() {
	if ( ! term_exists( 'infill-lab', 'category' ) ) {
		wp_insert_term( __( 'INFiLL Lab', 'infillpk' ), 'category', array( 'slug' => 'infill-lab' ) );
	}

	$pages = array(
		'about'    => array(
			'title'   => __( 'About', 'infillpk' ),
			'content' => __( "INFiLLPK brings 3D printing technology, materials and digital fabrication to Pakistan.\n\nEdit this page in Elementor to tell your story.", 'infillpk' ),
		),
		'contact'  => array(
			'title'   => __( 'Contact', 'infillpk' ),
			'content' => __( "Get in touch with INFiLLPK.\n\nAdd a contact form here with a form plugin (e.g. Contact Form 7 or WPForms) — WordPress has no built-in contact form, and those are the standard, well-supported way to add one rather than a custom one-off.", 'infillpk' ),
		),
		'services' => array(
			'title'   => __( 'Services', 'infillpk' ),
			'content' => __( "3D printing, prototyping, design, installation & training, and technical support.\n\nEdit this page in Elementor — the homepage's Services section (#services) links here.", 'infillpk' ),
		),
		'privacy-policy'  => array(
			'title'   => __( 'Privacy Policy', 'infillpk' ),
			'content' => __( "How INFiLLPK collects, uses and protects your data.\n\nEdit this page — WordPress also has a dedicated Privacy Policy setting under Settings > Privacy if you'd rather use that page instead.", 'infillpk' ),
		),
		'returns-warranty' => array(
			'title'   => __( 'Returns & Warranty', 'infillpk' ),
			'content' => __( "Our returns process and manufacturer warranty terms.\n\nEdit this page to add your actual policy.", 'infillpk' ),
		),
		'shipping' => array(
			'title'   => __( 'Shipping', 'infillpk' ),
			'content' => __( "Shipping rates, timelines and coverage across Pakistan.\n\nEdit this page to add your actual policy.", 'infillpk' ),
		),
	);

	foreach ( $pages as $slug => $page ) {
		if ( get_page_by_path( $slug ) ) {
			continue;
		}
		wp_insert_post(
			array(
				'post_type'    => 'page',
				'post_status'  => 'publish',
				'post_title'   => $page['title'],
				'post_name'    => $slug,
				'post_content' => $page['content'],
			)
		);
	}
}
add_action( 'after_switch_theme', 'infillpk_create_default_content' );
