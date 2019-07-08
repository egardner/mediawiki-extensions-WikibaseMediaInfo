'use strict';

var QualifierWidget,
	QualifierAutocomplete = require( './QualifierAutocomplete.js' ),
	QualifierValueInput = require( './QualifierValueInputWidget.js' ),
	FormatValueElement = require( './FormatValueElement.js' );

/**
 * QualifierWidget (new version). This widget represents a single row of
 * qualifier-related widgets within a single ItemWidget inside a StatementPanel.
 * These widgets handle both the "read" and "edit" UI modes. Actual management
 * of UI state and the showing/hiding of widgets is handled at the level of the
 * ItemWidget.
 *
 * This widget listens for events from its children and updates its
 * data in response to user actions. Data can also be set programatically by
 * calling the setData() method.
 *
 * @constructor
 * @param {Object} config
 */
QualifierWidget = function ( config ) {
	config = config || {};

	QualifierWidget.parent.call( this, config );
	FormatValueElement.call( this, $.extend( {}, config ) );

	// sub-widgets
	this.propertyInput = new QualifierAutocomplete( {
		classes: [ 'wbmi-qualifier-property' ]
	} );

	this.valueInput = new QualifierValueInput( {
		classes: [ 'wbmi-qualifier-value-input' ]
	} );

	this.displayWidget = new OO.ui.Widget( {
		classes: [ 'wbmi-qualifier-value' ]
	} );

	this.removeIcon = new OO.ui.ButtonWidget( {
		classes: [ 'wbmi-qualifier-remove' ],
		framed: false,
		icon: 'close'
	} );

	this.layout = new OO.ui.HorizontalLayout( {
		items: [
			this.displayWidget,
			this.propertyInput,
			this.valueInput,
			this.removeIcon
		],
		classes: [ 'wbmi-qualifier' ]
	} );

	this.$element = this.layout.$element;
	this.valueInput.setDisabled( true );

	// event listeners
	this.propertyInput.connect( this, { choose: 'onPropertyChoose' } );
	this.valueInput.connect( this, { change: 'onValueChange' } );
	this.removeIcon.connect( this, { click: [ 'emit', 'delete' ] } );
};

OO.inheritClass( QualifierWidget, OO.ui.Widget );
OO.mixinClass( QualifierWidget, FormatValueElement );

/**
 * @chainable
 * @return {QualifierWidget} widget
 */
QualifierWidget.prototype.focus = function () {
	this.propertyInput.focus();
	return this;
};

/**
 * Sets the child widgets' data and updates label elements asynchronously.
 * @param {wikibase.datamodel.Snak} data
 */
QualifierWidget.prototype.setData = function ( data ) {
	var propId,
		dataValue,
		dataValueType;

	// Bail early and discard existing data if data argument is not a snak
	if ( !( data instanceof wikibase.datamodel.Snak ) ) {
		return;
	}

	propId = data.getPropertyId();
	dataValue = data.getValue();
	dataValueType = dataValue.getType();

	this.data = data;

	this.updatePropertyInput( { id: propId, dataValueType: dataValueType } );
	this.valueInput.setData( dataValue );
	this.asyncUpdateDisplayWidget();
};

/**
 * Extracts data from child widgets for use elsewhere.
 * @return {wikibase.datamodel.Snak} data
 */
QualifierWidget.prototype.getData = function () {
	var property = this.propertyInput.getData(),
		snak = new wikibase.datamodel.PropertyValueSnak(
			property.id,
			this.valueInput.getData()
		);

	// if snak hasn't changed since `this.setData`,
	// return the original data (which includes `hash`)
	return this.data && this.data.equals( snak ) ? this.data : snak;
};

/**
 * Handles property selection by the user
 */
QualifierWidget.prototype.onPropertyChoose = function () {
	var property = this.propertyInput.getData();
	this.updateValueInput( property.dataValueType );
	this.emit( 'change' );
	this.asyncUpdateDisplayWidget();
};

/**
 * Handles change of valueInput text from the user
 */
QualifierWidget.prototype.onValueChange = function () {
	this.emit( 'change' );
	this.asyncUpdateDisplayWidget();
};

/**
 * Ergonomic wrapper around formatValue() to make it easier to deal with
 * properties.
 * @param {string} propId
 * @param {string} [format] text/plain or text/html
 * @return {$.Promise} promise
 */
QualifierWidget.prototype.formatProperty = function ( propId, format ) {
	format = format || 'text/plain';
	return this.formatValue( new wikibase.datamodel.EntityId( propId ), format );
};

/**
 * @param {Object} property
 * @param {string} property.id property ID
 * @param {string} property.dataValueType datavalue type
 * @param {string} [property.label] human-readable property label
 */
QualifierWidget.prototype.updatePropertyInput = function ( property ) {
	var self = this;

	this.propertyInput.setData( property );
	this.updateValueInput( property.dataValueType );

	if ( this.formatPropertyPromise ) {
		this.formatPropertyPromise.abort();
	}

	if ( 'label' in property ) {
		// we've set a new label - propagate that label to the (read mode) value widget
		this.asyncUpdateDisplayWidget();
	} else {
		this.formatPropertyPromise = this.formatProperty( property.id );
		this.formatPropertyPromise.then( function ( formatted ) {
			self.updatePropertyInput( $.extend( {}, property, {
				label: formatted
			} ) );
		} );
	}
};

/**
 * @param {string} datatype datavalue type
 * @param {dataValues.DataValue} [value]
 */
QualifierWidget.prototype.updateValueInput = function ( datatype, value ) {
	this.valueInput.setInputType( datatype );

	if ( value ) {
		this.valueInput.setData( value );
	}

	this.valueInput.setDisabled( false );
};

/**
 * Update the text of the DisplayWidget element.
 * @param {string} propertyHtml HTML string
 * @param {string} valueHtml HTML string
 */
QualifierWidget.prototype.updateDisplayWidget = function ( propertyHtml, valueHtml ) {
	var $separator = $( '<span>', { text: mw.message( 'colon-separator' ) } );

	this.displayWidget.$element.empty();
	this.displayWidget.$element.append(
		propertyHtml.indexOf( '<' ) >= 0 ? $( propertyHtml ).attr( 'target', '_blank' ) : propertyHtml,
		$separator,
		valueHtml.indexOf( '<' ) >= 0 ? $( valueHtml ).attr( 'target', '_blank' ) : valueHtml
	);
};

/**
 * Asynchronously update the label elements with data from the API.
 */
QualifierWidget.prototype.asyncUpdateDisplayWidget = function () {
	var self = this,
		promises,
		dataValue;

	try {
		dataValue = this.valueInput.getData();

		// abort in-flight API requests - there's no point in continuing
		// to fetch the text-to-render when we've already changed it...
		if ( this.formatDisplayPromise ) {
			this.formatDisplayPromise.abort();
		}

		promises = [
			this.formatProperty( this.propertyInput.getData().id, 'text/html' ),
			this.formatValue( dataValue, 'text/html' )
		];

		this.formatDisplayPromise = $.when.apply( $, promises ).promise( {
			abort: function () {
				promises.forEach( function ( promise ) {
					promise.abort();
				} );
			}
		} );

		this.formatDisplayPromise.then( function ( propertyLink, valueLink ) {
			self.updateDisplayWidget( propertyLink, valueLink );
		} );

	} catch ( e ) {
		// nothing to render if data is invalid...
	}
};

module.exports = QualifierWidget;
