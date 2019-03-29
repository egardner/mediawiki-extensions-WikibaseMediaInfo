( function ( statements, wikibase ) {

	'use strict';

	statements.FormatValueElement = function MediaInfoStatementsFormatValueElement() {};
	OO.initClass( statements.FormatValueElement );

	statements.FormatValueElement.cache = {};

	/**
	 * @param {dataValues.DataValue} dataValue
	 * @param {string} format
	 * @param {string} language
	 * @return {string}
	 */
	statements.FormatValueElement.getKey = function ( dataValue, format, language ) {
		return JSON.stringify( {
			data: { type: dataValue.getType(), value: dataValue.toJSON() },
			format: format,
			language: language
		}, function ( key, value ) {
			// make sure the data gets sorted during stringify, or we might
			// end up with a different key for data that is essentially the
			// same, but where the properties were stringified in a different
			// order (e.g. {a:1,b:2} and {b:2,a:1})
			// @see https://gist.github.com/davidfurlong/463a83a33b70a3b6618e97ec9679e490
			if ( value instanceof Object && !( value instanceof Array ) ) {
				return Object.keys( value )
					.sort()
					.reduce( function ( sorted, key ) {
						sorted[ key ] = value[ key ];
						return sorted;
					}, {} );
			}

			return value;
		} );
	};

	/**
	 * @param {string} key
	 * @param {string} result
	 */
	statements.FormatValueElement.toCache = function ( key, result ) {
		statements.FormatValueElement.cache[ key ] = $.Deferred().resolve( result ).promise( { abort: function () {} } );
	};

	/**
	 * @param {dataValues.DataValue} dataValue
	 * @param {string} [format] e.g. text/plain or text/html
	 * @param {string} [language]
	 * @return {jQuery.Promise}
	 */
	statements.FormatValueElement.prototype.formatValue = function ( dataValue, format, language ) {
		var api = wikibase.api.getLocationAgnosticMwApi( mw.config.get( 'wbmiRepoApiUrl' ) ),
			data = { type: dataValue.getType(), value: dataValue.toJSON() },
			stringified = JSON.stringify( data ),
			promise,
			key;

		format = format || 'text/plain';
		language = language || mw.config.get( 'wgUserLanguage' );
		key = statements.FormatValueElement.getKey( dataValue, format, language );

		if ( !( key in statements.FormatValueElement.cache ) ) {
			promise = api.get( {
				action: 'wbformatvalue',
				format: 'json',
				datavalue: stringified,
				options: JSON.stringify( { lang: language } ),
				generate: format
			} );

			statements.FormatValueElement.cache[ key ] = promise.then( function ( response ) {
				return response.result;
			} ).promise( { abort: function () {
				// immediately delete from cache
				// this is also done in .catch below, but in case of abort, we can
				// already do this right away instead of having to wait until the end
				// of the call stack - thus ensuring new callers immediately fire off
				// a new request instead of re-using an already aborted one (if it
				// has not yet been cleaned up)
				delete statements.FormatValueElement.cache[ key ];
				// abort AJAX call
				promise.abort();
			} } );

			statements.FormatValueElement.cache[ key ].catch( function () {
				// this cached value seems to have failed, might as well get rid
				// of it so it's re-attempted next time we need this...
				delete statements.FormatValueElement.cache[ key ];
			} );
		}

		return statements.FormatValueElement.cache[ key ];
	};

}( mw.mediaInfo.statements, wikibase ) );
