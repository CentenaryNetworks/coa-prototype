<?php
/**
 * Contact form and newsletter sign-up.
 * Both are sent by email through WordPress (the live site sends mail via Post SMTP).
 * Newsletter addresses are also kept in a list under WooCommerce › Status so none are lost;
 * they can be imported into Mailchimp.
 */
defined('ABSPATH') || exit;

function coa_form_to() {
	$to = get_option('coa_form_to');
	return is_email($to) ? $to : get_option('admin_email');
}

function coa_form_guard() {
	if (!check_ajax_referer('coa_forms', 'nonce', false)) wp_send_json_error(['msg' => 'This page has expired. Please refresh it and try again.'], 403);
	if (!empty($_POST['website'])) wp_send_json_success(['msg' => 'ok']); // honeypot: bots fill hidden fields
	$ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');
	$k = 'coa_rl_' . md5($ip);
	$n = (int) get_transient($k);
	if ($n > 8) wp_send_json_error(['msg' => 'Too many messages from this connection. Please try again in a few minutes.'], 429);
	set_transient($k, $n + 1, 10 * MINUTE_IN_SECONDS);
}

function coa_contact() {
	coa_form_guard();
	$name = sanitize_text_field(wp_unslash($_POST['name'] ?? ''));
	$email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
	$topic = sanitize_text_field(wp_unslash($_POST['topic'] ?? ''));
	$order = sanitize_text_field(wp_unslash($_POST['order'] ?? ''));
	$date = sanitize_text_field(wp_unslash($_POST['date'] ?? ''));
	$msg = sanitize_textarea_field(wp_unslash($_POST['message'] ?? ''));
	if (mb_strlen($name) < 2 || !is_email($email) || mb_strlen($msg) < 5) wp_send_json_error(['msg' => 'Please fill in your name, email and message.'], 400);
	$lines = ["Name: $name", "Email: $email", "Topic: $topic"];
	if ($order) $lines[] = "Order: $order";
	if ($date) $lines[] = "Preferred visit date: $date";
	$lines[] = '';
	$lines[] = $msg;
	$lines[] = '';
	$lines[] = 'Sent from the contact form on ' . home_url('/');
	$ok = wp_mail(coa_form_to(), "Website message: $topic, from $name", implode("\n", $lines), ["Reply-To: $name <$email>"]);
	if (!$ok) wp_send_json_error(['msg' => 'Your message couldn’t be sent just now. Please email us instead.'], 500);
	wp_send_json_success(['msg' => 'sent']);
}
add_action('wp_ajax_coa_contact', 'coa_contact');
add_action('wp_ajax_nopriv_coa_contact', 'coa_contact');

function coa_join() {
	coa_form_guard();
	$email = sanitize_email(wp_unslash($_POST['email'] ?? ''));
	if (!is_email($email)) wp_send_json_error(['msg' => 'Enter an email address like name@example.com.'], 400);
	$list = get_option('coa_newsletter', []);
	if (!is_array($list)) $list = [];
	$new = !isset($list[$email]);
	$list[$email] = $list[$email] ?? current_time('mysql');
	update_option('coa_newsletter', $list, false);
	if ($new) wp_mail(coa_form_to(), 'New newsletter sign-up', "$email signed up for the newsletter on " . home_url('/') . ".\n\nAll sign-ups: WooCommerce › Status › Newsletter sign-ups.");
	wp_send_json_success(['msg' => 'joined']);
}
add_action('wp_ajax_coa_join', 'coa_join');
add_action('wp_ajax_nopriv_coa_join', 'coa_join');

/* Sign-ups list for the team: WooCommerce › Status › Newsletter sign-ups (with CSV download) */
add_filter('woocommerce_admin_status_tabs', fn($t) => $t + ['coa-newsletter' => 'Newsletter sign-ups']);
add_action('woocommerce_admin_status_content_coa-newsletter', function () {
	$list = get_option('coa_newsletter', []);
	if (!is_array($list)) $list = [];
	echo '<h2>Newsletter sign-ups (' . count($list) . ')</h2>';
	if ($list) {
		echo '<textarea readonly rows="12" style="width:100%;max-width:640px">' . esc_textarea("email,signed_up\n" . implode("\n", array_map(fn($e, $d) => "$e,$d", array_keys($list), $list))) . '</textarea><p>Copy this into a .csv file to import into Mailchimp.</p>';
	} else {
		echo '<p>No sign-ups yet.</p>';
	}
});
