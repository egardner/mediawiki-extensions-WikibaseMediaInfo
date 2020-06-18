'use strict';

var initialResults = mw.config.get( 'wbmiInitialSearchResults' );

// TODO: Remove this, it's just a workaround for now
// while we use data from Production commons to test features locally
function ensureArray( obj ) {
	if ( Array.isArray( obj ) ) {
		return obj;
	} else {
		return Object.values( obj );
	}
}

module.exports = {
	/**
	 * Arrays of objects broken down by type
	 */
	results: {
		bitmap: ensureArray( initialResults.bitmap.results ),
		audio: ensureArray( initialResults.audio.results ),
		video: ensureArray( initialResults.video.results ),
		category: ensureArray( initialResults.category.results )
	},

	continue: {
		bitmap: initialResults.bitmap.continue,
		audio: initialResults.audio.continue,
		video: initialResults.video.continue,
		category: initialResults.category.continue
	},

	pending: {
		bitmap: false,
		audio: false,
		video: false,
		category: false
	}
};
