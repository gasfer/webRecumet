<?php

namespace WPFormsGoogleSheets\Provider\Settings;

use WPFormsGoogleSheets\Plugin;
use WPForms\Providers\Provider\Core;
use WPForms\Providers\Provider\Status;
use WPForms\Providers\Provider\Settings\PageIntegrations as PageIntegrationsAbstract;

/**
 * Class PageIntegrations handles functionality inside the Settings > Integrations page.
 *
 * @since 1.0.0
 */
class PageIntegrations extends PageIntegrationsAbstract {

	/**
	 * Integrations constructor.
	 *
	 * @since 1.0.0
	 *
	 * @param Core $core Core provider object.
	 */
	public function __construct( Core $core ) {

		$this->hooks();
		parent::__construct( $core );
	}

	/**
	 * Add hooks.
	 *
	 * @since 1.0.0
	 */
	private function hooks() {

		add_action( 'wp_ajax_wpforms_google_sheets_get_auth_url', [ $this, 'get_auth_url' ] );

		if ( ! wpforms_is_admin_page( 'settings', 'integrations' ) ) {
			return;
		}

		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_styles' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
		add_action( 'wpforms_admin_strings', [ $this, 'admin_strings' ] );
	}

	/**
	 * Enqueue styles.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_styles() {

		$min = wpforms_get_min_suffix();

		wp_enqueue_style(
			'wpforms-google-sheets-admin',
			WPFORMS_GOOGLE_SHEETS_URL . "assets/css/admin{$min}.css",
			[],
			WPFORMS_GOOGLE_SHEETS_VERSION
		);
	}

	/**
	 * Enqueue scripts.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_scripts() {

		$min = wpforms_get_min_suffix();

		wp_enqueue_script(
			'wpforms-google-sheets-admin',
			WPFORMS_GOOGLE_SHEETS_URL . "assets/js/admin{$min}.js",
			[ 'jquery' ],
			WPFORMS_GOOGLE_SHEETS_VERSION,
			true
		);
	}

	/**
	 * New connection form.
	 *
	 * @since 1.0.0
	 */
	protected function display_add_new_connection_fields() {

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo wpforms_google_sheets()->get( 'account' )->get_advanced_form();
	}

	/**
	 * Any new connection should be added.
	 * So display the content of that.
	 *
	 * @since 1.0.0
	 */
	protected function display_add_new() {

		$classes = [ 'wpforms-settings-provider-accounts-toggle-google-sheets' ];

		if ( Status::init( $this->core->slug )->is_configured() ) {
			$classes[] = 'wpforms-hidden';
		}

		?>

		<div class="<?php echo wpforms_sanitize_classes( $classes, true ); ?>">

			<p>
				<a class="wpforms-btn wpforms-btn-md wpforms-btn-light-grey" href="#"
				   data-provider="<?php echo esc_attr( $this->core->slug ); ?>">
					<i class="fa fa-plus"></i> <?php esc_html_e( 'Add New Account', 'wpforms-google-sheets' ); ?>
				</a>
			</p>
			<p>
				<a href="<?php echo esc_url( wpforms_utm_link( 'https://wpforms.com/docs/google-sheets-addon/', 'Integration Settings', 'Google Sheets Documentation' ) ); ?>" target="_blank" rel="noopener noreferrer">
					<?php esc_html_e( 'Click here for documentation on connecting WPForms with Google Sheets.', 'wpforms-google-sheets' ); ?>
				</a>
			</p>
			<p class="wpforms-settings-provider-accounts-toggle">
				<?php esc_html_e( 'Need a custom application?', 'wpforms-google-sheets' ); ?>
				<a href="#" data-provider="<?php echo esc_attr( $this->core->slug ); ?>">
					<?php esc_html_e( 'Enable Advanced Mode', 'wpforms-google-sheets' ); ?></a>
			</p>

			<div class="wpforms-settings-provider-accounts-connect">

				<form>
					<p><?php esc_html_e( 'Please fill out all of the fields below to add your new provider account.', 'wpforms-google-sheets' ); ?></span></p>

					<p class="wpforms-settings-provider-accounts-connect-fields">
						<?php
						// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
						echo wpforms_google_sheets()->get( 'account' )->get_advanced_form();
						?>
					</p>

					<?php
					/* translators: %s is the provider name. */
					$title = sprintf( __( 'Connect to %s', 'wpforms-google-sheets' ), $this->core->name );
					?>
					<button type="submit"
							class="wpforms-btn wpforms-btn-md wpforms-btn-orange"
							title="<?php echo esc_attr( $title ); ?>">
						<?php echo esc_html( $title ); ?>
					</button>
				</form>
			</div>
		</div>
		<?php
	}

	/**
	 * Get page URL.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	private function get_page_url() {

		return add_query_arg(
			[
				'page'                => 'wpforms-settings',
				'view'                => 'integrations',
				'wpforms-integration' => Plugin::SLUG,
			],
			admin_url( 'admin.php' )
		);
	}

	/**
	 * Get auth link.
	 *
	 * @since 1.0.0
	 */
	public function get_auth_url() {

		check_ajax_referer( 'wpforms-admin', 'nonce' );

		if ( empty( $_POST['mode'] ) ) {
			wp_send_json_error( '', 400 );
		}

		$args = [
			'return' => $this->get_page_url(),
		];

		if ( $_POST['mode'] !== 'advanced' ) {
			wp_send_json_success(
				wpforms_google_sheets()
					->get( 'client' )
					->get_auth_url( $args )
			);
		}

		if ( empty( $_POST['client_id'] ) || empty( $_POST['client_secret'] ) ) {
			wp_send_json_error( '', 400 );
		}

		$args['client_id']     = sanitize_text_field( wp_unslash( $_POST['client_id'] ) );
		$args['client_secret'] = sanitize_text_field( wp_unslash( $_POST['client_secret'] ) );

		wp_send_json_success(
			wpforms_google_sheets()
				->get( 'client' )
				->get_auth_url( $args, 'custom' )
		);
	}

	/**
	 * AJAX to disconnect a provider from the settings integrations tab.
	 *
	 * @since 1.0.0
	 */
	public function ajax_disconnect() {

		if ( ! check_ajax_referer( 'wpforms-admin', 'nonce', false ) ) {
			wp_send_json_error(
				[
					'error_msg' => esc_html__( 'Your session expired. Please reload the page.', 'wpforms-google-sheets' ),
				]
			);
		}

		wpforms_google_sheets()->get( 'account' )->deactivate();

		parent::ajax_disconnect();
	}

	/**
	 * Rewrite connected account view template.
	 *
	 * @since 1.0.0
	 *
	 * @param string $account_id Account ID.
	 * @param array  $account    Account data.
	 */
	protected function display_connected_account( $account_id, $account ) {

		$account_connected = ! empty( $account['date'] ) ? wpforms_date_format( $account['date'] ) : __( 'N/A', 'wpforms-google-sheets' );
		$account_name      = ! empty( $account['label'] ) ? $account['label'] : '<em>' . __( 'No Label', 'wpforms-google-sheets' ) . '</em>';

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo wpforms_render(
			WPFORMS_GOOGLE_SHEETS_PATH . 'templates/settings/connected-account',
			[
				'reauth_url'        => $this->get_account_reauth_url( $account ),
				'account_name'      => $account_name,
				'account_connected' => $account_connected,
				'account_id'        => $account_id,
				'slug'              => $this->core->slug,
			],
			true
		);
	}


	/**
	 * Add reconnect authorization notice when access token is invalid.
	 *
	 * @since 1.0.0
	 *
	 * @param array $account Account data.
	 *
	 * @return string
	 */
	public function get_account_reauth_url( $account ) {

		if ( empty( $account['key'] ) || empty( $account['token'] ) || wpforms_google_sheets()->get( 'account' )->is_connected() ) {
			return '';
		}

		$args = [
			'return' => $this->get_page_url(),
			'key'    => $account['key'],
			'token'  => $account['token'],
		];

		$type = 'pro';

		if ( ! empty( $account['project_id'] ) ) {
			$args['projectid'] = $account['project_id'];
			$type              = 'custom';
		}

		return wpforms_google_sheets()->get( 'client' )->get_reauth_url( $args, $type );
	}

	/**
	 * Add own localized strings to the Builder.
	 *
	 * @since 1.0.0
	 *
	 * @param array $strings Localized strings.
	 *
	 * @return array
	 */
	public function admin_strings( $strings ) {

		$strings['google_sheets_required_fields'] = esc_html__( 'Please provide valid Google Client ID and Google Client Secret.', 'wpforms-google-sheets' );

		return $strings;
	}
}
