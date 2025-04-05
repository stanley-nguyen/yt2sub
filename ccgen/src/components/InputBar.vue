<script setup>
import { ref } from 'vue'
import { audioToArr } from '../transcribe.js';
import Dropdown from './Dropdown.vue';

const url = ref('');
const emit = defineEmits(["update:deviceChecked", "update:running", "update:options", "update:status"]);

const props = defineProps({
  worker: Object,
  deviceChecked: Object,
  transcribed: Object,
  model: Object,
  modelSize: Object,
  sizeIndex: Object,
  modelOptions: Object,
  errored: Object
});

async function transcribeAudio() {
  console.log("Fetching Audio Stream...");

  emit("update:status", 1);
  emit("update:running", true);

  let f32Array;
  try {
    const id = urlToID(url.value);

    if (!id) {
      url.value = '';
      throw new Error('Invalid YouTube URL');
    }

    const response = await fetch(`http://localhost:3000/api/${id}`);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error);
    }

    f32Array = await audioToArr(response);
  } catch (error) {
    console.error(error);
  }

  props.transcribed.value = null
  props.worker.value.postMessage({
    f32Array: f32Array,
    model: props.model.value,
    device: props.deviceChecked.value ? 'webgpu' : 'wasm'
  });
}

function urlToID(url) {
  // extract ID from url
  // https://gist.github.com/rodrigoborgesdeoliveira/987683cfbfcc8d800192da1e73adc486?permalink_comment_id=5111294#gistcomment-5111294
  const regex = /(?:youtu\.be\/|youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/|embed\/|v\/|m\/|watch\?(?:[^=]+=[^&]+&)*?v=))([^"&?\/\s]{11})/gm;

  const edgeCasesRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?youtube\.com\/watch\/([a-zA-Z0-9_-]+)/;

  let match = regex.exec(url) || edgeCasesRegex.exec(url);

  return match ? match[1] : url;
}

const handleChecked = () => {
  emit('update:deviceChecked');
}

const emitOptions = (options) => {
  emit('update:options', options);
}
</script>

<template>
  <div>
    <input class="url-text" id="url-text" type="text" v-model="url" @keyup.enter="transcribeAudio" placeholder="Enter YouTube URL / ID">
    <label class="errored-text" for="url-text" v-if="errored.value.error">{{ errored.value.message }}</label>
    <Dropdown :options="modelOptions" :model="model" :modelSize="modelSize" :deviceChecked="deviceChecked" :sizeIndex="sizeIndex"
              @update:options="emitOptions"/>
    <div class="checkbox-container">
      <label for="device-checkbox" class="device-label">WebGPU</label>
      <input type="checkbox" id="device-checkbox" :checked="deviceChecked.value" @change="handleChecked">
    </div>
  </div>
</template>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  align-items: center;
  margin-bottom: 1em;
}

.url-text {
  display: block;
  text-align: center;
  align-items: center;
  width: 50em;
  margin-bottom: 0.5em;
}

.errored-text {
  color: red;
  margin-bottom: 0.5em;
}

.input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.checkbox-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.device-label {
  margin-right: 0.5em;
}
</style>
