<?php

namespace WPFormsGoogleSheets\Api;

/**
 * OneTimeToken class.
 *
 * @since 1.0.0
 */
class OneTimeToken {

	/**
	 * One time token option.
	 *
	 * @since 1.0.0
	 */
	const ONE_TIME_TOKEN_OPTION = 'wpforms_google_sheets_one_time_token';

	/**
	 * Get the one time token value.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	public function get() {

		$one_time_token = get_option( self::ONE_TIME_TOKEN_OPTION );

		if ( $one_time_token ) {
			return $one_time_token;
		}

		return $this->refresh();
	}

	/**
	 * Refresh the one time token value.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	public function refresh() {

		$auth_salt = defined( 'AUTH_SALT' ) ? AUTH_SALT : '';

		$one_time_token = hash(
			'sha512',
			wp_generate_password(
				128,
				true,
				true
			) . $auth_salt . uniqid( '', true )
		);

		update_option( self::ONE_TIME_TOKEN_OPTION, $one_time_token );

		return $one_time_token;
	}

	/**
	 * Verify the one time token value.
	 *
	 * @since 1.0.0
	 *
	 * @param string $passed A passed token value.
	 *
	 * @return bool
	 */
	public function validate( $passed ) {

		return hash_equals( $this->get(), $passed );
	}
}
