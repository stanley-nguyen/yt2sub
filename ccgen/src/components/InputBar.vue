<script setup>
import { ref } from 'vue'
import { audioToText } from '../transcribe.js';
import Dropdown from './Dropdown.vue';

const url = ref('');

const props = defineProps({
  status: Object,
  deviceChecked: Object,
  transcribed: Object,
  model: Object,
  modelSize: Object,
  sizeIndex: Object
});

const transcribeAudio = async () => {
  console.log("Transcribing Audio...")
  props.transcribed.value = await audioToText(props.model.value, url.value, props.status, props.deviceChecked);
  if (props.transcribed.value.error)
    props.transcribed.value = null;
  console.log("Transcription Complete")
}

const handleChecked = () => {
  props.deviceChecked.value = !props.deviceChecked.value;
}

const modelOptions = ['Xenova/whisper-tiny', 'Xenova/whisper-tiny.en', 'Xenova/whisper-base', 'Xenova/whisper-medium'];
</script>

<template>
  <div>
    <input class="url-text" type="text" v-model="url" @keyup.enter="transcribeAudio" placeholder="Enter YouTube URL / ID">
    <Dropdown :options="modelOptions" :model="model" :modelSize="modelSize" :deviceChecked="deviceChecked" :sizeIndex="sizeIndex"/>
    <div class="checkbox-container">
      <label for="device-checkbox" class="device-label">WebGPU</label>
      <input type="checkbox" id="device-checkbox" :checked="deviceChecked.value" @change="handleChecked">
    </div>
  </div>
</template>

<style scoped>
div {
  text-align: center;
  margin-bottom: 1em;
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
