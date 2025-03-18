<script setup>
import { ref } from 'vue'
import { audioToText } from '../transcribe.js';

const url = ref('');

const props = defineProps({
  status: Object,
  deviceChecked: Object,
  transcribed: Object
});

const emit = defineEmits(['update:deviceChecked']);

const transcribeAudio = async () => {
  console.log("Transcribing Audio...")
  props.transcribed.value = await audioToText(url.value, props.status, props.deviceChecked);
  if (props.transcribed.value.error)
    props.transcribed.value = null;
  console.log("Transcription Complete")
}

const handleChecked = () => {
  props.deviceChecked.value = !props.deviceChecked.value;
}
</script>

<template>
  <div>
    <input class="url-text" type="text" v-model="url" @keyup.enter="transcribeAudio" placeholder="Enter YouTube URL / ID">
    <div class="checkbox-container">
      <label for="device-checkbox" class="device-label">WebGPU</label>
      <input type="checkbox" id="device-checkbox" :checked="deviceChecked.value" @change="handleChecked">
    </div>
  </div>
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
