<?php
/**
 * Catalogue data for the design's scripts, built from WooCommerce.
 * Same shape as the approved prototype's coa-data.js, plus the WooCommerce IDs the bag needs.
 */
defined('ABSPATH') || exit;

const COA_SIZE_SHORT = ['extra small' => 'XS', 'small' => 'S', 'medium' => 'M', 'large' => 'L', 'extra large' => 'XL'];

function coa_flush_data() {
	delete_transient('coa_data_v1');
}

function coa_txt($html) {
	return trim(html_entity_decode(wp_strip_all_tags((string) $html), ENT_QUOTES, 'UTF-8'));
}

/** Design "type" (drives filters and copy) from the product's real categories */
function coa_type_for(array $cats) {
	$has = fn(...$s) => (bool) array_intersect($s, $cats);
	if ($has('accessories', 'accessories-2', 'headgear')) return 'headgear';
	if ($has('jackets', 'jackets-outerwear')) return 'jackets';
	if ($has('sweaters', 'sweaters-sweaters')) return 'sweaters';
	if ($has('skirts')) return 'skirts';
	if ($has('dresses', 'dresses-dresses')) return 'dresses';
	if ($has('denim-edit', 'denim') && $has('pants', 'bottoms', 'denim')) return 'denim';
	if ($has('pants', 'bottoms')) return 'bottoms';
	if ($has('shirts')) return 'shirts';
	if ($has('tees', 't-shirt', 'tanks')) return 'tees';
	return 'tops';
}

/** Design collections the product belongs to (keys used by the v5 pages) */
function coa_cols_for(array $cats, bool $on_sale) {
	$cols = [];
	$map = ['skool-of-rock' => ['skool-of-rock'], 'new-jozi' => ['new-jozi'], 'heart-supplies' => ['heart-supplies', 'heart-supplies-collections'], 'denim-edit' => ['denim-edit'], 'logo-threads' => ['logo-threads'], 'regenerated-vintage' => ['regenerated-vintage']];
	foreach ($map as $col => $slugs) if (array_intersect($slugs, $cats)) $cols[] = $col;
	if ($on_sale) $cols[] = 'sale';
	return $cols;
}

function coa_img_url($id, $size = 'woocommerce_single') {
	$u = $id ? wp_get_attachment_image_url($id, $size) : '';
	return $u ?: wc_placeholder_img_src($size);
}

function coa_product_data() {
	$cached = get_transient('coa_data_v1');
	if (is_array($cached)) return $cached;

	$q = wc_get_products(['status' => 'publish', 'visibility' => 'catalog', 'limit' => -1, 'orderby' => ['date' => 'DESC', 'ID' => 'DESC'], 'return' => 'objects']);
	$hide_oos = 'yes' === get_option('woocommerce_hide_out_of_stock_items');
	$out = [];
	$names = [];
	$o = 0;
	foreach ($q as $p) {
		if ($hide_oos && !$p->is_in_stock()) continue;
		$cats = wp_get_post_terms($p->get_id(), 'product_cat', ['fields' => 'slugs']);
		$sd = (string) $p->get_short_description();
		$d = (string) $p->get_description();
		preg_match('/<strong>(.*?)<\/strong>/s', $sd, $m);
		$lede = isset($m[1]) ? coa_txt($m[1]) : '';
		preg_match_all('/<li>(.*?)<\/li>/s', $sd, $li);
		$det = array_values(array_filter(array_map(function ($x) { $x = coa_txt($x); return $x ? mb_strtoupper(mb_substr($x, 0, 1)) . mb_strtolower(mb_substr($x, 1)) : ''; }, $li[1] ?? [])));
		preg_match_all('/<p[^>]*>(.*?)<\/p>/s', $d, $ps);
		$paras = array_values(array_filter(array_map('coa_txt', $ps[1] ?? []), fn($x) => $x && stripos($x, 'available in') !== 0));
		if (!$paras && coa_txt($d)) $paras = [coa_txt($d)];

		$reg = (float) $p->get_regular_price();
		$price = (float) $p->get_price();
		if ($p->is_type('variable')) { $reg = (float) $p->get_variation_regular_price('min'); $price = (float) $p->get_variation_price('min'); }

		$imgs = array_values(array_filter(array_merge([$p->get_image_id()], $p->get_gallery_image_ids())));
		$sizes = []; $vars = []; $oos = [];
		if ($p->is_type('variable')) {
			foreach (array_filter(array_map('wc_get_product', $p->get_children())) as $v) {
				if ('publish' !== get_post_status($v->get_id())) continue;
				$label = '';
				foreach ($v->get_attributes() as $tax => $val) {
					$term = taxonomy_exists($tax) ? get_term_by('slug', $val, $tax) : null;
					$label = $term ? $term->name : $val;
				}
				$short = COA_SIZE_SHORT[strtolower(trim($label))] ?? $label;
				if ($short === '' || isset($vars[$short])) continue;
				$sizes[] = $short;
				$vars[$short] = $v->get_id();
				if (!$v->is_in_stock() || !$v->is_purchasable()) $oos[] = $short;
			}
			$order = array_flip(['XS', 'S', 'M', 'L', 'XL']);
			usort($sizes, fn($a, $b) => ($order[$a] ?? 99) <=> ($order[$b] ?? 99));
		}
		$one = !$p->is_type('variable') || count($sizes) <= 1 || in_array('OSFM', $sizes, true) || in_array('One-Size', $sizes, true);
		$name = mb_convert_case(mb_strtolower(coa_txt($p->get_name())), MB_CASE_TITLE, 'UTF-8');
		$e = [
			'id' => $p->get_slug(),
			'wid' => $p->get_id(),
			'url' => get_permalink($p->get_id()),
			'n' => str_replace("'S", "'s", $name),
			'p' => $price,
			'imgs' => array_map('coa_img_url', $imgs),
			'big' => array_map(fn($i) => coa_img_url($i, 'large'), $imgs),
			'type' => coa_type_for($cats),
			'cats' => $cats,
			'cols' => coa_cols_for($cats, $p->is_on_sale()),
			'l' => $lede,
			'd' => $paras[0] ?? $lede,
			'det' => $det,
			'sizes' => $one ? ['One size'] : $sizes,
			'vars' => $one ? (object) ($p->is_type('variable') && $vars ? ['One size' => reset($vars)] : []) : (object) $vars,
			'oos' => $one ? ($p->is_in_stock() ? [] : ['One size']) : $oos,
			'buy' => $p->is_purchasable() && $p->is_in_stock(),
			'o' => $o++,
			'isNew' => in_array('new-in', $cats, true),
			'mto' => stripos(coa_txt($sd . ' ' . $d), 'made to order') !== false,
		];
		if ($price < $reg) $e['was'] = $reg;
		if ($one) $e['one'] = 1;
		if (!$e['imgs']) $e['imgs'] = $e['big'] = [wc_placeholder_img_src()];
		$names[$e['n']][] = count($out);
		$out[] = $e;
	}
	foreach ($names as $idx) if (count($idx) > 1) foreach ($idx as $i) $out[$i]['dup'] = 1;
	set_transient('coa_data_v1', $out, HOUR_IN_SECONDS);
	return $out;
}

/** Everything else the design's scripts need: real URLs, categories, Store API access, and the current page */
function coa_context() {
	$cats = [];
	foreach (get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]) as $t) {
		if (is_wp_error($t)) continue;
		$cats[$t->slug] = ['t' => html_entity_decode($t->name), 'url' => get_term_link($t), 'd' => coa_txt($t->description), 'n' => (int) $t->count, 'parent' => $t->parent ? get_term($t->parent)->slug : ''];
	}
	$page = fn($slug, $fallback) => ($p = get_page_by_path($slug)) ? get_permalink($p) : home_url($fallback);
	$ctx = [
		'theme' => COA_URI,
		'home' => home_url('/'),
		'rest' => esc_url_raw(rest_url()),
		'nonce' => wp_create_nonce('wc_store_api'),
		'ajax' => admin_url('admin-ajax.php'),
		'formNonce' => wp_create_nonce('coa_forms'),
		'admin' => current_user_can('manage_woocommerce'),
		'cats' => $cats,
		'links' => [
			'shop' => wc_get_page_permalink('shop'),
			'cart' => wc_get_cart_url(),
			'checkout' => wc_get_checkout_url(),
			'account' => wc_get_page_permalink('myaccount'),
			'orders' => wc_get_account_endpoint_url('orders'),
			'about' => $page('about-us', '/about-us/'),
			'contact' => $page('contact-us', '/contact-us/'),
			'faq' => $page('faq', '/faq/'),
			'diaries' => home_url('/diaries/'),
			'wishlist' => home_url('/wishlist/'),
		],
		'page' => coa_current_view(),
		'slug' => coa_current_slug(),
		'isWc' => function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page()),
		'loggedIn' => is_user_logged_in(),
		'q' => is_search() ? get_search_query() : '',
	];
	return $ctx;
}
