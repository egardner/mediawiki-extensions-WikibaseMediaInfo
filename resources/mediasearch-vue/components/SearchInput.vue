<template>
	<div class="wbmi-media-search-input">
		<input
			v-model="term"
			class="wbmi-media-search-input__input"
			type="search"
			tabindex="0"
			aria-disabled="false"
			@keyup.enter="updateTerm"
		>

		<span class="wbmi-media-search-input__icon">
			<mw-icon
				:icon="'search'"
				:invert="false"
			></mw-icon>
		</span>

		<mw-button
			class="wbmi-media-search-input__button"
			:primary="true"
			:progressive="true"
			@click="updateTerm"
		>
			{{ $i18n( 'searchbutton' ) }}
		</mw-button>
	</div>
</template>

<script>
var Button = require( './base/Button.vue' ),
	Icon = require( './base/Icon.vue' );

module.exports = {
	name: 'SearchInput',

	components: {
		'mw-button': Button,
		'mw-icon': Icon
	},

	props: {
		initialTerm: String
	},

	data: function () {
		return {
			term: this.initialTerm
		};
	},

	methods: {
		updateTerm: function () {
			this.$emit( 'update', this.term );
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../../lib/wikimedia-ui-base.less';

.wbmi-media-search-input {
	.flex-display();
	.flex-wrap( nowrap );
	box-sizing: border-box;
	max-width: @max-width-base;
	padding: 0 0 16px 0;
	position: relative;
	width: 100%;

	&__input {
		border: @border-style-base @border-width-base @border-color-base;
		border-radius: @border-radius-base 0 0 @border-radius-base;
		font-size: 14px;
		padding: 6px;
		padding-left: 36px;
		width: 100%;

		&:focus {
			border-color: @color-primary--focus;
			box-shadow: @box-shadow-base--focus;
			outline: 0;
		}

		&::placeholder {
			color: @color-placeholder;
		}
	}

	&__button {
		border-radius: 0 @border-radius-base @border-radius-base 0;
	}

	&__icon {
		left: 3px;
		opacity: 0.67;
		padding: 5px;
		position: absolute;
	}
}

</style>