<script setup>
  defineProps({
    transcribed: Object
  })
</script>

<template>
  <ul v-if="transcribed">
    <h3>Transcript:</h3>
    <li v-for="(chunk, index) in transcribed.chunks" :key="index">
      <span>{{ chunk.timestamp }}</span>
      <p>{{ chunk.text }}</p>
    </li>
  </ul>
</template>