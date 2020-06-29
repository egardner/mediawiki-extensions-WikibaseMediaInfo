<template>
	<div class="wbmi-video-result" @click="showDetails">
		<img
			:src="thumbnail"
			:alt="title"
			class="wbmi-video-result__thumbnail"
			loading="lazy"
		>

		<h6 class="wbmi-video-result__title">
			{{ title }}
		</h6>
	</div>
</template>

<script>
var searchResult = require( '../mixins/searchResult.js' );

// @vue/component
module.exports = {
	name: 'VideoResult',

	mixins: [ searchResult ],

	computed: {
		duration: function () {
			return Math.round( this.result.imageinfo[ 0 ].duration );
		},

		mime: function () {
			return this.result.imageinfo[ 0 ].mime;
		},

		resolution: function () {
			var width = this.result.imageinfo[ 0 ].width,
				height = this.result.imageinfo[ 0 ].height;

			return width + 'x' + height;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-video-result {
	.flex( 1, 0, 15% );
	box-sizing: border-box;
	padding: 8px;
}
</style>
