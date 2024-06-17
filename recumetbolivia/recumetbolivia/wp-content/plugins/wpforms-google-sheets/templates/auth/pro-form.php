<?php
/**
 * Pro auth form template.
 *
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<p><?php esc_html_e( 'You’re going to be taken to Google to authenticate your account.', 'wpforms-google-sheets' ); ?></p>

<?php
// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
echo wpforms_render( WPFORMS_GOOGLE_SHEETS_PATH . 'templates/auth/errors' );
