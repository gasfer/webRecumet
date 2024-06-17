<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'uiktsnmy_WPMWP');

/** Database username */
define('DB_USER', 'uiktsnmy_WPMWP');

/** Database password */
define('DB_PASSWORD', 'kTLJGBhTe2iPoy.Sd');

/** Database hostname */
define('DB_HOST', 'localhost');

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY', 'cab46ba67c9f31dea7bd37867240ff242de03ba70aaf5c7e8660cadcb5cb64f1');
define('SECURE_AUTH_KEY', 'b7ba74baf5dca22bd998ed22dde82229fb6ebbc450c4202192295b0a3c7935bc');
define('LOGGED_IN_KEY', '2749325d37c15a2003abe0f5695c996d05810f89d10fe08048035cd6395688db');
define('NONCE_KEY', 'bd1cd2c7ec457bf9d84c4418876d2f5b551116363ae46e14983ebd174c11274a');
define('AUTH_SALT', 'b34d4edb20a76a399765684c5e9afe8e7eb0481f03a5cac3c0f1e949382e9359');
define('SECURE_AUTH_SALT', 'a7a037736c31fbdb77833130dc1b815c618bf3eb53ec1c42ef2d6b29b32c5cfb');
define('LOGGED_IN_SALT', '51603ac809825a4c992642a32bcd809e16347d6d4d7faae35c3789dfd9ccc9f9');
define('NONCE_SALT', 'a2595f471e8887889c0609a32a20fb95ee1f7a177253957c35aa9f56012c91a9');

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'qOT_';
define('WP_CRON_LOCK_TIMEOUT', 120);
define('AUTOSAVE_INTERVAL', 300);
define('WP_POST_REVISIONS', 5);
define('EMPTY_TRASH_DAYS', 7);
define('WP_AUTO_UPDATE_CORE', true);

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
