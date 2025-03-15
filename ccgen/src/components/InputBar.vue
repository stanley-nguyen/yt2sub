<script setup>
import { audioToText } from '../transcribe.js';
import { ref } from 'vue'
import LoadingBar from './LoadingBar.vue';

defineProps({
  url: {
    type: String
  },
});

const url = ref('');
const status = ref(0);
const transcribed = ref(null);
const deviceChecked = ref(true);

const transcribeAudio = async () => {
  console.log("Transcribing Audio...")
  transcribed.value = await audioToText(url, status, deviceChecked.value);
  if (transcribed.value.error)
    transcribed.value = null;
  console.log("Transcription Complete")
}
</script>

<template>
  <div>
    <div v-if="status === 0" class="input-container">
      <input class="url-text" type="text" v-model="url" @keyup.enter="transcribeAudio" placeholder="Enter YouTube URL / ID">
      <div class="checkbox-container">
        <label for="device-checkbox" class="device-label">WebGPU</label>
        <input type="checkbox" id="device-checkbox" v-model="deviceChecked">
      </div>
    </div>
    <LoadingBar :status="status" :deviceChecked="deviceChecked"></LoadingBar>
  </div>

  <ul v-if="transcribed">
    <h3>Transcript:</h3>
    <li v-for="(chunk, index) in transcribed.chunks" :key="index">
      <span>{{ chunk.timestamp }}</span>
      <p>{{ chunk.text }}</p>
    </li>
  </ul>
</template>

<style scoped>
div {
  text-align: center;
  margin-bottom: 5em;
}

ul {
  list-style-type: none;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.url-text {
  text-align: center;
  width: 50em;
  margin-bottom: 1em;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-label {
  margin-right: 0.5em;
}
</style>
