module.exports = {
	hasMore: function ( state ) {
		return {
			bitmap: !( state.continue.bitmap === null ),
			audio: !( state.continue.audio === null ),
			video: !( state.continue.video === null ),
			category: !( state.continue.category === null )
		};
	},

	sortedResults: function ( state ) {
		// Array.prototype.sort mutates in place, which we don't want for a getter;
		// using concat() first creates a shallow copy
		// It is also not supported in IE11 w/o a polyfill
		function sortCopy( array ) {
			return array.concat().sort( function ( a, b ) {
				return a.index - b.index;
			} );
		}

		return {
			bitmap: sortCopy( state.results.bitmap ),
			audio: sortCopy( state.results.audio ),
			video: sortCopy( state.results.video ),
			category: sortCopy( state.results.category )
		};
	},

	noResults: function ( state ) {
		return {
			bitmap: state.results.bitmap.length === 0,
			audio: state.results.audio.length === 0,
			video: state.results.video.length === 0,
			category: state.results.category.length === 0
		};
	}
};
