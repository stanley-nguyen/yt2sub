<script setup>
import { audioToText } from '../transcribe.js';
import { ref } from 'vue'

defineProps({
  url: {
    type: String
  },
});

const url = ref('');
const status = ref(0);
const transcribed = ref(null);

const transcribeAudio = async () => {
  console.log("Transcribing Audio...")
  transcribed.value = await audioToText(url, status);
  console.log("Transcription Complete:", transcribed);
}
</script>

<template>
  <input v-if="status === 0" class="urlText" type="text" v-model="url" @keyup.enter="transcribeAudio" placeholder="https://www.youtube.com/watch?v=###">
  <p v-else-if="status === 1">Fetching Audio Stream...</p>
  <p v-else-if="status === 2">Loading Model...</p>
  <p v-else-if="status === 3">Generating Transcript...</p>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.urlText {
  text-align: center;
  width: 50em;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
