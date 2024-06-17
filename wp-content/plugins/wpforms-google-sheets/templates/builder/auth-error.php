<?php
/**
 * Auth notice template.
 *
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wpforms-alert wpforms-alert-danger wpforms-alert-dismissible">
	<div class="wpforms-alert-message">
		<p>
			<?php esc_html_e( 'Your Google account connection has expired. Please reconnect your account.', 'wpforms-google-sheets' ); ?>
		</p>
	</div>

	<div class="wpforms-alert-buttons">
		<a href="{{ data.reauthUrl }}" rel="noopener noreferrer" class="wpforms-btn wpforms-btn-md wpforms-btn-light-grey">
			<?php esc_html_e( 'Reconnect', 'wpforms-google-sheets' ); ?>
		</a>
	</div>
</div>
