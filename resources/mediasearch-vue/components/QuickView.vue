<template>
	<div class="wbmi-media-search-quick-view">
		<header class="wbmi-media-search-quick-view__header">
			<img :src="thumbnail" class="wbmi-media-search-quick-view__thumbnail">

			<button class="wbmi-media-search-quick-view__close-button" @click="close">
				X
			</button>
		</header>

		<div class="wbmi-media-search-quick-view__body">
			<h3>{{ details.title }}</h3>
			<!-- eslint-disable-next-line vue/no-v-html -->
			<p v-html="details.metadata.ImageDescription.value"></p>
		</div>
	</div>
</template>

<script>
/**
 * @file QuickView.vue
 *
 * Component to display expanded details about a given search result
 */

// @vue/component
module.exports = {
	name: 'QuickView',

	props: {
		details: {
			type: Object,
			required: true
		}
	},

	computed: {
		thumbnail: function () {
			return this.details.imageinfo[ 0 ].thumburl;
		}
	},

	methods: {
		close: function () {
			this.$emit( 'close' );
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-media-search-quick-view {
	border: @border-base;
	border-radius: 4px;
	box-sizing: @box-shadow-card;
	position: sticky;
	margin-top: 8px;
	top: 16px;

	&__thumbnail {
		background-color: @wmui-color-base70;
		object-fit: contain;
		height: auto;
		max-height: 300px;
		width: 100%;
	}

	&__close-button {
		position: absolute;
		top: 8px;
		left: 8px;
	}

	&__body {
		padding: 16px;
	}
}
</style>
