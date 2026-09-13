<?php
/**
 * Asset enqueue. All CSS/JS is compiled by `npm run build` (see package.json) into
 * assets/css/main.build.css and assets/js/*.bundle.js — both gitignored build outputs.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue a built asset if present, falling back to nothing (with an admin notice)
 * rather than a 404 if the theme hasn't been built yet.
 */
function infillpk_asset_uri( $relative_path ) {
	$file = INFILLPK_DIR . '/' . $relative_path;
	if ( ! file_exists( $file ) ) {
		return false;
	}
	return array( INFILLPK_URI . '/' . $relative_path, filemtime( $file ) );
}

function infillpk_enqueue_assets() {
	$css = infillpk_asset_uri( 'assets/css/main.build.css' );
	if ( $css ) {
		wp_enqueue_style( 'infillpk-main', $css[0], array(), $css[1] );
	}

	$main_js = infillpk_asset_uri( 'assets/js/main.bundle.js' );
	if ( $main_js ) {
		wp_enqueue_script( 'infillpk-main', $main_js[0], array(), $main_js[1], true );
	}

	// The search overlay is in the header on every page.
	$search_js = infillpk_asset_uri( 'assets/js/search.bundle.js' );
	if ( $search_js ) {
		wp_enqueue_script( 'infillpk-search', $search_js[0], array(), $search_js[1], true );
	}

	if ( is_front_page() ) {
		$hero_js = infillpk_asset_uri( 'assets/js/hero.bundle.js' );
		if ( $hero_js ) {
			wp_enqueue_script( 'infillpk-hero', $hero_js[0], array(), $hero_js[1], true );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'infillpk_enqueue_assets' );

/**
 * Admin notice when the theme hasn't been built yet.
 */
function infillpk_build_notice() {
	if ( file_exists( INFILLPK_DIR . '/assets/css/main.build.css' ) ) {
		return;
	}
	echo '<div class="notice notice-warning"><p>' .
		esc_html__( 'INFiLLPK theme: run `npm install && npm run build` in wp-content/themes/infillpk to compile CSS/JS.', 'infillpk' ) .
		'</p></div>';
}
add_action( 'admin_notices', 'infillpk_build_notice' );
