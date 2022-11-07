<template>
	<div>
		<div>Vue2 Demo Page!</div>
		<button @click="addCount">Add Count</button>
		<p>Count</p>
	</div>
</template>

<script>
export default {
	data() {
		return {
			Count: 0,
		};
	},
	created() {},
	mounted() {},
	destroyed() {},
	methods: {
		addCount() {
			this.Count++;
		},
	},
};
</script>

<style scoped></style>
