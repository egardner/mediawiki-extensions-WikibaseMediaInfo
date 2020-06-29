<template>
	<div class="wbmi-media-search-results">
		<div :class="'wbmi-media-search-results__list--' + mediaType"
			class="wbmi-media-search-results__list">
			<component
				:is="resultComponent"
				v-for="(result, index) in sortedResults[ mediaType ]"
				:key="index"
				:result="result"
				@show-details="showDetails"
			></component>
		</div>

		<aside class="wbmi-media-search-results__details"
			:class="{ 'wbmi-media-search-results__details--expanded': !!details }">
			<quick-view
				v-if="details"
				:details="details"
				@close="hideDetails"
			></quick-view>
		</aside>
	</div>
</template>

<script>
/**
 * @file SearchResults.vue
 *
 * The SearchResults component is responsible for displaying a list or grid of
 * search results, regardless of media type. Appearance and behavior will vary
 * depending on the value of the mediaType prop.
 *
 * The SearchResults component is also responsible for displaying an expanded
 * preview for a specific result if triggered by user actions.
 */
var mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	ImageResult = require( './ImageResult.vue' ),
	VideoResult = require( './VideoResult.vue' ),
	GenericResult = require( './GenericResult.vue' ),
	QuickView = require( './QuickView.vue' );

// @vue/component
module.exports = {
	name: 'SearchResults',

	components: {
		'image-result': ImageResult,
		'video-result': VideoResult,
		'generic-result': GenericResult,
		'quick-view': QuickView
	},

	props: {
		mediaType: {
			type: String,
			required: true
		}
	},

	data: function () {
		return {
			details: null
		};
	},

	computed: $.extend( {}, mapState( [
		'results',
		'pending'
	] ), mapGetters( [
		'sortedResults'
	] ), {
		resultComponent: function () {
			if ( this.mediaType === 'bitmap' ) {
				return 'image-result';
			} else if ( this.mediaType === 'video' ) {
				return 'video-result';
			} else {
				return 'generic-result';
			}
		}
	} ),

	methods: {
		showDetails: function ( resultDetails ) {
			this.details = resultDetails;
		},

		hideDetails: function () {
			this.details = null;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-media-search-results {
	.flex-display();
	.flex-wrap( nowrap );

	&__list {
		.flex( 1, 1, auto );
		// transition: all ease-in-out 0.3s;

		// Image and Video results have a grid layout using Flexbox
		&--bitmap,
		&--video {
			.flex-display();
			.flex-wrap( wrap );
		}
		// TODO: mobile image grid switches to vertical columns with fixed width
		// instead of horizontal rows with fixed height.
		// &--bitmap {}
	}

	&__details {
		.flex( 0, 0, auto );
		max-width: 30rem;
		width: 0%;
		// transition: all ease-in-out 0.3s;

		&--expanded {
			.flex( 1, 0, auto );
			width: 50%;
		}
	}
}
</style>
