<?php
/**
 * Renders the primary nav menu (Appearance > Menus, "Primary — Mega Menu" slot)
 * as a mega menu. Menu structure, editable in wp-admin, maps to depth:
 *
 *   depth 0  top-level item      -> mega menu trigger ("3D Printing", "Materials"...)
 *   depth 1  child of top item   -> column heading within that item's panel
 *   depth 2  grandchild          -> a link inside that column
 *
 * A top-level item with no children renders as a plain link (e.g. "Services", "Learn").
 * This keeps the entire mega menu content editable from wp-admin rather than
 * hardcoded in PHP, per the "don't replace what WordPress already gives you" rule —
 * WP nav menus are the built-in mechanism for this.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class INFiLLPK_Mega_Menu_Walker extends Walker_Nav_Menu {

	public function start_lvl( &$output, $depth = 0, $args = null ) {
		if ( 0 === $depth ) {
			$output .= '<div class="mega-menu-panel bg-surface border border-border shadow-xl rounded-b-xl mt-0 w-max max-w-4xl">';
			$output .= '<div class="grid grid-flow-col auto-cols-[minmax(10rem,1fr)] gap-8 p-8">';
		} else {
			$output .= '<ul class="mt-3 space-y-2">';
		}
	}

	public function end_lvl( &$output, $depth = 0, $args = null ) {
		if ( 0 === $depth ) {
			$output .= '</div></div>';
		} else {
			$output .= '</ul>';
		}
	}

	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		$has_children = in_array( 'menu-item-has-children', $classes, true );
		$url = ! empty( $item->url ) ? $item->url : '#';
		$label = apply_filters( 'the_title', $item->title, $item->ID );

		if ( 0 === $depth ) {
			if ( $has_children ) {
				$output .= '<div class="mega-menu group">';
				$output .= '<a href="' . esc_url( $url ) . '" class="focus-ring inline-flex items-center gap-1 px-4 py-6 text-sm font-medium text-ink hover:text-blue-600 transition-colors">' . esc_html( $label ) . '</a>';
			} else {
				$output .= '<a href="' . esc_url( $url ) . '" class="focus-ring inline-flex items-center px-4 py-6 text-sm font-medium text-ink hover:text-blue-600 transition-colors">' . esc_html( $label ) . '</a>';
			}
		} elseif ( 1 === $depth ) {
			$output .= '<div class="mega-menu-column">';
			$output .= '<span class="text-xs font-semibold uppercase tracking-wide text-ink-faint">' . esc_html( $label ) . '</span>';
		} else {
			$output .= '<li><a href="' . esc_url( $url ) . '" class="focus-ring text-sm text-ink-muted hover:text-blue-600 transition-colors">' . esc_html( $label ) . '</a></li>';
		}
	}

	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		$has_children = in_array( 'menu-item-has-children', $classes, true );

		if ( 0 === $depth ) {
			if ( $has_children ) {
				$output .= '</div>';
			}
		} elseif ( 1 === $depth ) {
			$output .= '</div>';
		}
	}
}

/**
 * Renders the same Primary menu as an accordion for the mobile slide-in
 * panel (template-parts/mobile-nav.php) — matching mobile-nav.tsx: each
 * top-level item with children is a toggle button revealing its columns,
 * a top-level item without children is a plain link.
 */
class INFiLLPK_Mobile_Nav_Walker extends Walker_Nav_Menu {

	/** Set in start_el() for a depth-0 item with children, consumed by end_lvl(). */
	private $pending_view_all = null;

	public function start_lvl( &$output, $depth = 0, $args = null ) {
		if ( 0 === $depth ) {
			$output .= '<div class="js-mobile-panel hidden space-y-4 px-3 pb-4">';
		} else {
			$output .= '<ul class="space-y-1.5">';
		}
	}

	public function end_lvl( &$output, $depth = 0, $args = null ) {
		if ( 0 === $depth ) {
			if ( $this->pending_view_all ) {
				$output .= '<a href="' . esc_url( $this->pending_view_all['url'] ) . '" class="focus-ring block text-sm font-medium text-blue-700">' . esc_html__( 'View all', 'infillpk' ) . ' ' . esc_html( $this->pending_view_all['label'] ) . ' &rarr;</a>';
				$this->pending_view_all = null;
			}
			$output .= '</div>';
		} else {
			$output .= '</ul>';
		}
	}

	public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		$has_children = in_array( 'menu-item-has-children', $classes, true );
		$url = ! empty( $item->url ) ? $item->url : '#';
		$label = apply_filters( 'the_title', $item->title, $item->ID );

		if ( 0 === $depth ) {
			if ( $has_children ) {
				$this->pending_view_all = array( 'url' => $url, 'label' => $label );
				$output .= '<div class="border-b border-border">';
				$output .= '<button type="button" class="js-mobile-toggle focus-ring flex w-full cursor-pointer items-center justify-between px-3 py-3.5 text-left text-sm font-medium text-ink" aria-expanded="false">';
				$output .= esc_html( $label );
				$output .= '<svg class="js-mobile-toggle-caret transition-transform" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m5 3 4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
				$output .= '</button>';
			} else {
				$output .= '<a href="' . esc_url( $url ) . '" class="focus-ring block border-b border-border px-3 py-3.5 text-sm font-medium text-ink">' . esc_html( $label ) . '</a>';
			}
		} elseif ( 1 === $depth ) {
			$output .= '<div><p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">' . esc_html( $label ) . '</p>';
		} else {
			$output .= '<li><a href="' . esc_url( $url ) . '" class="focus-ring block py-1 text-sm text-ink-muted hover:text-blue-700">' . esc_html( $label ) . '</a></li>';
		}
	}

	public function end_el( &$output, $item, $depth = 0, $args = null ) {
		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		$has_children = in_array( 'menu-item-has-children', $classes, true );

		if ( 0 === $depth && $has_children ) {
			$output .= '</div>'; // close this menu-item's own wrapper div opened in start_el.
		} elseif ( 1 === $depth ) {
			$output .= '</div>';
		}
	}
}

/**
 * Fallback used by wp_nav_menu() while no menu has been assigned yet to the
 * "Primary — Mega Menu" location (Appearance > Menus). Without this the
 * header would render with no links at all. Lists top-level published pages
 * (About, Contact, Services, the WooCommerce Shop page, etc.) so the site is
 * navigable immediately; switches over automatically the moment a real menu
 * is assigned.
 */
function infillpk_nav_fallback( $args = array() ) {
	$pages = get_pages( array( 'parent' => 0, 'sort_column' => 'menu_order' ) );

	// Cart/Checkout/My Account already have their own icons in the header —
	// listing them again as text links here would be redundant.
	$exclude_ids = array();
	if ( class_exists( 'WooCommerce' ) ) {
		$exclude_ids = array_filter(
			array( wc_get_page_id( 'cart' ), wc_get_page_id( 'checkout' ), wc_get_page_id( 'myaccount' ), wc_get_page_id( 'shop' ) )
		);
	}
	$pages = array_filter( $pages, fn( $page ) => ! in_array( $page->ID, $exclude_ids, true ) );

	if ( empty( $pages ) ) {
		return;
	}

	$link_class = 'focus-ring inline-flex items-center px-4 py-6 text-sm font-medium text-ink hover:text-blue-600 transition-colors';
	if ( ! empty( $args['depth'] ) && 1 === (int) $args['depth'] ) {
		$link_class = 'focus-ring block px-4 py-3 text-sm font-medium text-ink hover:text-blue-600 transition-colors';
	}

	echo '<div class="flex flex-col lg:flex-row lg:items-center">';
	foreach ( $pages as $page ) {
		printf(
			'<a href="%s" class="%s">%s</a>',
			esc_url( get_permalink( $page ) ),
			esc_attr( $link_class ),
			esc_html( get_the_title( $page ) )
		);
	}
	echo '</div>';
}
