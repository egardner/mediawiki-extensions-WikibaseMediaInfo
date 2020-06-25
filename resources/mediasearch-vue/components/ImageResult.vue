<template>
	<div class="wbmi-image-result" v-bind:style="baseWidth">
		<img
			v-bind:src="thumbnail"
			v-bind:alt="title"
		>
	</div>
</template>

<script>
var searchResult = require( '../mixins/searchResult.js' );

module.exports = {
	name: 'ImageResult',

	mixins: [ searchResult ],

	computed: {
		width: function () {
			return this.result.imageinfo[ 0 ].width;
		},

		height: function () {
			return this.result.imageinfo[ 0 ].height;
		},

		aspectRatio: function () {
			return this.width / this.height;
		},

		baseWidth: function () {
			return {
				'flex-basis': Math.round( 180 * this.aspectRatio ) + 'px'
			};
		}
	}

};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-image-result {
	.flex( 1, 1, auto );
	box-sizing: border-box;
	padding: 8px;

	&:last-child {
		.flex( 0, 1, auto );
	}

	img {
		height: 180px;
		min-width: 100px;
		object-fit: cover;
		object-position: center center;
		width: 100%;
	}

	&__title {
		height: 20px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}
</style>
