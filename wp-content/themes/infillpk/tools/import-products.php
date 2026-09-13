<?php
/**
 * CLI wrapper for infillpk_run_catalog_import() (inc/catalog-importer.php).
 * If your Hostinger plan doesn't give you SSH, use the "Import Demo Catalog"
 * page under Tools in wp-admin instead — same import, no shell needed.
 *
 * Usage:
 *   php tools/import-products.php /absolute/path/to/wordpress
 */

if ( PHP_SAPI !== 'cli' ) {
	die( "Run this from the command line.\n" );
}

$wp_root = $argv[1] ?? null;
if ( ! $wp_root || ! file_exists( $wp_root . '/wp-load.php' ) ) {
	fwrite( STDERR, "Usage: php import-products.php /absolute/path/to/wordpress\n" );
	exit( 1 );
}

require rtrim( $wp_root, '/' ) . '/wp-load.php';

if ( ! function_exists( 'infillpk_run_catalog_import' ) ) {
	// Theme isn't active (or its functions.php didn't load) — fall back to a
	// standalone require, defining the one constant catalog-importer.php needs.
	if ( ! defined( 'INFILLPK_DIR' ) ) {
		define( 'INFILLPK_DIR', dirname( __DIR__ ) );
	}
	require __DIR__ . '/../inc/catalog-importer.php';
}

foreach ( infillpk_run_catalog_import() as $line ) {
	echo $line . "\n";
}
