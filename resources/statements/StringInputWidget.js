'use strict';

var ComponentWidget = require( 'wikibase.mediainfo.base' ).ComponentWidget,
	StringInputWidget;

/**
 * @param {Object} config Configuration options
 * @param {string} [config.value]
 * @param {boolean} [config.isQualifier]
 */
StringInputWidget = function MediaInfoStatementsStringInputWidget( config ) {
	config = config || {};

	this.state = {
		value: config.value || '',
		isQualifier: !!config.isQualifier
	};

	this.input = new OO.ui.TextInputWidget( {
		value: this.state.value,
		classes: [ 'wbmi-string-input-input' ],
		isRequired: true
	} );
	this.input.connect( this, { enter: 'onEnter' } );
	this.input.connect( this, { change: 'onChange' } );

	StringInputWidget.parent.call( this );
	ComponentWidget.call(
		this,
		'wikibase.mediainfo.statements',
		'templates/statements/StringInputWidget.mustache+dom'
	);
};
OO.inheritClass( StringInputWidget, OO.ui.Widget );
OO.mixinClass( StringInputWidget, ComponentWidget );

/**
 * @inheritDoc
 */
StringInputWidget.prototype.getTemplateData = function () {
	var button = new OO.ui.ButtonWidget( {
		classes: [ 'wbmi-string-input-button' ],
		label: mw.message( 'wikibasemediainfo-string-input-button-text' ).text(),
		flags: [ 'primary', 'progressive' ],
		disabled: this.input.getValue() === ''
	} );
	button.connect( this, { click: 'onEnter' } );

	return {
		isQualifier: this.state.isQualifier,
		input: this.input,
		button: button
	};
};

StringInputWidget.prototype.onEnter = function () {
	this.emit( 'addItem', this.input.getValue() );
};

StringInputWidget.prototype.onChange = function () {
	// update state to make sure template rerenders
	this.setState( { value: this.input.getValue() } )
		.then( this.emit.bind( this, 'change', this.input.getValue() ) );
};

/**
 * @return {string}
 */
StringInputWidget.prototype.getData = function () {
	return this.input.getValue();
};

/**
 * @param {string} data
 * @return {jQuery.Promise}
 */
StringInputWidget.prototype.setData = function ( data ) {
	this.input.setValue( String( data ) );
	return this.setState( { value: this.input.getValue() } );
};

module.exports = StringInputWidget;
