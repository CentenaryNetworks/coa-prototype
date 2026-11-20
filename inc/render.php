<?php
/**
 * Shows an approved v5 page (views/*.html) inside WordPress.
 * The page's <main>, side panels and its own script are kept exactly as approved;
 * only image paths are pointed at the theme. Links are turned into real
 * WordPress addresses by assets/coa.js.
 */
defined('ABSPATH') || exit;

/** Which design page the current WordPress request maps to */
function coa_current_view() {
	if (is_front_page()) return 'index';
	if (get_query_var('coa_view')) return get_query_var('coa_view');
	if (function_exists('is_product') && is_product()) return 'product';
	if (function_exists('is_shop') && (is_shop() || is_product_category() || is_product_tag())) return 'collection';
	if (is_search()) return 'collection';
	if (is_404()) return '404';
	if (is_page()) {
		$slug = get_post_field('post_name', get_queried_object_id());
		$map = ['about-us' => 'about', 'about' => 'about', 'services' => 'about', 'contact-us' => 'contact', 'contact' => 'contact', 'faq' => 'faq', 'faqs' => 'faq'];
		if (isset($map[$slug])) return $map[$slug];
	}
	return '';
}

/** The record the page shows: product slug, collection slug or diary entry */
function coa_current_slug() {
	if (function_exists('is_product') && is_product()) return get_post_field('post_name', get_queried_object_id());
	if (function_exists('is_product_category') && is_product_category()) return get_queried_object()->slug;
	if (function_exists('is_shop') && is_shop()) return is_search() ? 'shop' : 'shop';
	if (get_query_var('coa_entry')) return sanitize_title(get_query_var('coa_entry'));
	if (is_search()) return 'shop';
	return '';
}

/** Print a design page: its main content, side panels and inline script */
function coa_view($name) {
	$file = COA_DIR . "/views/$name.html";
	if (!is_readable($file)) return false;
	$html = file_get_contents($file);
	if (!preg_match('/<body[^>]*>(.*)<\/body>/si', $html, $m)) return false;
	$body = $m[1];
	// the shared scripts are loaded by WordPress, not by the page
	$body = preg_replace('#<script\s+src="(coa-data|coa)\.js"></script>\s*#i', '', $body);
	// theme-relative media
	$base = esc_url(COA_URI) . '/';
	$body = preg_replace('#(\s(?:src|poster|href)=")(img|media)/#i', '$1' . $base . '$2/', $body);
	$body = preg_replace('#url\((["\']?)(img|media)/#i', 'url($1' . $base . '$2/', $body);
	echo $body; // trusted theme file
	return true;
}

/** Page <title> for design pages that WordPress doesn't title itself */
add_filter('pre_get_document_title', function ($t) {
	$v = get_query_var('coa_view');
	$titles = ['diaries' => 'COA Diaries', 'diary' => 'COA Diaries', 'wishlist' => 'Wishlist'];
	return isset($titles[$v]) ? $titles[$v] . ' · ' . get_bloginfo('name') : $t;
});
