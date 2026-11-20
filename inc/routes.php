<?php
/**
 * Addresses for the design pages that aren't WordPress pages:
 *   /diaries/            COA Diaries index
 *   /diaries/{entry}/    one Diaries story
 *   /wishlist/           saved pieces (kept in the visitor's browser)
 * Old Divi Diaries pages redirect to the new addresses.
 */
defined('ABSPATH') || exit;

add_action('init', function () {
	add_rewrite_rule('^diaries/?$', 'index.php?coa_view=diaries', 'top');
	add_rewrite_rule('^diaries/([^/]+)/?$', 'index.php?coa_view=diary&coa_entry=$matches[1]', 'top');
	add_rewrite_rule('^wishlist/?$', 'index.php?coa_view=wishlist', 'top');
	if (get_option('coa_rewrite_ver') !== COA_VER) { flush_rewrite_rules(false); update_option('coa_rewrite_ver', COA_VER); }
});
add_filter('query_vars', fn($v) => array_merge($v, ['coa_view', 'coa_entry']));

/* A design route is a real page, not a 404 */
add_action('template_redirect', function () {
	if (get_query_var('coa_view')) {
		global $wp_query;
		$wp_query->is_404 = false;
		$wp_query->is_home = false;
		status_header(200);
	}
	// old Divi Diaries pages → new Diaries addresses
	if (is_page()) {
		$slug = get_post_field('post_name', get_queried_object_id());
		$old = ['the-story-beneath-the-sound' => 'story-beneath-the-sound', 'https-chiefsofangels-co-za-coa-diaries-the-story-beneath-the-sound' => 'story-beneath-the-sound', 'roots' => 'story-beneath-the-sound', 'coa-diaries' => ''];
		if (isset($old[$slug])) { wp_safe_redirect(home_url('/diaries/' . ($old[$slug] ? $old[$slug] . '/' : '')), 301); exit; }
	}
}, 5);

/* Theme templates for design routes */
add_filter('template_include', function ($tpl) {
	$v = get_query_var('coa_view');
	if (in_array($v, ['diaries', 'diary', 'wishlist'], true)) return COA_DIR . '/design.php';
	return $tpl;
}, 99);
