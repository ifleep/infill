<?php
/**
 * INFiLLPK theme bootstrap.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'INFILLPK_VERSION', '1.0.0' );
define( 'INFILLPK_DIR', get_template_directory() );
define( 'INFILLPK_URI', get_template_directory_uri() );

require INFILLPK_DIR . '/inc/helpers.php';
require INFILLPK_DIR . '/inc/theme-setup.php';
require INFILLPK_DIR . '/inc/enqueue.php';
require INFILLPK_DIR . '/inc/nav-walker.php';
require INFILLPK_DIR . '/inc/default-menu.php';
require INFILLPK_DIR . '/inc/woocommerce.php';
require INFILLPK_DIR . '/inc/shortcodes.php';
require INFILLPK_DIR . '/inc/catalog-importer.php';
require INFILLPK_DIR . '/inc/admin/catalog-import-page.php';
