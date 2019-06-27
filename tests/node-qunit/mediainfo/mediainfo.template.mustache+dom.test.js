var sinon = require( 'sinon' ),
	helpers = require( '../support/helpers.js' ),
	sandbox;

QUnit.module( 'mediainfo.template.mustache+dom', {
	beforeEach: function () {
		sandbox = sinon.createSandbox();

		// Setup jQuery
		global.jQuery = global.$ = window.jQuery = window.$ = require( 'jquery' );

		// Set up global MW and wikibase objects
		global.mw = helpers.createMediaWikiEnv();

		// Setup OOJS and OOUI
		global.OO = require( 'oojs' );
		require( 'oojs-ui' );
		require( 'oojs-ui/dist/oojs-ui-wikimediaui.js' );

		// Setup Mustache & templating
		global.Mustache = require( 'mustache' );
		helpers.requireAgain( 'mediawiki/resources/src/mediawiki.template.js' );
		helpers.requireAgain( 'mediawiki/resources/src/mediawiki.template.mustache.js' );
		helpers.requireAgain( '../../../resources/mediawiki.template.mustache+dom.js' );
		sandbox.stub( mw.templates, 'get' ).returns( {
			'test.mustache+dom': '<div>{{{foo}}}</div>'
		} );
	},

	afterEach: function () {
		sandbox.reset();
	}
}, function () {
	QUnit.test( 'Render mustache templates', function ( assert ) {
		var html, data,
			template = mw.template.get( 'stub', 'test.mustache+dom' );

		data = {
			foo: 'Hello world'
		};

		html = template.render( data ).html();

		assert.strictEqual( html, 'Hello world', 'Rendered mustache template' );
	} );

	QUnit.module( 'Mustache templates with HTMLElement', {}, function () {
		QUnit.test( 'Nodes are parsed into template', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				node = document.createElement( 'div' );

			node.id = 'test';
			node.innerHTML = 'Hello world';

			$result = template.render( { foo: node } );

			assert.strictEqual( $result.find( '#test' ).length, 1, 'Node is rendered' );
			assert.strictEqual( $result.find( '#test' ).text(), 'Hello world', 'Node contains content' );
		} );

		QUnit.test( 'Events triggered from template-based HTML propagate to original element handlers', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				onClick = sinon.stub(),
				node = document.createElement( 'div' );

			node.id = 'test';
			node.innerHTML = 'Hello world';
			node.onclick = onClick;

			$result = template.render( { foo: node } );

			assert.strictEqual( onClick.callCount, 0, 'Event not yet triggered' );
			$result.find( '#test' ).trigger( 'click' );
			assert.strictEqual( onClick.callCount, 1, 'Event triggered' );
		} );

		QUnit.test( 'Changes to node later on propagate into DOM rendered by template', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				node = document.createElement( 'div' );

			node.id = 'test';
			node.innerHTML = 'Hello world';

			$result = template.render( { foo: node } );

			assert.strictEqual( $result.find( '#test-updated' ).length, 0, 'Element in DOM not yet altered' );
			node.id = 'test-updated';
			assert.strictEqual( $result.find( '#test-updated' ).length, 1, 'Element in DOM altered' );
		} );
	} );

	QUnit.module( 'Mustache templates with jQuery nodes', {}, function () {
		QUnit.test( 'Nodes are parsed into template', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				$node = $( '<div>' )
					.attr( 'id', 'test' )
					.text( 'Hello world' );

			$result = template.render( { foo: $node } );

			assert.strictEqual( $result.find( '#test' ).length, 1, 'Node is rendered' );
			assert.strictEqual( $result.find( '#test' ).text(), 'Hello world', 'Node contains content' );
		} );

		QUnit.test( 'Events triggered from template-based HTML propagate to original element handlers', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				onClick = sinon.stub(),
				$node = $( '<div>' )
					.attr( 'id', 'test' )
					.text( 'Hello world' )
					.on( 'click', onClick );

			$result = template.render( { foo: $node } );

			assert.strictEqual( onClick.callCount, 0, 'Event not yet triggered' );
			$result.find( '#test' ).trigger( 'click' );
			assert.strictEqual( onClick.callCount, 1, 'Event triggered' );
		} );

		QUnit.test( 'Changes to node later on propagate into DOM rendered by template', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				$node = $( '<div>' )
					.attr( 'id', 'test' )
					.text( 'Hello world' );

			$result = template.render( { foo: $node } );

			assert.strictEqual( $result.find( '#test-updated' ).length, 0, 'Element in DOM not yet altered' );
			$node.attr( 'id', 'test-updated' );
			assert.strictEqual( $result.find( '#test-updated' ).length, 1, 'Element in DOM altered' );
		} );
	} );

	QUnit.module( 'Mustache templates with OOUI widgets', {}, function () {
		QUnit.test( 'Nodes are parsed into template', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				widget = new OO.ui.Widget( {
					id: 'test',
					text: 'Hello world'
				} );

			$result = template.render( { foo: widget } );

			assert.strictEqual( $result.find( '#test' ).length, 1, 'Node is rendered' );
			assert.strictEqual( $result.find( '#test' ).text(), 'Hello world', 'Node contains content' );
		} );

		QUnit.test( 'Events triggered from template-based HTML propagate to original element handlers', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				onClick = sinon.stub(),
				widget = new OO.ui.Widget( {
					id: 'test',
					text: 'Hello world'
				} );

			// wire up widget to emit an OOUI event by something triggered in DOM
			widget.$element.on( 'click', widget.emit.bind( widget, 'click' ) );
			widget.on( 'click', onClick );

			$result = template.render( { foo: widget } );

			assert.strictEqual( onClick.callCount, 0, 'Event not yet triggered' );
			$result.find( '#test' ).trigger( 'click' );
			assert.strictEqual( onClick.callCount, 1, 'Event triggered' );
		} );

		QUnit.test( 'Changes to node later on propagate into DOM rendered by template', function ( assert ) {
			var $result,
				template = mw.template.get( 'stub', 'test.mustache+dom' ),
				widget = new OO.ui.Widget( {
					id: 'test',
					text: 'Hello world'
				} );

			$result = template.render( { foo: widget } );

			assert.strictEqual( $result.find( '#test-updated' ).length, 0, 'Element in DOM not yet altered' );
			widget.setElementId( 'test-updated' );
			assert.strictEqual( $result.find( '#test-updated' ).length, 1, 'Element in DOM altered' );
		} );
	} );
} );
