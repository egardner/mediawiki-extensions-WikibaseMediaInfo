<template>
	<div class="wbmi-image-result" v-bind:style="wrapperStyle" >
		<div v-bind:style="aspectRatio">
		</div>

		<img 
			v-bind:src="thumbnail"
			v-bind:alt="title"
			class="wbmi-image-result__thumbnail"
			loading="lazy"
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
			var ratio = this.height / this.width;

			return {
				'padding-top': ratio * 100 + '%'
			};
		},

		wrapperStyle: function () {
			var wrapperWidth = this.width * 200 / this.height,
				wrapperFlex = this.width * 200 / this.height;

			return {
				width: wrapperWidth + 'px',
				'flex-grow': wrapperFlex
			};
		}
	}

};
</script>

<style lang="less">
@import 'mediawiki.mixins';

.wbmi-image-result {
	// .flex( 0, 1, auto );
	// box-sizing: border-box;
	height: 200px;
	margin: 8px;
	overflow: hidden;
	position: relative;

	&__thumbnail {
		height: 100%;
		left: 0;
		object-fit: cover;
		position: absolute;
		top: 0;
		width: 100%;
	}
}
</style>
