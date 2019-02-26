( function ( sd ) {

	'use strict';

	/**
	 * Widget containing 'cancel' and 'publish' buttons
	 *
	 * @constructor
	 * @param {object} sdcPanel Panel object with makeReadOnly() and sendData() methods
	 */
	sd.CancelPublishWidget = function CancelPublishWidget( sdcPanel ) {

		var cancelButton = new OO.ui.ButtonWidget( {
			framed: false,
			flags: [
				'destructive'
			],
			label: mw.message( 'wikibasemediainfo-filepage-cancel' ).text()
		} )
			.on( 'click', function () {
				sdcPanel.makeReadOnly();
			} );

		var publishButton = new OO.ui.ButtonInputWidget( {
			// disabled by default
			disabled: true,
			type: 'submit',
			useInputTag: true,
			label: mw.message( 'wikibasemediainfo-filepage-publish' ).text(),
			flags: [
				'primary',
				'progressive'
			]
		} )
			.on( 'click', function () {
				sdcPanel.sendData();
			} );

		var widget = new OO.ui.Element( {
			content: [ cancelButton, publishButton ],
			classes: [ 'wbmi-entityview-cancelAndPublishButtons' ]
		} );

		this.hide = function () {
			widget.$element.hide();
		};

		this.show = function () {
			widget.$element.show();
		};

		this.disablePublish = function () {
			publishButton.setDisabled( true );
		};

		this.enablePublish = function () {
			publishButton.setDisabled( false );
		};

		this.setStateSending = function () {
			publishButton.setDisabled( true );
			cancelButton.$element.hide();
		};

		this.setStateReady = function () {
			publishButton.setDisabled( false );
			cancelButton.$element.show();
		};

		this.$element = widget.$element;
	};

}( mw.mediaInfo.structuredData ) );