<?php
/**
 * Connected account template.
 *
 * @since 1.0.0
 *
 * @var string $reauth_url        Reconnect account URL.
 * @var string $account_name      Account name.
 * @var string $account_connected Connected time.
 * @var string $account_id        Account ID.
 * @var string $slug              Provider slug.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>

<li class="wpforms-clear">
	<?php if ( $reauth_url ) : ?>
		<div class="wpforms-alert wpforms-alert-danger wpforms-alert-dismissible">
			<div class="wpforms-alert-message">
				<p>
					<?php esc_html_e( 'Your Google account connection has expired. Please reconnect your account.', 'wpforms-google-sheets' ); ?>
				</p>
			</div>

			<div class="wpforms-alert-buttons">
				<a href="<?php echo esc_url( $reauth_url ); ?>"
				   rel="noopener noreferrer"
				   class="wpforms-btn wpforms-btn-md wpforms-btn-light-grey">
					<?php esc_html_e( 'Reconnect', 'wpforms-google-sheets' ); ?>
				</a>
			</div>
		</div>
	<?php endif; ?>

	<span class="label">
		<?php echo wp_kses( $account_name, [ 'em' => [] ] ); ?>
	</span>

	<span class="date">
		<?php
		printf( /* translators: %s is a connection creation date. */
			esc_html__( 'Connected on: %s', 'wpforms-google-sheets' ),
			esc_html( $account_connected )
		);
		?>
	</span>

	<span class="remove">
		<a href="#"
		   data-provider="<?php echo esc_attr( $slug ); ?>"
		   data-key="<?php echo esc_attr( $account_id ); ?>">
			<?php esc_html_e( 'Disconnect', 'wpforms-google-sheets' ); ?>
		</a>
	</span>
</li>
