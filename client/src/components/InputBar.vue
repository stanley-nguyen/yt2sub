<script setup>
import { ref } from 'vue'
import { audioToArr } from '../utils.js';
import Dropdown from './Dropdown.vue';
import LanguageSelector from './LanguageSelector.vue';

const url = ref('');
const emit = defineEmits(["update:deviceChecked", "update:running", "update:options", "update:status", "update:translateChecked", "update:language"]);

const props = defineProps({
  worker: Object,
  deviceChecked: Object,
  translateChecked: Object,
  transcribed: Object,
  model: Object,
  modelSize: Object,
  sizeIndex: Object,
  modelOptions: Object,
  errored: Object,
  sourceLanguage: Object
});

async function transcribeAudio() {
  console.log("Fetching Audio Stream...");

  let f32Array;
  try {
    const id = urlToID(url.value);

    if (!id) {
      url.value = '';
      throw new Error('Invalid YouTube URL');
    }
    
    emit("update:running", true);
    emit("update:status", 1);
    const response = await fetch(`http://localhost:3000/api/${id}`);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error);
    }

    f32Array = await audioToArr(response);
  } catch (error) {
    console.error(error);
    props.worker.value.postMessage({
      status: 'error',
      error
    })
  }

  props.transcribed.value = null
  props.worker.value.postMessage({
    f32Array: f32Array,
    model: props.model.value,
    device: props.deviceChecked.value ? 'webgpu' : 'wasm',
    translateChecked: props.translateChecked.value,
    language: props.sourceLanguage.value
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
</script>

<template>
  <div>
    <input class="url-text" id="url-text" type="text" v-model="url" @keyup.enter="transcribeAudio" placeholder="Enter YouTube URL / ID">
    <label class="errored-text" for="url-text" v-if="errored.value.error">{{ errored.value.message }}</label>
    <Dropdown :options="modelOptions" :model="model" :modelSize="modelSize" :deviceChecked="deviceChecked" :sizeIndex="sizeIndex"
              @update:options="(opt) => emit('update:options', opt)"/>

    <div class="language-container">
      <LanguageSelector type="Source" defaultLanguage="English" :model="model" @change="(lg) => emit('update:language', lg.target.value)"></LanguageSelector>
    </div>

    <div class="checkbox-container">
      <div class="device-container">
        <label for="device-checkbox" class="device-label">WebGPU</label>
        <input type="checkbox" id="device-checkbox" :checked="deviceChecked.value" @change="emit('update:deviceChecked')">
      </div>

      <div class="tl-container">
        <label for="tl-checkbox" class="translate-label">Translate</label>
        <input type="checkbox" id="tl-checkbox" :checked="translateChecked.value" @change="emit('update:translateChecked')">
      </div>
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

.language-container {
  display: flex;
  flex-direction: row;
}

.checkbox-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.device-container, .tl-container {
  display: block;
  flex-direction: row;
  align-items: center;
  margin-bottom: 5px;
}

.device-label, .translate-label {
  margin-right: 0.5em;
}
</style>
