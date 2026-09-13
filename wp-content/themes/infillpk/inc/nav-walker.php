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
