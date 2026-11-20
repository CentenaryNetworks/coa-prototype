<?php
/**
 * Chiefs of Angels theme.
 *
 * The approved v5 design (HTML/CSS/JS) is kept as-is in /views and /assets.
 * WooCommerce stays in charge of products, cart, checkout, payments, orders and accounts:
 *   - product data is read from WooCommerce (inc/data.php) and handed to the design's scripts,
 *   - the bag uses the WooCommerce Store API (real cart, real stock),
 *   - cart, checkout and My account are WooCommerce's own pages, restyled (assets/wc.css).
 */
defined('ABSPATH') || exit;

define('COA_VER', '1.0.0');
define('COA_DIR', get_stylesheet_directory());
define('COA_URI', get_stylesheet_directory_uri());

require COA_DIR . '/inc/data.php';
require COA_DIR . '/inc/render.php';
require COA_DIR . '/inc/routes.php';
require COA_DIR . '/inc/forms.php';

add_action('after_setup_theme', function () {
	add_theme_support('title-tag');
	add_theme_support('post-thumbnails');
	add_theme_support('html5', ['search-form', 'gallery', 'caption', 'style', 'script']);
	add_theme_support('woocommerce');
});

/* Styles and scripts: the design's own files, plus WooCommerce's on its pages */
add_action('wp_enqueue_scripts', function () {
	wp_enqueue_style('coa-fonts', 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Archivo:wght@400;500;600&display=swap', [], null);
	wp_enqueue_style('coa', COA_URI . '/assets/coa.css', [], COA_VER);
	wp_enqueue_style('coa-wc', COA_URI . '/assets/wc.css', ['coa'], COA_VER);

	wp_register_script('coa', COA_URI . '/assets/coa.js', [], COA_VER, ['in_footer' => false]); // in <head>: each page's own script calls COA.mount()
	wp_add_inline_script('coa', 'window.COA_DATA=' . wp_json_encode(coa_product_data()) . ';window.COA_CTX=' . wp_json_encode(coa_context()) . ';', 'before');
	wp_enqueue_script('coa');
}, 20);

/* WooCommerce's front-end stylesheets fight the design; keep only what checkout needs (assets/wc.css restyles it) */
add_filter('woocommerce_enqueue_styles', function ($styles) {
	unset($styles['woocommerce-smallscreen']);
	return $styles;
});

/* No Divi on this theme: if an old Divi page is shown, drop the builder shortcodes but keep the words */
add_filter('the_content', function ($html) {
	if (strpos($html, '[et_pb_') === false) return $html;
	$html = preg_replace('/\[\/?et_pb_[^\]]*\]/', '', $html);
	return wpautop(trim($html));
}, 1);

/* Clear the cached catalogue whenever products, stock or categories change */
foreach (['save_post_product', 'woocommerce_update_product', 'woocommerce_product_set_stock_status', 'woocommerce_variation_set_stock_status', 'edited_product_cat', 'created_product_cat', 'delete_product_cat', 'woocommerce_delete_product_transients'] as $h) {
	add_action($h, 'coa_flush_data');
}

/* Body class for pages whose hero sits under a see-through header */
add_filter('body_class', function ($c) {
	if (is_front_page()) $c[] = 'over';
	return $c;
});

/* Keep the admin bar from covering the fixed header */
add_action('wp_head', function () {
	if (is_admin_bar_showing()) echo '<style>.hdr{top:var(--wp-admin--admin-bar--height,32px)!important}</style>';
}, 99);
