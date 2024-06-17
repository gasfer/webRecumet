<?php
/**
 * Plugin Name:       WPForms Google Sheets
 * Plugin URI:        https://wpforms.com
 * Description:       Google Sheets integration with WPForms.
 * Author:            WPForms
 * Author URI:        https://wpforms.com
 * Version:           1.0.0
 * Requires at least: 5.2
 * Requires PHP:      5.6
 * Text Domain:       wpforms-google-sheets
 * Domain Path:       /languages
 *
 * WPForms is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * any later version.
 *
 * WPForms is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with WPForms. If not, see <https://www.gnu.org/licenses/>.
 *
 * @since     1.0.0
 * @author    WPForms
 * @package   WPFormsGoogleSheets
 * @license   GPL-2.0+
 * @copyright Copyright (c) 2022, WPForms LLC
 */

use WPFormsGoogleSheets\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WPForms Google Sheets version.
 *
 * @since 1.0.0
 */
const WPFORMS_GOOGLE_SHEETS_VERSION = '1.0.0';

/**
 * WPForms Google Sheets path to main file.
 *
 * @since 1.0.0
 */
const WPFORMS_GOOGLE_SHEETS_FILE = __FILE__;

/**
 * WPForms Google Sheets path to directory.
 *
 * @since 1.0.0
 */
define( 'WPFORMS_GOOGLE_SHEETS_PATH', plugin_dir_path( WPFORMS_GOOGLE_SHEETS_FILE ) );

/**
 * WPForms Google Sheets URL to directory.
 *
 * @since 1.0.0
 */
define( 'WPFORMS_GOOGLE_SHEETS_URL', plugin_dir_url( WPFORMS_GOOGLE_SHEETS_FILE ) );

/**
 * Check addon requirements.
 *
 * @since 1.0.0
 */
function wpforms_google_sheets_required() {

	if ( PHP_VERSION_ID < 50600 ) {
		add_action( 'admin_init', 'wpforms_google_sheets_deactivation' );
		add_action( 'admin_notices', 'wpforms_google_sheets_fail_php_version' );

		return false;
	}

	if (
		! function_exists( 'wpforms' ) ||
		! wpforms()->is_pro() ||
		version_compare( wpforms()->version, '1.7.7.2', '<' )
	) {
		add_action( 'admin_init', 'wpforms_google_sheets_deactivation' );
		add_action( 'admin_notices', 'wpforms_google_sheets_fail_wpforms_version' );

		return false;
	}

	if (
		! function_exists( 'wpforms_get_license_type' ) ||
		! in_array( wpforms_get_license_type(), [ 'pro', 'elite', 'agency', 'ultimate' ], true )
	) {
		return false;
	}

	return true;
}

/**
 * Deactivate the plugin.
 *
 * @since 1.0.0
 */
function wpforms_google_sheets_deactivation() {

	deactivate_plugins( plugin_basename( __FILE__ ) );
}

/**
 * Admin notice for minimum PHP version.
 *
 * @since 1.0.0
 */
function wpforms_google_sheets_fail_php_version() {

	echo '<div class="notice notice-error"><p>';
	printf(
		wp_kses( /* translators: %s is WPForms.com documentation page URI. */
			__( 'The WPForms Google Sheets plugin has been deactivated. Your site is running an outdated version of PHP that is no longer supported and is not compatible with the Google Sheets plugin. <a href="%s" target="_blank" rel="noopener noreferrer">Read more</a> for additional information.', 'wpforms-google-sheets' ),
			[
				'a' => [
					'href'   => [],
					'rel'    => [],
					'target' => [],
				],
			]
		),
		esc_url( wpforms_utm_link( 'https://wpforms.com/docs/supported-php-version/', 'all-plugins', 'Google Sheets PHP Notice' ) )
	);
	echo '</p></div>';

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	unset( $_GET['activate'] );
}

/**
 * Admin notice for minimum WPForms version.
 *
 * @since 1.0.0
 */
function wpforms_google_sheets_fail_wpforms_version() {

	echo '<div class="notice notice-error"><p>';
	esc_html_e( 'The WPForms Google Sheets plugin has been deactivated, because it requires WPForms Pro 1.7.7.2 to work.', 'wpforms-google-sheets' );
	echo '</p></div>';

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	unset( $_GET['activate'] );
}

/**
 * Get the instance of the `\WPFormsGoogleSheets\Plugin` class.
 * This function is useful for quickly grabbing data and object instances used throughout the plugin.
 *
 * @since 1.0.0
 *
 * @return Plugin|void
 */
function wpforms_google_sheets() {

	if ( ! wpforms_google_sheets_required() ) {
		return;
	}

	// Actually, load the Google Sheets addon now, as we met all the requirements.
	require_once __DIR__ . '/vendor/autoload.php';

	return Plugin::get_instance();
}
add_action( 'wpforms_loaded', 'wpforms_google_sheets' );
