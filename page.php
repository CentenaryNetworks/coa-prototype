<?php
/*
 * Ordinary pages, and WooCommerce's own Cart, Checkout and My account pages.
 * Pages that have an approved design (About, Contact, FAQ) are drawn from it instead.
 */
if (coa_current_view()) { require COA_DIR . '/design.php'; return; }
get_header();
$wc = function_exists('is_cart') && (is_cart() || is_checkout() || is_account_page());
$key = $wc ? (is_cart() ? 'cart' : (is_checkout() ? 'checkout' : 'account')) : 'page';
?>
<main id="top" class="wc5 wc5-<?php echo esc_attr($key); ?>">
  <div class="wrap">
    <div id="crumbs"></div>
    <?php while (have_posts()) : the_post(); ?>
      <?php if (!(function_exists('is_order_received_page') && is_order_received_page())) : ?>
        <h1 class="wc5-title"><?php echo esc_html($key === 'cart' ? 'Your bag' : get_the_title()); ?></h1>
      <?php endif; ?>
      <div class="wc5-body"><?php the_content(); ?></div>
    <?php endwhile; ?>
  </div>
</main>
<script>
(function(){ const {mount,$,crumbs}=COA; mount(<?php echo wp_json_encode($wc ? 'shop' : ''); ?>);
  $("#crumbs").innerHTML=crumbs([[<?php echo wp_json_encode($key === 'cart' ? 'Your bag' : get_the_title()); ?>]]); })();
</script>
<?php get_footer();
