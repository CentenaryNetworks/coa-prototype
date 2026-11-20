<?php
/* Fallback for anything without its own template (blog posts, archives). */
get_header(); ?>
<main id="top" class="wc5"><div class="wrap">
<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
  <article class="wc5-body"><h1 class="wc5-title"><?php the_title(); ?></h1><?php the_content(); ?></article>
<?php endwhile; else : ?><p>Nothing here yet.</p><?php endif; ?>
</div></main>
<script>COA.mount("");</script>
<?php get_footer();
