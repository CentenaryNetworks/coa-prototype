<?php
/* A page drawn from the approved v5 design (views/*.html). */
get_header();
if (!coa_view(coa_current_view() ?: '404')) coa_view('404');
get_footer();
