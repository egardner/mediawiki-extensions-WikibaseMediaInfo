<template>
	<div v-bind:class="'wbmi-media-search-results--' + mediaType"
		class="wbmi-media-search-results">

		<component
			v-for="(result, index) in sortedResults[ mediaType ]"
			v-bind:is="resultComponent"
			v-bind:result="result"
			v-bind:key="index"
		/>

	</div>
</template>

<script>
var mapState = require( 'vuex' ).mapState,
	mapGetters = require( 'vuex' ).mapGetters,
	ImageResult = require( './ImageResult.vue' ),
	VideoResult = require( './VideoResult.vue' ),
	GenericResult = require( './GenericResult.vue' );

module.exports = {
	name: 'SearchResults',

	components: {
		'image-result': ImageResult,
		'video-result': VideoResult,
		'generic-result': GenericResult
	},

	props: {
		mediaType: {
			type: String,
			required: true
		}
	},

	computed: $.extend( {}, mapState( [
		'results',
		'pending'
	] ), mapGetters( [
		'sortedResults'
	] ), {
		resultComponent: function () {
			if ( this.mediaType === 'bitmap' ) {
				return 'image-result'
			} else if ( this.mediaType === 'video' ) {
				return 'video-result'
			} else {
				return 'generic-result'
			}
		}
	} )
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-media-search-results {

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

</style>
