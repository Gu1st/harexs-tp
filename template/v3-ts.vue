<template>
	<div>
		<div>Vue3 Composition Demo Page!</div>
		<button @click="addCount">Add Count</button>
		<p>Count</p>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";

let Count = ref(0); //Genericity derivation type
const addCount = () => {
	Count.value++;
};
</script>

<style scoped></style>
