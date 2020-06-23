<template>
	<div v-bind:class="{ 'wbmi-video-result--expanded': expanded }" 
		class="wbmi-video-result">

		<img v-bind:src="thumbnail" 
			v-bind:alt="title"
			class="wbmi-video-result__thumbnail"
			loading="lazy"
		>

		<h6 class="wbmi-video-result__title">
			<a v-bind:href="url">
				{{ title }}
			</a>
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
		},

	},

};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-video-result {
	.flex( 1, 0, 15% );
	box-sizing: border-box;
	padding: 8px;

	&--expanded {
		.flex( 0, 0, 100% );
	}

	&__thumbnail {}


	// .flex-display();
	// .flex-wrap( no-wrap );
	// flex-direction: row;
	// margin-bottom: 16px;

	// & &__thumbnail {
	// 	.flex( 0 0 200px );
	// }

	// & &__info {
	// 	.flex( 1 1 auto );
	// 	padding: 0 8px;
	// }

	// & &__title {
	// 	margin: 0;
	// 	padding: 0;
	// }

	// & &__header {
	// 	// margin-bottom: 16px;
	// 	margin: 0;
	// 	padding: 0;
	// }

	// & &__meta {
	// 	color: @color-base--subtle;
	// 	margin: 0;
	// 	padding: 0;
	// }
}
</style>

