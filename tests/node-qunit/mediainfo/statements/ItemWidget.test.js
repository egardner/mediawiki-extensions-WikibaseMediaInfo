var sinon = require( 'sinon' ),
	pathToWidget = '../../../../resources/statements/ItemWidget.js',
	hooks = require( '../../support/hooks.js' );

QUnit.module( 'ItemWidget', hooks.mediainfo, function () {
	QUnit.test( 'Valid data roundtrip', function ( assert ) {
		var done = assert.async(),
			ItemWidget = require( pathToWidget ),
			widget = new ItemWidget( { propertyId: 'P1' } ),
			getPropertyDataStub = sinon.stub( widget, 'getPropertyData' ),
			data = new wikibase.datamodel.Statement(
				new wikibase.datamodel.Claim(
					new wikibase.datamodel.PropertyValueSnak(
						'P1',
						new wikibase.datamodel.EntityId( 'Q1' )
					)
				)
			);

		getPropertyDataStub.returns( $.Deferred().resolve( 'label', 'url', 'repo' ).promise() );

		widget.setData( data ).then( function () {
			assert.ok( widget.getData() );
			assert.strictEqual( data.equals( widget.getData() ), true );
			done();
		} );
	} );

	QUnit.test( 'Setting other data triggers a change event', function ( assert ) {
		var done = assert.async(),
			ItemWidget = require( pathToWidget ),
			widget = new ItemWidget( { propertyId: 'P1' } ),
			data = new wikibase.datamodel.Statement(
				new wikibase.datamodel.Claim(
					new wikibase.datamodel.PropertyValueSnak(
						'P1',
						new wikibase.datamodel.EntityId( 'Q1' )
					),
					new wikibase.datamodel.SnakList( [
						new wikibase.datamodel.PropertyValueSnak(
							'P2',
							new dataValues.StringValue( 'This is a string value' )
						)
					] )
				)
			),
			newData = new wikibase.datamodel.Statement(
				new wikibase.datamodel.Claim(
					new wikibase.datamodel.PropertyValueSnak(
						'P1',
						new wikibase.datamodel.EntityId( 'Q1' )
					),
					new wikibase.datamodel.SnakList( [
						new wikibase.datamodel.PropertyValueSnak(
							'P2',
							new dataValues.StringValue( 'This is a different string value' )
						)
					] )
				)
			),
			onChange = sinon.stub();

		widget.setData( data )
			.then( widget.on.bind( widget, 'change', onChange, [] ) )
			.then( widget.setData.bind( widget, newData ) )
			.then( function () {
				assert.strictEqual( onChange.called, true );
				done();
			} );
	} );

	QUnit.test( 'Setting same data does not trigger a change event', function ( assert ) {
		var done = assert.async(),
			ItemWidget = require( pathToWidget ),
			widget = new ItemWidget( { propertyId: 'P1' } ),
			data = new wikibase.datamodel.Statement(
				new wikibase.datamodel.Claim(
					new wikibase.datamodel.PropertyValueSnak(
						'P1',
						new wikibase.datamodel.EntityId( 'Q1' )
					),
					new wikibase.datamodel.SnakList( [
						new wikibase.datamodel.PropertyValueSnak(
							'P2',
							new dataValues.StringValue( 'This is a string value' )
						)
					] )
				)
			),
			sameData = new wikibase.datamodel.Statement(
				new wikibase.datamodel.Claim(
					new wikibase.datamodel.PropertyValueSnak(
						'P1',
						new wikibase.datamodel.EntityId( 'Q1' )
					),
					new wikibase.datamodel.SnakList( [
						new wikibase.datamodel.PropertyValueSnak(
							'P2',
							new dataValues.StringValue( 'This is a string value' )
						)
					] )
				)
			),
			onChange = sinon.stub();

		widget.setData( data )
			.then( widget.on.bind( widget, 'change', onChange, [] ) )
			.then( widget.setData.bind( widget, sameData ) )
			.then( function () {
				assert.strictEqual( onChange.called, false );
				done();
			} );
	} );

	QUnit.test( 'createQualifier() returns a new QualifierWidget', function ( assert ) {
		var ItemWidget = require( pathToWidget ),
			QualifierWidget = require( '../../../../resources/statements/QualifierWidget.js' ),
			widget = new ItemWidget( { propertyId: 'P1' } ),
			qualifier;

		qualifier = widget.createQualifier();
		assert.strictEqual( qualifier instanceof QualifierWidget, true );
	} );

	QUnit.test( 'createQualifier sets QualifierWidget data when snak is provided', function ( assert ) {
		var done = assert.async(),
			ItemWidget = require( pathToWidget ),
			widget = new ItemWidget( { propertyId: 'P1' } ),
			qualifier,
			data;

		data = new wikibase.datamodel.PropertyValueSnak(
			'P1',
			new wikibase.datamodel.EntityId( 'Q1' )
		);

		qualifier = widget.createQualifier( data );

		// qualifier's `setData` is async, so let's call `setState` (with no change)
		// to make sure that we'll wait until the change has propagated and data
		// has been set
		qualifier.setState( {} ).then( function () {
			assert.strictEqual( data.equals( qualifier.getData() ), true );
			done();
		} );
	} );

	QUnit.test( 'addQualifier creates a new QualifierWidget every time it is called', function ( assert ) {
		var done = assert.async(),
			ItemWidget = require( pathToWidget ),
			widget = new ItemWidget( { propertyId: 'P1' } ),
			getPropertyDataStub = sinon.stub( widget, 'getPropertyData' ),
			spy = sinon.spy( widget, 'createQualifier' ),
			data = new wikibase.datamodel.Statement(
				new wikibase.datamodel.Claim(
					new wikibase.datamodel.PropertyValueSnak(
						'P1',
						new wikibase.datamodel.EntityId( 'Q1' )
					)
				)
			);

		getPropertyDataStub.returns( $.Deferred().resolve( 'label', 'url', 'repo' ).promise() );

		widget.setData( data );
		widget.render().then( function () {
			assert.strictEqual( spy.callCount, 0 );

			widget.addQualifier();
			assert.strictEqual( spy.callCount, 1 );

			widget.addQualifier();
			assert.strictEqual( spy.callCount, 2 );

			done();
		} );
	} );
} );
