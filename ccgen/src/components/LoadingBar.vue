<template>
    <div v-if="status !== 0">
        <p v-if="status === 1">Fetching Audio Stream...</p>
        <p v-else-if="status === 2">Loading Model (first time may take a while)...</p>
        <p v-else-if="status === 3">Generating Transcript using {{ deviceChecked ? 'WebGPU' : 'WASM' }}...</p>
    </div>
</template>

<script setup>
defineProps({
  status: {
    type: Number,
    required: true
  },
  deviceChecked: {
    type: Boolean,
    required: true
  }
});
</script>

<style scoped>
div {
  text-align: center;
  margin-bottom: 5em;
}
</style>
