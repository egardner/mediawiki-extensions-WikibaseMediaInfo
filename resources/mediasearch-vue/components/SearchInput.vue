<template>
	<div class="wbmi-media-search-input">
		<input
			v-model="term"
			:placeholder="$i18n( 'searchbutton' )"
			class="wbmi-media-search-input__input"
			tabindex="0"
			aria-disabled="false"
			@keyup.enter="updateTerm"
		>

		<mw-button
			class="wbmi-media-search-input__button"
			:primary="true"
			:progressive="true"
			@click="updateTerm">
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
		border-radius: @border-radius-base 0 0 @border-radius-base;
		border: @border-style-base @border-width-base @border-color-base;
		font-size: 14px;
		margin: 0;
		padding: 6px;
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
		margin: 0;
	}
}

</style>