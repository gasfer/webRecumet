<?php
/**
 * Connection template.
 *
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<# var isInvalidConnection = ! _.isEmpty( data.connection.spreadsheet_id ) && ! _.has( data.spreadsheets, data.connection.spreadsheet_id ); #>
<div class="wpforms-builder-provider-connection" data-connection_id="{{ data.connection.id }}">
	<input type="hidden"
		   class="wpforms-builder-provider-connection-id"
		   name="providers[{{ data.provider }}][{{ data.connection.id }}][id]"
		   value="{{ data.connection.id }}">

	<div class="wpforms-builder-provider-connection-title">
		{{ data.connection.name }}
		<button class="wpforms-builder-provider-connection-delete js-wpforms-builder-provider-connection-delete" type="button">
			<span class="fa fa-trash-o"></span>
		</button>
		<input type="hidden"
			   name="providers[{{ data.provider }}][{{ data.connection.id }}][name]"
			   value="{{ data.connection.name }}">
	</div>

	<div class="wpforms-builder-provider-connection-block wpforms-builder-google-sheets-provider-spreadsheet-id">
		<label for="wpforms-builder-google-sheets-spreadsheet-field-{{ data.connection.id }}">
			<?php esc_html_e( 'Spreadsheet', 'wpforms-google-sheets' ); ?><span class="required">*</span>
		</label>

		<div class="wpforms-builder-provider-connection-block-field-wrapper">
			<div class="wpforms-builder-provider-connection-block-field">
				<select id="wpforms-builder-google-sheets-spreadsheet-field-{{ data.connection.id }}"
						class="js-wpforms-builder-google-sheets-provider-connection-spreadsheet-id choicesjs-select wpforms-required"
						data-search="true"
						name="providers[{{ data.provider }}][{{ data.connection.id }}][spreadsheet_id]">
					<option value="" selected disabled><?php esc_html_e( '--- Select a Spreadsheet ---', 'wpforms-google-sheets' ); ?></option>
					<option value="new"><?php esc_html_e( 'Create a New Spreadsheet', 'wpforms-google-sheets' ); ?></option>
					<# _.each( data.spreadsheets, function( spreadsheet, spreadsheet_id ) { #>
						<option value="{{ spreadsheet_id }}"
							<# if ( spreadsheet_id === data.connection.spreadsheet_id ) { #> selected<# } #>>
							{{ spreadsheet }}
						</option>
					<# } ); #>
					<# if ( isInvalidConnection ) { #>
						<option value="{{ data.connection.spreadsheet_id }}" selected>{{ data.connection.spreadsheet_id}}</option>
					<# } #>
				</select>
			</div>

			<a href="#"
			   class="wpforms-hidden"
			   target="_blank"
			   rel="noopener noreferrer"
			   title="<?php esc_html_e( 'Link to the Google spreadsheet', 'wpforms-google-sheets' ); ?>">
				<i class="fa fa-external-link" aria-hidden="true"></i>
			</a>
		</div>
	</div>

	<div class="wpforms-builder-provider-connection-block wpforms-builder-google-sheets-provider-spreadsheet-name wpforms-hidden">
		<label for="wpforms-builder-google-sheets-spreadsheet-name-field-{{ data.connection.id }}">
			<?php esc_html_e( 'Spreadsheet Name', 'wpforms-google-sheets' ); ?>
		</label>

		<input id="wpforms-builder-google-sheets-spreadsheet-name-field-{{ data.connection.id }}"
			   type="text"
			   class="wpforms-disabled"
			   name="providers[{{ data.provider }}][{{ data.connection.id }}][spreadsheet_name]"
			   value="">
	</div>

	<div class="wpforms-builder-provider-connection-block wpforms-builder-google-sheets-provider-sheet-id<# if ( _.isEmpty( data.connection.spreadsheet_id ) ) { #> wpforms-hidden<# } #>">
		<label for="wpforms-builder-google-sheets-sheet-field-{{ data.connection.id }}">
			<?php esc_html_e( 'Sheet', 'wpforms-google-sheets' ); ?><span class="required">*</span>
		</label>
		<div class="wpforms-builder-provider-connection-block-field"></div>
	</div>

	<div class="wpforms-builder-provider-connection-block wpforms-builder-google-sheets-provider-sheet-name wpforms-hidden">
		<label for="wpforms-builder-google-sheets-sheet-name-field-{{ data.connection.id }}">
			<?php esc_html_e( 'Sheet Name', 'wpforms-google-sheets' ); ?>
		</label>

		<input id="wpforms-builder-google-sheets-sheet-name-field-{{ data.connection.id }}"
			   type="text"
			   class="wpforms-disabled"
			   name="providers[{{ data.provider }}][{{ data.connection.id }}][sheet_name]"
			   value="">
	</div>

	<div class="wpforms-builder-provider-connection-block wpforms-builder-google-sheets-provider-connection-fields wpforms-hidden"></div>

	{{{ data.conditional }}}
</div>
