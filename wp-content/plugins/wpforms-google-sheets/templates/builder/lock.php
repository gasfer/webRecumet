<?php
/**
 * Lock template.
 *
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<input type="hidden"
	   class="wpforms-builder-provider-connections-save-lock"
	   value="0"
	   name="providers[{{ data.provider }}][__lock__]">
