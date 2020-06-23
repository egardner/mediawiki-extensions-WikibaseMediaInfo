/**
 * @file searchResult.js
 *
 * Re-usable mixin for search result components. This mixin contains the
 * following things:
 *
 * 1. A "result" property (required)
 * 2. A series of computed properties that destructure objects returned from
 *    the API for convenience; some of these will only be present if additional
 *    metadata has been fetched
 * 3. Local state representing whether a follow-up API request for additional
 *    metadata has been made (and the results, if so) as well as whether or not
 *    the result has been "expanded"
 * 4. Some re-usable methods (to request metadata, strip out HTML, etc)
 *
 * Individual Result components that implement this mixin can decide for
 * themselves how all this information should be disiplayed.
 */
module.exports = {
	props: {
		result: {
			type: Object,
			required: true
		}
	},

	data: function () {
		return {
			metadata: null,
			pending: false,
			expanded: false
		};
	},

	computed: {
		// List-view properties: all search results will have these. This
		// information comes from the query action and the Image Info API:
		// https://www.mediawiki.org/wiki/API:Imageinfo

		title: function () {
			return this.result.name || this.result.title;
		},

		thumbnail: function () {
			return this.result.imageinfo[ 0 ].thumburl;
		},

		src: function () {
			return this.result.imageinfo[ 0 ].url;
		},

		url: function () {
			return this.result.canonicalurl;
		},

		pageId: function () {
			return this.result.pageid;
		},

		// Detail-view properties: only available after a follow-up API request
		// for metadata has been made. These come from the CommonsMetadata
		// extension: https://www.mediawiki.org/wiki/Extension:CommonsMetadata

		attribution: function () {
			if ( this.metadata && this.metadata.Attribution ) {
				return this.stripHTML( this.metadata.Attribution.value );
			}
		},

		artist: function () {
			if ( this.metadata && this.metadata.Artist ) {
				return this.stripHTML( this.metadata.Artist.value );
			}
		},

		categories: function () {
			if ( this.metadata && this.metadata.Categories ) {
				return this.metadata.Categories.value;
			}
		},

		description: function () {
			if ( this.metadata && this.metadata.ImageDescription ) {
				return this.stripHTML( this.metadata.ImageDescription.value );
			}
		},

		date: function () {
			if ( this.metadata && this.metadata.DateTimeOriginal ) {
				return this.metadata.DateTimeOriginal.value;
			} else if ( this.metadata && this.metadata.DateTime ) {
				return this.metadata.DateTime.value;
			}
		},

		formattedDate: function () {
			var d, options;

			if ( this.date ) {
				d = new Date( this.date );
				options = {
					year: 'numeric'
				};

				return d.toLocaleDateString( undefined, options );
			}
		}

	},

	methods: {
		stripHTML: function ( raw ) {
			return $( '<p>' ).append( raw ).text();
		},

		fetchMetadata: function () {
			var params = {
				format: 'json',
				uselang: mw.config.get( 'wgUserLanguage' ),
				action: 'query',
				prop: 'imageinfo',
				iiprop: 'extmetadata',
				pageids: this.pageId
			};

			this.pending = true;

			// Real version: use mw.api
			// return api.get( params ).then( function ( response ) {
			// } );

			// Test version: use production commons API
			return $.get( 'https://commons.wikimedia.org/w/api.php', params ).then( function ( response ) {
				var data = response.query.pages[ this.pageId ];
				this.metadata = data.imageinfo[ 0 ].extmetadata;
			}.bind( this ) ).catch( function ( /* error */ ) {
				// TODO: error handling
				// this.$dispatch( 'displayMessage', error ) or something like that
			} ).done( function () {
				this.pending = false;
			}.bind( this ) );
		}
	}
};
