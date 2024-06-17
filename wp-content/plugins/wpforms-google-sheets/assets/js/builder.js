/* global WPForms, WPFormsBuilder, Choices, wpforms_builder, wpforms_builder_settings, wpf */

'use strict';

/**
 * WPForms Providers Builder Google Sheets module.
 *
 * @since 1.0.0
 */
WPForms.Admin.Builder.Providers.GoogleSheets = WPForms.Admin.Builder.Providers.GoogleSheets || ( function( document, window, $ ) {

	/**
	 * Public functions and properties.
	 *
	 * @since 1.0.0
	 *
	 * @type {object}
	 */
	const app = {

		/**
		 * Current provider slug.
		 *
		 * @since 1.0.0
		 *
		 * @type {string}
		 */
		provider: 'google-sheets',

		/**
		 * This is a flag for ready state.
		 *
		 * @since 1.0.0
		 *
		 * @type {boolean}
		 */
		isReady: false,

		/**
		 * jQuery object for holder.
		 *
		 * @since 1.0.0
		 *
		 * @type {jQuery}
		 */
		$holder: null,

		/**
		 * jQuery object for connections.
		 *
		 * @since 1.0.0
		 *
		 * @type {jQuery}
		 */
		$connections: null,

		/**
		 * This is a shortcut to the WPForms.Admin.Builder.Providers object,
		 * that handles the parent all-providers functionality.
		 *
		 * @since 1.0.0
		 *
		 * @type {object}
		 */
		Providers: {},

		/**
		 * Addon templates.
		 *
		 * @since 1.0.0
		 */
		templates: {

			/**
			 * List of GoogleSheets templates that should be compiled.
			 *
			 * @since 1.0.0
			 *
			 * @type {object}
			 */
			config: [
				'wpforms-google-sheets-builder-content-auth-error',
				'wpforms-google-sheets-builder-content-conditionals',
				'wpforms-google-sheets-builder-content-connection',
				'wpforms-google-sheets-builder-content-connection-error',
				'wpforms-google-sheets-builder-content-connection-conditionals',
				'wpforms-google-sheets-builder-content-error',
				'wpforms-google-sheets-builder-content-fields',
				'wpforms-google-sheets-builder-content-sheet-select',
				'wpforms-google-sheets-builder-content-lock',
				'wpforms-google-sheets-builder-content-new-account-advanced-form',
			],

			/**
			 * This is a shortcut to the WPForms.Admin.Builder.Templates object,
			 * that handles all the template management.
			 *
			 * @since 1.0.0
			 *
			 * @type {object}
			 */
			providerTemplates: {},

			/**
			 * Load templates.
			 *
			 * @since 1.0.0
			 */
			load: function() {
				app.templates.providerTemplates = WPForms.Admin.Builder.Templates;

				app.templates.providerTemplates.add( app.templates.config );
			},

			/**
			 * Render an underscore template.
			 *
			 * @since 1.0.0
			 *
			 * @param {string} templateName Template name.
			 * @param {object} args Arguments for passing in the template.
			 *
			 * @returns {string} Template markup.
			 */
			render: function( templateName, args = {} ) {

				templateName = 'wpforms-' + app.provider + '-builder-content-' + templateName;

				const template = app.templates.providerTemplates.get( templateName );

				return template( args );
			},
		},

		/**
		 * Addon cache.
		 *
		 * @since 1.0.0
		 */
		cache: {

			/**
			 * This is a shortcut to the WPForms.Admin.Builder.Providers.cache object,
			 * that handles all the cache management.
			 *
			 * @since 1.0.0
			 */
			providerCache: {},

			/**
			 * Retrieving a connection from cache.
			 *
			 * @since 1.0.0
			 *
			 * @param {string} connectionId Connection ID.
			 *
			 * @returns {object|null} A connection.
			 */
			getConnection: function( connectionId ) {

				const connection = app.cache.providerCache.getById( app.provider, 'connections', connectionId );

				if ( _.isObject( connection ) ) {
					return connection;
				}

				return null;
			},

			/**
			 * Retrieving spreadsheets from cache.
			 *
			 * @since 1.0.0
			 *
			 * @returns {object|null} Spreadsheet list.
			 */
			getSpreadsheets: function() {

				const spreadsheetsCache = app.cache.providerCache.get( app.provider, 'spreadsheets' );

				if ( ! _.isEmpty( spreadsheetsCache ) ) {
					return spreadsheetsCache;
				}

				return null;
			},

			/**
			 * Retrieving a spreadsheet sheets from cache.
			 *
			 * @since 1.0.0
			 *
			 * @param {string} spreadsheetId Spreadsheet ID.
			 *
			 * @returns {object|null} A spreadsheet sheets.
			 */
			getSheets: function( spreadsheetId ) {

				const cachedSheets = app.cache.providerCache.getById( app.provider, 'sheets', spreadsheetId );

				if ( _.isObject( cachedSheets ) ) {
					return cachedSheets;
				}

				return null;
			},

			/**
			 * Adding a spreadsheet sheets to the cache.
			 *
			 * @since 1.0.0
			 *
			 * @param {string} spreadsheetId Spreadsheet ID.
			 * @param {object} sheets Spreadsheet sheets.
			 */
			addToSheets: function( spreadsheetId, sheets ) {

				app.cache.providerCache.addTo( app.provider, 'sheets', spreadsheetId, sheets );
			},

			/**
			 * Retrieving a list columns from cache.
			 *
			 * @since 1.0.0
			 *
			 * @param {string} spreadsheetId Spreadsheet ID.
			 * @param {string} sheetId Sheet ID.
			 *
			 * @returns {object|null} List columns.
			 */
			getColumns: function( spreadsheetId, sheetId ) {

				const cachedColumns = app.cache.providerCache.getById( app.provider, 'columns', spreadsheetId );

				if (
					_.isObject( cachedColumns ) &&
					_.has( cachedColumns, sheetId ) &&
					_.isObject( cachedColumns[sheetId] )
				) {
					return cachedColumns[sheetId];
				}

				return null;
			},
		},

		/**
		 * Start the engine.
		 *
		 * Run initialization on the settings panel only.
		 *
		 * @since 1.0.0
		 */
		init: function() {

			const panelName = 'settings';

			if ( wpf.getQueryString( 'view' ) === panelName ) {
				$( '#wpforms-panel-' + panelName ).on( 'WPForms.Admin.Builder.Providers.ready', app.ready );
			}

			// We have switched to Providers panel.
			$( document ).on( 'wpformsPanelSwitched', function( e, panel ) {

				if ( panel === panelName ) {
					app.ready();
				}
			} );
		},

		/**
		 * Initialized once the DOM and Providers are fully loaded.
		 *
		 * @since 1.0.0
		 */
		ready: function() {

			if ( app.isReady ) {
				return;
			}

			app.Providers = WPForms.Admin.Builder.Providers;
			app.cache.providerCache = app.Providers.cache;
			app.$holder = app.Providers.getProviderHolder( app.provider );
			app.$connections = app.$holder.find( '.wpforms-builder-provider-connections' );

			app.templates.load();

			app.bindUIActions();
			app.bindTriggers();
			app.processInitial();

			app.isReady = true;
		},

		/**
		 * Process various events as a response to UI interactions.
		 *
		 * @since 1.0.0
		 */
		bindUIActions: function() {

			app.Providers.ui.account.registerAddHandler( app.provider, app.ui.account.add );

			$( document )
				.on( 'click', '.js-wpforms-google-sheets-setting-field-redirect-uri-copy', app.ui.account.copyUrlClick )
				.on( 'click', '.js-wpforms-google-sheets-change-mode', app.ui.account.switchToAdvancedMode )
				.on( 'wpformsFieldUpdate', app.ui.customFields.mapSelectFields );

			$( '#wpforms-builder' ).on( 'wpformsSaved', app.ui.connection.refreshConnections );

			app.$holder
				.on( 'click', '.wpforms-alert .wpforms-btn', app.ui.account.reconnect )
				.on( 'connectionCreate', app.ui.connection.create )
				.on( 'connectionDelete', app.ui.connection.delete )
				.on( 'change', '.js-wpforms-builder-google-sheets-provider-connection-spreadsheet-id', app.ui.spreadsheetField.changeSpreadsheet )
				.on( 'change', '.js-wpforms-builder-google-sheets-provider-connection-sheet-id', app.ui.sheetField.changeSheet )
				.on( 'change', '.js-wpforms-builder-google-sheets-provider-connection-spreadsheet-id, .js-wpforms-builder-google-sheets-provider-connection-sheet-id', app.ui.docLink.changeFields )
				.on( 'click', '.js-wpforms-builder-google-sheets-provider-connection-fields-add', app.ui.customFields.addNewRow )
				.on( 'change', '.js-wpforms-builder-provider-connection-field-id', app.ui.customFields.changeFieldIdField )
				.on( 'accountAddModal.onOpenBefore', app.ui.account.updatePopup );
		},

		/**
		 * Fire certain events on certain actions, specific for related connections.
		 * These are not directly caused by user manipulations.
		 *
		 * @since 1.0.0
		 */
		bindTriggers: function() {

			app.$holder.on( 'connectionsDataLoaded', function( e, data ) {

				if ( _.isEmpty( data.connections ) ) {
					return;
				}

				for ( const connectionId in data.connections ) {
					app.ui.connection.generate( data.connections[connectionId] );
				}
			} );

			app.$holder.on( 'connectionGenerated', function( e, data ) {

				const $connection = app.ui.connection.getById( data.connection.id );
				const $spreadsheetIdField = $( '.js-wpforms-builder-google-sheets-provider-connection-spreadsheet-id', $connection );

				if ( app.ui.connection.isNewConnection( data.connection ) ) {
					app.ui.connection.replaceConnectionIds( data.connection.id, $connection );
				}

				new Choices( $spreadsheetIdField.get( 0 ), wpforms_builder_settings.choicesjs_config );

				const nonEditableSpreadsheets = app.cache.providerCache.get( app.provider, 'non_editable_spreadsheets' );

				if (
					Object.prototype.hasOwnProperty.call( data.connection, 'spreadsheet_id' ) &&
					Object.values( nonEditableSpreadsheets ).includes( data.connection.spreadsheet_id )
				) {
					app.ui.connection.lock( data.connection );
				}
			} );
		},

		/**
		 * Compile template with data if any and display them on a page.
		 *
		 * @since 1.0.0
		 */
		processInitial: function() {

			app.$holder.prepend( app.tmpl.commonsHTML() );
			app.ui.connection.dataLoad();
		},

		/**
		 * All methods that modify UI of a page.
		 *
		 * @since 1.0.0
		 */
		ui: {

			/**
			 * Make a field required visible or not required and hidden.
			 *
			 * @since 1.0.0
			 *
			 * @param {jQuery} $fieldWrapper Field wrapper element.
			 * @param {boolean} isVisible A boolean (not just truthy/falsy) value to determine whether the class should be added or removed.
			 * @param {boolean} isRequired A boolean (not just truthy/falsy) value to determine whether the class should be added or removed.
			 */
			toggleFieldVisibility: function( $fieldWrapper, isVisible, isRequired = false ) {

				const $field = $fieldWrapper.find( 'select, input' );

				if ( isVisible ) {
					$field.removeClass( 'wpforms-disabled' ).removeClass( 'wpforms-required' );
					$fieldWrapper.removeClass( 'wpforms-hidden' );

					return;
				}

				$field.addClass( 'wpforms-disabled' );
				$fieldWrapper.addClass( 'wpforms-hidden' );

				if ( isRequired ) {
					$field.addClass( 'wpforms-required' );
				}
			},

			/**
			 * The spreadsheet field methods.
			 *
			 * @since 1.0.0
			 */
			spreadsheetField: {

				/**
				 * Change a spreadsheet.
				 *
				 * @since 1.0.0
				 */
				changeSpreadsheet: function() {

					const $this = $( this );
					const val = $this.val();
					const $connection = $this.closest( '.wpforms-builder-provider-connection' );
					const $sheetIdWrapper = $( '.wpforms-builder-google-sheets-provider-sheet-id', $connection );
					const $sheetIdField = $sheetIdWrapper.find( 'select', $connection );
					const $sheetNameWrapper = $( '.wpforms-builder-google-sheets-provider-sheet-name', $connection );
					const $spreadsheetNameWrapper = $( '.wpforms-builder-google-sheets-provider-spreadsheet-name', $connection );

					app.ui.connection.unlock( $connection );

					if ( val === '' || val === null ) {
						app.ui.toggleFieldVisibility( $spreadsheetNameWrapper, false );
						app.ui.toggleFieldVisibility( $sheetIdWrapper, false );
						app.ui.toggleFieldVisibility( $sheetNameWrapper, false );
						$sheetIdField.val( '' );

						return;
					}

					const $spreadsheetNameField = $spreadsheetNameWrapper.find( 'input' );
					const $sheetNameField = $sheetNameWrapper.find( 'input' );

					if ( val === 'new' ) {
						app.ui.toggleFieldVisibility( $spreadsheetNameWrapper, true );
						app.ui.toggleFieldVisibility( $sheetIdWrapper, false, true );
						app.ui.toggleFieldVisibility( $sheetNameWrapper, true );
						$sheetIdField.val( 'new' ).removeAttr( 'disabled' ).removeClass( 'wpforms-disabled' ).trigger( 'change' );
						$spreadsheetNameField.val( '' );
						$sheetNameField.val( '' );

						return;
					}

					const connectionId = $connection.data( 'connection_id' );
					const spreadsheetId = $this.val();
					const nonEditableSpreadsheets = app.cache.providerCache.get( app.provider, 'non_editable_spreadsheets' );

					if ( Object.values( nonEditableSpreadsheets ).includes( spreadsheetId ) ) {
						const connection = app.cache.getConnection( connectionId );

						app.ui.connection.generate( connection );

						return;
					}

					const cachedSheets = app.cache.getSheets( spreadsheetId );

					app.ui.toggleFieldVisibility( $spreadsheetNameWrapper, false );
					app.ui.toggleFieldVisibility( $sheetIdWrapper, true, true );
					app.ui.toggleFieldVisibility( $sheetNameWrapper, false );

					if ( cachedSheets ) {
						app.tmpl.sheetField( cachedSheets, $connection );

						return;
					}

					app.ui.spreadsheetField.requestData( $connection );
				},

				/**
				 * Request data.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $connection Connection element.
				 */
				requestData: function( $connection ) {

					const spreadsheetId = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id select', $connection ).val();
					const $sheetIdWrapper = $( '.wpforms-builder-google-sheets-provider-sheet-id', $connection );
					const $sheetIdField = $sheetIdWrapper.find( 'select' );

					app.Providers.ajax
						.request( app.provider, {
							data: {
								'task': 'spreadsheet_data_get',
								'spreadsheet_id': spreadsheetId,
							},
						} )
						.done( function( response ) {

							if ( _.isEmpty( response.data.sheets ) ) {
								return;
							}

							app.cache.addToSheets( spreadsheetId, response.data.sheets );
							app.tmpl.sheetField( response.data.sheets, $connection );
							$sheetIdField.val( '' ).trigger( 'change' );
						} );
				},

				/**
				 * Inform customer that he/she has non editable spreadsheets.
				 *
				 * @since 1.0.0
				 */
				nonEditableModal: function() {

					app.modal( wpforms_builder.google_sheets_non_editable_spreadsheets );
				},
			},

			/**
			 * The list field methods.
			 *
			 * @since 1.0.0
			 */
			sheetField: {

				/**
				 * Change a sheet.
				 *
				 * @since 1.0.0
				 */
				changeSheet: function() {

					const $this = $( this );
					const value = $this.val();
					const $connection = $this.closest( '.wpforms-builder-provider-connection' );
					const $spreadsheetIdField = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id select', $connection );
					const $sheetNameWrapper =  $( '.wpforms-builder-google-sheets-provider-sheet-name', $connection );

					app.ui.toggleFieldVisibility( $sheetNameWrapper, value === 'new' );

					if ( $spreadsheetIdField.val() ) {
						app.ui.sheetField.requestData( $connection );
					}
				},

				/**
				 * Request data.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $connection Connection element.
				 */
				requestData: function( $connection ) {

					const $spreadsheetIdField = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id select', $connection );
					const spreadsheetId = $spreadsheetIdField.val();
					const $sheetIdField = $( '.wpforms-builder-google-sheets-provider-sheet-id select', $connection );
					const sheetId = $sheetIdField.val();
					const $customFields = $( '.wpforms-builder-google-sheets-provider-connection-fields', $connection );

					if ( sheetId === null ) {

						return;
					}

					const customFields = app.ui.customFields.getValue( $connection );

					$customFields.removeClass( 'wpforms-hidden' );

					app.Providers.ajax
						.request( app.provider, {
							data: {
								'task': 'sheet_data_get',
								'spreadsheet_id': spreadsheetId,
								'sheet_id': sheetId,
								'custom_fields': customFields,
							},
						} )
						.done( function( response ) {

							if ( _.isEmpty( response.data.columns ) ) {
								return;
							}

							let hasNotMappedColumn = false;

							app.tmpl.customFields( $connection, response.data.columns, response.data.custom_fields );

							$customFields.find( '.wpforms-builder-provider-connection-fields-table-row' ).each( function() {

								const $this = $( this );
								const index = $( this ).index();

								// The 1st row is disabled and always equal to the entry ID.
								if ( index === 0 ) {
									return true;
								}

								const $name = $this.find( '.wpforms-builder-provider-connection-field-name' );
								const $fieldId = $this.find( '.wpforms-builder-provider-connection-field-id' );

								if ( ! $name.val() && $fieldId.val() ) {
									hasNotMappedColumn = true;

									return false;
								}
							} );

							if ( hasNotMappedColumn ) {
								app.modal( wpforms_builder.google_sheets_not_mapped_field_found );
							}
						} );
				},
			},

			/**
			 * The repeater for custom fields.
			 *
			 * @since 1.0.0
			 */
			customFields: {

				/**
				 * Get repeater fields value.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $connection Connection element.
				 *
				 * @returns {Array} List of custom fields in a key-value format.
				 */
				getValue: function( $connection ) {

					const $wrapper = $( '.wpforms-builder-google-sheets-provider-connection-fields', $connection );
					const customFields = [];

					$wrapper.find( 'tr' ).each( function() {

						const $row = $( this );
						const name = $( '.wpforms-builder-provider-connection-field-name', $row ).val();

						if ( ! name ) {
							return true;
						}

						const fieldId = $( '.wpforms-builder-provider-connection-field-id', $row ).val();
						const value = $( '.wpforms-builder-provider-connection-field-value', $row ).val();

						customFields.push( { name, 'field_id': fieldId, value } );
					} );

					return customFields;
				},

				/**
				 * Add a new repeater row.
				 *
				 * @since 1.0.0
				 *
				 * @param {Event} e Event.
				 */
				addNewRow: function( e ) {

					e.preventDefault();

					const $table = $( this ).closest( '.wpforms-builder-provider-connection-fields-table' );
					const $clone = $( 'tr', $table ).last().clone( true );
					const $nameField = $( '.wpforms-builder-provider-connection-field-name', $clone );
					const $fieldIdField = $( '.wpforms-builder-provider-connection-field-id', $clone );
					const $valueField = $( '.wpforms-builder-provider-connection-field-value', $clone );
					const nextID = parseInt( /\[.+]\[.+]\[.+]\[(\d+)]/.exec( $clone.find( '.wpforms-builder-provider-connection-field-name' ).attr( 'name' ) )[1], 10 ) + 1;
					const $valueFieldWrapper = $( '.wpforms-field-option-row', $clone );

					// Clear the row and increment the counter.
					app.ui.customFields.replaceFieldIndex( $nameField, nextID );
					app.ui.customFields.replaceFieldIndex( $fieldIdField, nextID );
					app.ui.customFields.replaceFieldIndex( $valueField, nextID );

					$( '.toggle-smart-tag-display', $clone ).removeClass( 'wpforms-hidden' );
					$valueFieldWrapper.addClass( 'wpforms-hidden' );
					$valueFieldWrapper.prev().attr( 'colspan', 2 );
					$( '.js-wpforms-builder-provider-connection-fields-delete', $clone ).removeClass( 'wpforms-hidden' );

					$( 'tbody', $table ).append( $clone.get( 0 ) );
				},

				/**
				 * Change the field_id field.
				 *
				 * @since 1.0.0
				 */
				changeFieldIdField: function() {

					const $this = $( this );
					const val = $this.val();
					const $row = $this.closest( '.wpforms-builder-provider-connection-fields-table-row' );
					const $formFieldWrapper = $this.closest( '.wpforms-builder-provider-connection-fields-table-column' );
					const $valueFieldWrapper = $( '.wpforms-field-option-row', $row );

					if ( val === 'custom' ) {
						$valueFieldWrapper.removeClass( 'wpforms-hidden' );
						$formFieldWrapper.removeAttr( 'colspan' );

						return;
					}

					$valueFieldWrapper.addClass( 'wpforms-hidden' );
					$formFieldWrapper.attr( 'colspan', 2 );
				},

				/**
				 * Replace field index.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $el A field element.
				 * @param {int} nextID ID for replacement.
				 */
				replaceFieldIndex: function( $el, nextID ) {

					const $label = $el.closest( 'label' );

					$el

						/**
						 * Replace all digits inside brackets after the [custom_fields] construction.
						 */
						.attr( 'name', $el.attr( 'name' ).replace( /\[custom_fields]\[(\d+)]/g, '[custom_fields][' + nextID + ']' ) )

						/**
						 * Replace all digits from the end of the string until first non-digit character is reached.
						 */
						.attr( 'id', $el.attr( 'id' ).replace( /\d+$/g, nextID ) )
						.removeAttr( 'disabled' )
						.val( '' );

					/**
					 * \d+$ matches all digits from the end of the string until a first another character.
					 */
					$label.attr( 'for', $label.attr( 'for' ).replace( /\d+$/g, nextID ) );
				},

				/**
				 * Map selects with form fields.
				 *
				 * @since 1.0.0
				 *
				 * @param {Event} e Event.
				 * @param {object} fields Form fields.
				 */
				mapSelectFields: function( e, fields ) {

					$( '.js-wpforms-builder-provider-connection-field-id' ).each( function() {

						const $select = $( this );
						const selected = $select.find( 'option:selected' ).val();

						app.ui.customFields.updateSelectOptions( $select, fields );

						if ( selected ) {
							$select.find( 'option[value="' + selected + '"]' ).prop( 'selected', true );
						}

						$( '#wpforms-builder' ).trigger( 'wpformsFieldSelectMapped', [ $select ] );
					} );
				},

				/**
				 * Update select options.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $select Select element.
				 * @param {object} fields Form fields.
				 */
				updateSelectOptions: function( $select, fields ) {

					const placeholder = wpforms_builder.google_sheets_select_form_field;

					$select.empty().append( $( '<option>', { value: '', text : placeholder } ) );

					if ( fields && ! $.isEmptyObject( fields ) ) {
						for ( const key in wpf.orders.fields ) {

							if ( ! Object.prototype.hasOwnProperty.call( wpf.orders.fields, key ) ) {
								continue;
							}

							const fieldID = wpf.orders.fields[ key ];

							if ( ! fields[ fieldID ] ) {
								continue;
							}

							const label = app.ui.customFields.getFieldLabel( fields[ fieldID ], fieldID );

							$select.append( $( '<option>', { value: fields[ fieldID ].id, text : label } ) );
						}
					}

					$select.append( $( '<option>', { value: 'custom', text: wpforms_builder.google_sheets_custom_value } ) );
				},

				/**
				 * Get a field label.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} field Field data.
				 * @param {int} fieldID Field ID.
				 *
				 * @returns {string} The field label.
				 */
				getFieldLabel: function( field, fieldID ) {

					return typeof field.label !== 'undefined' && field.label.toString().trim() !== '' ?
						wpf.sanitizeHTML( field.label.toString().trim() ) :
						wpforms_builder.field + ' #' + fieldID;
				},
			},

			/**
			 * New account modal.
			 *
			 * @since 1.0.0
			 */
			account: {

				/**
				 * Reconnect an account.
				 *
				 * @since 1.0.0
				 *
				 * @param {Event} e Event.
				 */
				reconnect: function( e ) {

					e.preventDefault();

					// eslint-disable-next-line camelcase
					wpforms_builder.exit_url = $( this ).attr( 'href' );

					WPFormsBuilder.formSave( true );
				},

				/**
				 * Process the account creation in FormBuilder.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} modal jQuery-Confirm modal object.
				 *
				 * @returns {boolean} Return false when form validation is failed.
				 */
				add: function( modal ) {

					if ( ! app.ui.account.isValidForm( modal ) ) {
						return false;
					}

					const $content = modal.$content;
					const $error = $content.find( '.wpforms-google-sheets-auth-error' );
					const mode = app.ui.account.getFormMode( $content );
					const data = {
						'mode': mode,
					};

					if ( mode === 'advanced' ) {
						data['client_id'] = app.ui.account.getFieldValueByName( 'client_id', $content );
						data['client_secret'] = app.ui.account.getFieldValueByName( 'client_secret', $content );
					}

					app.Providers.ajax
						.request( app.provider, {
							data: {
								'task': 'account_save',
								data: data,
							},
						} )
						.done( function( response ) {

							if ( response.success ) {
								$( '.wpforms-builder-provider-connections-save-lock', app.$holder ).val( 1 );

								// eslint-disable-next-line camelcase
								wpforms_builder.exit_url = response.data;

								WPFormsBuilder.formSave( true );

								return;
							}

							if ( _.has( response, 'data' ) ) {
								$error.html( response.data );
							}

							$error.show();
						} );
				},

				/**
				 * Check is the form valid.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} modal Modal object.
				 *
				 * @returns {boolean} Is the form valid?
				 */
				isValidForm: function( modal ) {

					const $content = modal.$content;
					const $error = $( '.wpforms-google-sheets-auth-required-error', $content );
					const mode = app.ui.account.getFormMode( $content );

					if ( mode === 'pro' ) {
						$error.hide();

						return true;
					}

					const clientId = app.ui.account.getFieldValueByName( 'client_id', $content );
					const clientSecret = app.ui.account.getFieldValueByName( 'client_secret', $content );
					const $clientIdField = $( 'input[name="client_id"]', $content );
					const $clientSecretField = $( 'input[name="client_secret"]', $content );
					const isValid = Boolean( clientId.length && clientSecret.length );

					if ( isValid ) {
						$error.hide();
						$clientIdField.removeClass( 'wpforms-error' );
						$clientSecretField.removeClass( 'wpforms-error' );

						return true;
					}

					$error.show();
					$clientIdField.addClass( 'wpforms-error' );
					$clientSecretField.addClass( 'wpforms-error' );

					return false;
				},

				/**
				 * Get the form mode.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $content Modal content.
				 *
				 * @returns {string} Custom or pro form type.
				 */
				getFormMode: function( $content ) {

					return $( 'input[name="client_id"]', $content ).length ? 'advanced' : 'pro';
				},

				/**
				 * Get the active form container.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $content Modal content.
				 *
				 * @returns {jQuery} The form container.
				 */
				getFormContainer: function( $content ) {

					return app.ui.account.getFormMode( $content ) === 'advanced' ?
						$( '.wpforms-google-sheets-auth-custom', $content ) :
						$( '.wpforms-google-sheets-auth-pro', $content );
				},

				/**
				 * Get a form field value by name.
				 *
				 * @since 1.0.0
				 *
				 * @param {string} name The field name.
				 * @param {jQuery} $formContainer The form container.
				 *
				 * @returns {string} Field value.
				 */
				getFieldValueByName: function( name, $formContainer ) {

					const $field = $( '[name="' + name + '"]', $formContainer );

					return $field.length ? $field.val().toString().trim() : '';
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

				/**
				 * Change auth mode.
				 *
				 * @since 1.0.0
				 *
				 * @param {Event} e Event.
				 */
				switchToAdvancedMode: function( e ) {

					e.preventDefault();

					$.alert( {
						title: wpforms_builder.google_sheets_advanced_form_title,
						content: app.templates.render( 'new-account-advanced-form' ),
						icon: 'fa fa-info-circle',
						type: 'blue',
						animation: 'none',
						closeAnimation: 'none',
						buttons: {
							confirm: {
								text: wpforms_builder.google_sheets_advanced_form_add_button,
								btnClass: 'btn-confirm',
								keys: [ 'enter' ],
								action: function() {
									const modal = this;

									app.$holder.trigger( 'accountAddModal.buttons.add.action.before', [ modal ] );

									app.ui.account.add( modal );

									return false;
								},
							},
							cancel: {
								text: wpforms_builder.google_sheets_advanced_form_cancel_button,
							},
						},
						onOpenBefore: function() {

							const modal = this;

							modal.$jconfirmBg.removeClass( 'jconfirm-bg' );
							modal.$body.addClass( 'wpforms-providers-account-add-modal' );

							app.$holder.trigger( 'accountAddModal.onOpenBefore', [ modal ] );
						},
					} );
				},

				/**
				 * Update popup content.
				 *
				 * @since 1.0.0
				 *
				 * @param {Event} e Event.
				 * @param {object} modal jQuery-Confirm modal object.
				 */
				updatePopup: function( e, modal ) {

					const $content = modal.$content;
					const mode = app.ui.account.getFormMode( $content );
					const key = 'google_sheets_' + mode + '_form_footer';

					if ( mode === 'pro' ) {
						modal.$$add.text( wpforms_builder.ok );
					}

					modal.$body.css( 'padding-bottom', '63px' ).append( '<div class="wpforms-google-sheets-auth-footer">' + wpforms_builder[ key] + '</div>' );
				},

				/**
				 * Inform customer that account doesn't have required tokens.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} reauthUrl Reauth URL.
				 */
				invalidAccountModal: function( reauthUrl ) {

					app.modal( wpforms_builder.google_sheets_auth_failed );

					const $provider = app.Providers.getProviderHolder( app.provider );
					const $holder = $provider.find( '.wpforms-builder-provider-body' );
					const $defaultContent = $provider.find( '.wpforms-builder-provider-connections-default' );
					const $addButtons = $provider.find( '.wpforms-builder-provider-title-add' );

					$holder.prepend(
						app.templates.render(
							'auth-error',
							{
								'reauthUrl': reauthUrl,
							}
						)
					);

					$defaultContent.hide();
					$addButtons.hide();

					// Block saving connections until accounts are reconnected.
					$( '.wpforms-builder-provider-connections-save-lock', app.$holder ).val( 1 );
				},
			},

			/**
			 * Doc Link.
			 *
			 * @since 1.0.0
			 */
			docLink: {

				/**
				 * Update link event.
				 *
				 * @since 1.0.0
				 */
				changeFields: function() {

					const $connection = $( this ).closest( '.wpforms-builder-provider-connection' );

					app.ui.docLink.update( $connection );
				},

				/**
				 * Update link to the Google Doc.
				 *
				 * @since 1.0.0
				 *
				 * @param {jQuery} $connection Connection.
				 */
				update: function( $connection ) {

					const spreadsheetId = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id select', $connection ).val();
					const $link = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id a', $connection );

					if ( ! spreadsheetId || spreadsheetId === 'new' ) {
						$link.addClass( 'wpforms-hidden' );

						return;
					}

					let sheetId = $( '.wpforms-builder-google-sheets-provider-sheet-id select', $connection ).val();

					sheetId = sheetId === 'new' || sheetId === null ? 0 : sheetId;

					$link
						.attr( 'href', app.ui.docLink.getSpreadsheetURL( spreadsheetId, sheetId ) )
						.removeClass( 'wpforms-hidden' );
				},

				/**
				 * Get a spreadsheet URL.
				 *
				 * @since 1.0.0
				 *
				 * @param {string} spreadsheetId Spreadsheet ID.
				 * @param {number} sheetId Sheet ID.
				 *
				 * @returns {string} Spreadsheet URL.
				 */
				getSpreadsheetURL: function( spreadsheetId, sheetId ) {

					return 'https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit#gid={sheetId}'.replace( '{spreadsheetId}', spreadsheetId ).replace( '{sheetId}', sheetId );
				},
			},

			/**
			 * Connection property.
			 *
			 * @since 1.0.0
			 */
			connection: {

				/**
				 * Get connection by ID.
				 *
				 * @since 1.0.0
				 *
				 * @param {string} connectionId Connection ID.
				 *
				 * @returns {jQuery} Connection.
				 */
				getById: function( connectionId ) {

					return app.$holder.find( '.wpforms-builder-provider-connection[data-connection_id="' + connectionId + '"]' );
				},

				/**
				 * Create a connection.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} event Event object.
				 * @param {string} name Connection name.
				 */
				create: function( event, name ) {

					const connectionId = ( new Date().getTime() ).toString( 16 );
					const connection = {
						id: connectionId,
						name: name,
						isNew: true,
					};

					app.cache.providerCache.addTo( app.provider, 'connections', connectionId, connection );

					app.ui.connection.generate( connection );
				},

				/**
				 * Delete a connection.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} event Event.
				 * @param {jQuery} $connection Connection.
				 */
				delete: function( event, $connection ) {

					const $providerHolder = app.Providers.getProviderHolder( app.provider );

					if ( ! $connection.closest( $providerHolder ).length ) {
						return;
					}

					const connectionId = $connection.data( 'connection_id' );

					if ( _.isString( connectionId ) ) {
						app.cache.providerCache.deleteFrom( app.provider, 'connections', connectionId );
					}
				},

				/**
				 * Get the template and data for a connection and process it.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} connection Connection data.
				 */
				generate: function( connection ) {

					app.ui.connection.replace( connection );

					const sheets = app.cache.getSheets( connection.spreadsheet_id );
					const columns = app.cache.getColumns( connection.spreadsheet_id, connection.sheet_id );
					const $connection = app.ui.connection.getById( connection.id );

					app.tmpl.sheetField( sheets, $connection );

					if ( connection.sheet_id !== undefined && connection.sheet_id !== '' ) {
						const $sheetIdField = $( '.wpforms-builder-google-sheets-provider-sheet-id', $connection );
						const $customFields = $( '.wpforms-builder-google-sheets-provider-connection-fields', $connection );

						$sheetIdField.find( 'option[value="' + connection.sheet_id + '"]' ).prop( 'selected', true );

						app.ui.docLink.update( $connection );

						app.tmpl.customFields( $connection, columns, connection.custom_fields );

						$customFields.removeClass( 'wpforms-hidden' );
					}

					app.$holder.trigger( 'connectionGenerated', [ { connection: connection } ] );
				},

				/**
				 * Replace connection or add a new one.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} connection Connection data.
				 */
				replace: function( connection ) {

					const conditional = app.tmpl.conditional( connection );
					const spreadsheets = app.cache.getSpreadsheets();
					const $newConnection = app.templates.render(
						'connection',
						{
							connection: connection,
							spreadsheets: spreadsheets,
							conditional: conditional,
							provider: app.provider,
						}
					);

					if ( app.ui.connection.getById( connection.id ).length ) {
						app.ui.connection.getById( connection.id ).replaceWith( $newConnection );

						return;
					}

					app.$connections.prepend( $newConnection );
				},

				/**
				 * Determine if the connection is new.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} connection Connection data.
				 *
				 * @returns {boolean} Is the connection a new?
				 */
				isNewConnection: function( connection ) {

					return _.has( connection, 'isNew' ) && connection.isNew;
				},

				/**
				 * Fire AJAX-request to retrieve the list of all saved connections.
				 *
				 * @since 1.0.0
				 */
				dataLoad: function() {

					app.Providers.ajax
						.request( app.provider, {
							data: {
								task: 'connections_get',
							},
						} )
						.done( function( response ) {

							if ( ! _.isEmpty( response.data.invalid_account ) ) {
								app.ui.account.invalidAccountModal( response.data.invalid_account );

								return;
							}

							if ( ! response.success || ! _.has( response.data, 'connections' ) ) {
								return;
							}

							const cacheKeys = [
								'columns',
								'conditionals',
								'connections',
								'non_editable_spreadsheets',
								'sheets',
								'spreadsheets',
							];

							$.each( cacheKeys, function( i, key ) {

								app.cache.providerCache.set( app.provider, key, {} );

								if ( _.has( response.data, key ) && ! _.isEmpty( response.data[ key ] ) ) {
									app.cache.providerCache.set( app.provider, key, jQuery.extend( {}, response.data[ key ] ) );
								}
							} );

							if ( ! _.isEmpty( response.data.non_editable_spreadsheets ) ) {
								app.ui.spreadsheetField.nonEditableModal();
							}

							app.$holder.trigger( 'connectionsDataLoaded', [ response.data ] );
						} );
				},

				/**
				 * Refresh builder to update a new spreadsheet or a new list.
				 *
				 * @since 1.0.0
				 *
				 * @param {Event} e Event.
				 * @param {object} response Ajax response.
				 */
				refreshConnections: function( e, response ) {

					if ( ! Object.prototype.hasOwnProperty.call( response, 'google_sheets' ) ) {
						return;
					}

					const data = response.google_sheets;

					if ( ! _.isEmpty( data.invalid_account ) ) {
						app.ui.account.invalidAccountModal( data.invalid_account );

						return;
					}

					const cacheKeys = [
						'columns',
						'sheets',
						'spreadsheets',
					];

					$.each( cacheKeys, function( i, key ) {
						if ( _.has( data, key ) && ! _.isEmpty( data[ key ] ) ) {
							app.cache.providerCache.set(
								app.provider, key,
								jQuery.extend(
									app.cache.providerCache.get( app.provider, key ),
									data[ key ]
								)
							);
						}
					} );

					for ( const connectionId in data.connections ) {
						app.ui.connection.generate( data.connections[connectionId] );
					}
				},

				/**
				 * Sometimes in DOM we might have placeholders or temporary connection IDs.
				 * We need to replace them with actual values.
				 *
				 * @since 1.0.0
				 *
				 * @param {string} connectionId New connection ID to replace to.
				 * @param {object} $connection  jQuery DOM connection element.
				 */
				replaceConnectionIds: function( connectionId, $connection ) {

					// Replace old temporary %connection_id% from PHP code with the new one.
					$connection
						.find( 'input, textarea, select, label' ).each( function() {

							const $this = $( this );

							if ( $this.attr( 'name' ) ) {
								$this.attr( 'name', $this.attr( 'name' ).replace( /%connection_id%/gi, connectionId ) );
							}

							if ( $this.attr( 'id' ) ) {
								$this.attr( 'id', $this.attr( 'id' ).replace( /%connection_id%/gi, connectionId ) );
							}

							if ( $this.attr( 'for' ) ) {
								$this.attr( 'for', $this.attr( 'for' ).replace( /%connection_id%/gi, connectionId ) );
							}

							if ( $this.attr( 'data-name' ) ) {
								$this.attr( 'data-name', $this.attr( 'data-name' ).replace( /%connection_id%/gi, connectionId ) );
							}
						} );
				},

				/**
				 * Don't allow modifying current connection.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} connection Connection data.
				 */
				lock: function( connection ) {

					const $connection = app.ui.connection.getById( connection.id );
					const $sheetIdField = $( '.js-wpforms-builder-google-sheets-provider-connection-sheet-id', $connection );
					const $interactiveButtons = $(
						'.wpforms-builder-google-sheets-provider-connection-fields .add,' +
						'.wpforms-builder-google-sheets-provider-connection-fields .delete,' +
						'.toggle-smart-tag-display,' +
						'.wpforms-conditional-block .wpforms-conditional-rule-add,' +
						'.wpforms-conditional-block .wpforms-conditional-rule-delete,' +
						'.wpforms-conditional-block .wpforms-conditional-groups-add,' +
						'.wpforms-conditional-block .wpforms-conditional-group:last h5',
						$connection
					);
					const $firstBlock = $( '.wpforms-builder-provider-connection-block:eq(0)', $connection );
					const $spreadsheetIdField = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id select', $connection );
					const spreadsheetId = $spreadsheetIdField.val();

					$sheetIdField.find( 'option' ).remove();
					$sheetIdField.append( new Option( connection.sheet_id, connection.sheet_id, true ) );
					$interactiveButtons.addClass( 'wpforms-hidden' );
					$connection.find( 'select, input' ).prop( 'disabled', 'disabled' );

					$firstBlock.prepend(
						app.templates.render(
							'connection-error',
							{
								email: wpforms_builder.google_sheets_email,
								// eslint-disable-next-line camelcase
								spreadsheet_url: app.ui.docLink.getSpreadsheetURL( spreadsheetId, connection.sheet_id ),
							}
						)
					);

					// Add the locker to the connection, which doesn't update the connection after saving.
					$connection.prepend( '<input type="hidden" name="' + $spreadsheetIdField.prop( 'name' ).replace( 'spreadsheet_id', '__lock__' ) + '" value="1">' );
				},

				/**
				 * Unlock connection.
				 *
				 * @since 1.0.0
				 *
				 * @param {object} $connection  jQuery DOM connection element.
				 */
				unlock: function( $connection ) {

					const connectionId = $connection.data( 'connection_id' );
					const $error = $( '.wpforms-alert', $connection );
					const $lock = $( '[name="providers[google-sheets][' + connectionId + '][__lock__]"]' );
					const $firstFieldsRow = $( '.wpforms-builder-provider-connection-fields-table-row:eq(0)', $connection );
					const $interactiveButtons = $(
						'.wpforms-builder-google-sheets-provider-connection-fields .add,' +
						'.wpforms-builder-google-sheets-provider-connection-fields .delete,' +
						'.toggle-smart-tag-display,' +
						'.wpforms-conditional-block .wpforms-conditional-rule-add,' +
						'.wpforms-conditional-block .wpforms-conditional-rule-delete,' +
						'.wpforms-conditional-block .wpforms-conditional-groups-add,' +
						'.wpforms-conditional-block .wpforms-conditional-group:last h5',
						$connection
					);

					$error.remove();
					$lock.remove();
					$connection.find( 'select, input' ).removeAttr( 'disabled', 'disabled' );
					$firstFieldsRow.find( 'select, input' ).prop( 'disabled', 'disabled' );
					$interactiveButtons.removeClass( 'wpforms-hidden' );
				},
			},
		},

		/**
		 * All methods for JavaScript templates.
		 *
		 * @since 1.0.0
		 */
		tmpl: {

			/**
			 * Compile and retrieve an HTML for common elements.
			 *
			 * @since 1.0.0
			 *
			 * @returns {string} Compiled HTML.
			 */
			commonsHTML: function() {

				return app.templates.render( 'error' ) + app.templates.render( 'lock', {provider: app.provider} );
			},

			/**
			 * Render the sheet field.
			 *
			 * @since 1.0.0
			 *
			 * @param {object} sheets List of sheets.
			 * @param {jQuery} $connection Connection element.
			 */
			sheetField: function( sheets, $connection ) {

				const spreadsheetId = $( '.wpforms-builder-google-sheets-provider-spreadsheet-id select' ).val();
				const $fieldWrapper = $( '.wpforms-builder-google-sheets-provider-sheet-id .wpforms-builder-provider-connection-block-field', $connection );

				$fieldWrapper.html(
					app.templates.render(
						'sheet-select',
						{
							'provider': app.provider,
							'connection_id': $connection.data( 'connection_id' ),
							'fields': wpf.getFields(),
							'sheets': sheets,
							'spreadsheet_id': spreadsheetId,
						}
					)
				);
			},

			/**
			 * Render the custom fields.
			 *
			 * @since 1.0.0
			 *
			 * @param {jQuery} $connection Connection element.
			 * @param {object} columns List of sheets.
			 * @param {object} customFields List of custom fields.
			 */
			customFields: function( $connection, columns, customFields ) {

				const $fieldWrapper = $( '.wpforms-builder-google-sheets-provider-connection-fields', $connection );

				$fieldWrapper.html(
					app.templates.render(
						'fields',
						{
							'connection_id': $connection.data( 'connection_id' ),
							'fields': wpf.getFields(),
							'provider': app.provider,
							'columns': columns,
							'custom_fields': customFields,
						}
					)
				);

				wpf.initTooltips();
			},

			/**
			 * Render the conditional logic template.
			 *
			 * @since 1.0.0
			 *
			 * @param {object} connection Connection data.
			 *
			 * @returns {string} Conditional logic HTML.
			 */
			conditional: function( connection ) {

				if ( _.has( connection, 'conditional' ) && ! app.ui.connection.isNewConnection( connection ) ) {
					return connection.conditional;
				}

				return app.templates.render( 'connection-conditionals' );
			},
		},

		/**
		 * Modal.
		 *
		 * @since 1.0.0
		 *
		 * @param {string} message Modal message.
		 */
		modal: function( message ) {

			$.alert( {
				title: wpforms_builder.heads_up,
				content: message,
				icon: 'fa fa-exclamation-circle',
				type: 'orange',
				buttons: {
					confirm: {
						text: wpforms_builder.ok,
						btnClass: 'btn-confirm',
						keys: [ 'enter' ],
					},
				},
			} );
		},
	};

	// Provide access to public functions/properties.
	return app;

}( document, window, jQuery ) );

// Initialize.
WPForms.Admin.Builder.Providers.GoogleSheets.init();

