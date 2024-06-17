/* global WPFormsAdmin, wpforms_admin */

'use strict';

/**
 * WPForms GoogleSheets admin module.
 *
 * @since 1.0.0
 */
const WPFormsGoogleSheetsAdmin = window.WPFormsGoogleSheetsAdmin || ( function( document, window, $ ) {

	/**
	 * Public functions and properties.
	 *
	 * @since 1.0.0
	 *
	 * @type {object}
	 */
	const app = {

		/**
		 * jQuery object for holder.
		 *
		 * @since 1.0.0
		 *
		 * @type {jQuery}
		 */
		$holder: null,

		/**
		 * Start the engine.
		 *
		 * @since 1.0.0
		 */
		init: function() {

			$( app.ready );
		},

		/**
		 * Initialized once the DOM is fully loaded.
		 *
		 * @since 1.0.0
		 */
		ready: function() {

			app.$holder = $( '.wpforms-settings-provider-accounts-toggle-google-sheets' );

			$( document ).on( 'wpformsProviderRemoved', app.removeProvider );
			app.$holder
				.on( 'click', '.wpforms-btn', app.saveCredentials )
				.on( 'click', '.js-wpforms-google-sheets-setting-field-redirect-uri-copy', app.copyUrlClick );
		},

		/**
		 * Make the add a new account form visible.
		 *
		 * @since 1.0.0
		 *
		 * @param {event} e Event.
		 * @param {jQuery} $provider Provider wrapper.
		 */
		removeProvider: function( e, $provider ) {

			if ( $provider.attr( 'id' ) !== 'wpforms-integration-google-sheets' ) {
				return;
			}

			$provider.find( '.wpforms-settings-provider-accounts-toggle-google-sheets' ).removeClass( 'wpforms-hidden' );
		},

		/**
		 * Save credentials.
		 *
		 * @since 1.0.0
		 *
		 * @param {Event} e Click event.
		 */
		saveCredentials: function( e ) {

			e.preventDefault();

			const $btn = $( this );
			const mode = app.getFormMode( $btn );

			if ( ! app.isValidForm( $btn ) ) {
				WPFormsAdmin.integrationError( '<p>' + wpforms_admin.provider_auth_error + '</p><p>' + wpforms_admin.google_sheets_required_fields + '</p>' );

				return;
			}

			const data = {
				'nonce': wpforms_admin.nonce,
				'action': 'wpforms_google_sheets_get_auth_url',
				'account_name': app.getFieldValueByName( 'account_name' ),
				'mode': mode,
			};

			if ( mode === 'advanced' ) {
				data['client_id'] = app.getFieldValueByName( 'client_id' );
				data['client_secret'] = app.getFieldValueByName( 'client_secret' );
			}

			app.request( data, $btn );
		},

		/**
		 * Validate the form.
		 *
		 * @since 1.0.0
		 *
		 * @param {jQuery} $btn Button.
		 *
		 * @returns {boolean} Is the form valid?
		 */
		isValidForm: function( $btn ) {

			const mode = app.getFormMode( $btn );

			if ( mode !== 'advanced' ) {
				return true;
			}

			const clientId = app.getFieldValueByName( 'client_id' );
			const clientSecret = app.getFieldValueByName( 'client_secret' );

			return Boolean( clientId.length && clientSecret.length );
		},

		/**
		 * Get a form field value by name.
		 *
		 * @since 1.0.0
		 *
		 * @param {string} name The field name.
		 *
		 * @returns {string} Field value.
		 */
		getFieldValueByName: function( name ) {

			const $field = $( '[name="' + name + '"]', app.$holder );

			return $field.length ? $field.val().toString().trim() : '';
		},

		/**
		 * Get the form mode.
		 *
		 * @since 1.0.0
		 *
		 * @param {jQuery} $btn Button.
		 *
		 * @returns {string} Custom or pro form type.
		 */
		getFormMode: function( $btn ) {

			return $btn.closest( '.wpforms-settings-provider-accounts-connect' ).length ? 'advanced' : 'pro';
		},

		/**
		 * Make an AJAX request.
		 *
		 * @since 1.0.0
		 *
		 * @param {object} data Request data.
		 * @param {jQuery} $btn Submitted button.
		 */
		request: function( data, $btn ) {

			const buttonHTML = $btn.html();
			const buttonWidth = $btn.outerWidth();

			$.ajax(
				{
					url: wpforms_admin.ajax_url,
					type: 'post',
					dataType: 'json',
					data: data,
					beforeSend: function() {
						$btn.css( 'width', buttonWidth ).text( wpforms_admin.connecting ).prop( 'disabled', true );
					},
					success: function( response ) {
						window.location.href = response.data;
					},
					error: function( data ) {
						const response = JSON.parse( data.responseText );
						const errorMessage = Object.prototype.hasOwnProperty.call( response, 'data' ) && response.data ?
							response.data :
							wpforms_admin.something_went_wrong;

						WPFormsAdmin.integrationError( errorMessage );
					},
					complete: function() {
						$btn.css( 'width', '' ).html( buttonHTML ).prop( 'disabled', false );
					},
				},
			);
		},

		/**
		 * Copy URL button was clicked.
		 *
		 * @since 1.0.0
		 */
		copyUrlClick: function() {

			const $this = $( this );
			const $row = $this.closest( '.wpforms-google-sheets-setting-field-redirect-uri-row' );
			const activeClass = 'wpforms-google-sheets-setting-field-redirect-uri-copy-success';
			const $input = $( '.wpforms-google-sheets-setting-field-redirect-uri-input', $row );

			$input.select();

			navigator.clipboard.writeText( $input.val() ).then( function() {

				$this.addClass( activeClass );

				setTimeout( function() {

					$this.removeClass( activeClass );
				}, 500 );
			} );
		},
	};

	return app;
}( document, window, jQuery ) );

// Initialize.
WPFormsGoogleSheetsAdmin.init();
