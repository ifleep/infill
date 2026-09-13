<?php
/**
 * Custom shortcodes for the two homepage features with no native WordPress
 * or WooCommerce equivalent: the Pakistan regions map and the "Find Your
 * Printer" quiz. Implemented as shortcodes (not hardcoded template markup)
 * so they can also be dropped into any Elementor page via its Shortcode widget.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require INFILLPK_DIR . '/inc/shortcodes/pakistan-map.php';
require INFILLPK_DIR . '/inc/shortcodes/find-your-printer.php';
