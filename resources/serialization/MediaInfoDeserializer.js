( function ( wb, util ) {
	'use strict';

	var SERIALIZER = wb.serialization,
		PARENT = SERIALIZER.Deserializer,
		MediaInfo = require( '../datamodel/MediaInfo.js' );

	/**
	 * @class wikibase.serialization.MediaInfoDeserializer
	 * @extends wikibase.serialization.Deserializer
	 * @license GPL-2.0-or-later
	 * @author Adrian Heine <adrian.heine@wikimedia.de>
	 *
	 * @constructor
	 */
	module.exports = util.inherit( 'WbMediaInfoDeserializer', PARENT, {
		/**
		 * @inheritdoc
		 *
		 * @return {MediaInfo}
		 *
		 * @throws {Error} if serialization does not resolve to a serialized MediaInfo.
		 */
		deserialize: function ( serialization ) {
			var statementGroupSetDeserializer, termMapDeserializer;

			if ( serialization.type !== MediaInfo.TYPE ) {
				throw new Error( 'Serialization does not resolve to an MediaInfo' );
			}

			statementGroupSetDeserializer = new SERIALIZER.StatementGroupSetDeserializer();
			termMapDeserializer = new SERIALIZER.TermMapDeserializer();

			return new MediaInfo(
				serialization.id,
				termMapDeserializer.deserialize( serialization.labels ),
				termMapDeserializer.deserialize( serialization.descriptions ),
				statementGroupSetDeserializer.deserialize( serialization.statements )
			);
		}
	} );

}( wikibase, util ) );
