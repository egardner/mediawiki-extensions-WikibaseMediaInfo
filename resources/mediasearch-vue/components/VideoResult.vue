<template>
	<div class="wbmi-video-result">
		<!-- Thumbnail is image-only for now; maybe we only want video on detail expand? -->
		<div class="wmbi-video-result__thumbnail">
			<img v-bind:src="thumbnail" v-bind:alt="title">
		</div>

		<!-- What else can we expect to be available here with reasonable frequency? -->
		<div class="wbmi-video-result__info">
			<h3>
				<a v-bind:href="url">
					{{ title }}
				</a>
			</h3>

			<!-- Description text tends to be in HTML. Is there a way to strip this out easily? -->
			<p>{{ description }}</p>
		</div>
	</div>
</template>

<script>
// @vue/component
module.exports = {
	name: 'VideoResult',

	props: [ 'result' ],

	computed: {
		metadata: function () {
			if ( this.result.imageinfo && this.result.imageinfo[ 0 ].extmetadata ) {
				return this.result.imageinfo[ 0 ].extmetadata
			}
		},

		artist: function () {
			if ( this.metadata ) {
				return this.metadata[ 'Author' ].value
			}
		},

		attribution: function () {
			if ( this.metadata ) {
				return this.metadata[ 'Attribution' ].value
			}
		},

		categories: function () {
			if ( this.metadata ) {
				return this.metadata[ 'Categories' ].value
			}
		},

		date: function () {
			if ( this.metadata ) {
				return this.metadata[ 'DateTime' ].value
			}
		},

		description: function () {
			if ( this.metadata ) {
				return this.metadata[ 'ImageDescription' ].value
			}
		},

		title: function () {
			if ( this.metadata ) {
				return this.metadata[ 'ObjectName' ].value
			} else {
				return this.result.title
			}
		},

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

		thumbnail: function () {
			return this.result.imageinfo[ 0 ].thumburl;
		},

		src: function () {
			return this.result.imageinfo[ 0 ].url;
		},

		url: function () {
			return this.result.canonicalurl;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-video-result {
	.flex-display();
	.flex-wrap( no-wrap );
	flex-direction: row;
	margin-bottom: 16px;

	&__thumbnail {
		.flex( 0 0 200px );
	}

	&__info {
		.flex( 1 1 auto );
		padding: 0 8px;
	}
}
</style>

