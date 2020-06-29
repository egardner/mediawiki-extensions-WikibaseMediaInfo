<template>
	<div class="wbmi-generic-result">
		<a :href="result.canonicalurl">
			{{ result.title }}
		</a>
	</div>
</template>

<script>
// @vue/component
module.exports = {
	name: 'GenericResult',

	props: {
		result: {
			type: Object,
			required: true
		}
	}
};
</script>
