<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import InputBar from './components/InputBar.vue';
import LoadingBar from './components/LoadingBar.vue';
import TranscriptionResult from './components/TranscriptionResult.vue';

const worker = ref(null);
const ready = ref(true);
const running = ref(false);
const progressItems = ref([]);
const errored = ref({error: false, message: null});
const transcribed = ref(null);
const deviceChecked = ref(true);
const translateChecked = ref(false);
const model = ref('Xenova/whisper-tiny');
const modelSize = ref(151.489138);
const sizeIndex = ref(new Map());
const modelOptions = ['Xenova/whisper-tiny', 'Xenova/whisper-tiny.en', 'Xenova/whisper-base', 'Xenova/whisper-medium'];
const status = ref(0);
const statusMap = {
  0: 'Ready to transcribe',
  1: 'Fetching Audio Stream...',
  2: 'Loading Model (only run once per model)...',
  3: 'Transcribing using WebGPU...',
  4: 'Transcribing using WASM...'
}
const sourceLanguage = ref('English');

const onMessageReceived = (e) => {
  switch (e.data.status) {
    case 'initiate':
      // Model file start load: add a new progress item to the list.
      status.value = 2; // set status to loading model
      ready.value = false;
      progressItems.value = [...progressItems.value, e.data];
      break;

    case 'progress':
      // Model file progress: update one of the progress items.
      progressItems.value = progressItems.value.map(item => {
        if (item.file === e.data.file) {
          return { ...item, progress: e.data.progress, loaded: e.data.loaded, total: e.data.total }
        }
        return item;
      });
      break;

    case 'done':
      // Model file loaded: remove the progress item from the list.
      progressItems.value = progressItems.value.filter(item => item.file !== e.data.file);
      if (!progressItems.value.length)
        status.value = deviceChecked ? 3 : 4; // set status to transcribing with WebGPU or WASM
      break;

    case 'ready':
      // Pipeline ready: the worker is ready to accept messages.
      ready.value = true;
      break;

    case 'error':
      // Transcription error: display an error.
      status.value = 0;
      running.value = false;

      errored.value.error = true;
      if (e.data.error.message === 'Unsupported device: "webgpu". Should be one of: wasm.')
        errored.value.message = 'WebGPU is unsupported, try unchecking the box or enabling it on your browser';
      else
        errored.value.message = e.data.error.message;

      // hide error message after n seconds
      setTimeout(() => {
        errored.value = {
          error: false,
          message: null
        }
      }, 15000);
      break;

    case 'complete':
      // Transcription complete: update the transcribed value
      status.value = 0;
      running.value = false;
      transcribed.value = e.data.output;
      break;
  }
};

onMounted(() => {
  worker.value ??= new Worker(new URL('./worker.js', import.meta.url), {
    type: 'module'
  });

  worker.value.addEventListener('message', onMessageReceived);
});

onBeforeUnmount(() => {
  if (worker.value)
    worker.value.removeEventListener('message', onMessageReceived);
});

const inputProps = computed(() => {
  return running.value === false? 
       { worker: worker, running: running, status: status,
        deviceChecked: deviceChecked, translateChecked: translateChecked,
        transcribed: transcribed, model: model, modelSize: modelSize, sizeIndex: sizeIndex, modelOptions: modelOptions, errored: errored, sourceLanguage: sourceLanguage } // props for InputBar component
     : { progressItems: progressItems, status: status, statusMap: statusMap };                                                                                             // props for LoadingBar component
});
</script>

<template>
  <main>
    <div class="container">
      <div class="input-container">
        <header>
          <div class="title-item">
            <h1 class="title-header">YouTube to Transcript</h1>
          </div>
        </header>

        <div class="url-item">
          <component :is="running === false ? InputBar : LoadingBar" v-bind="inputProps"
                     @update:deviceChecked="deviceChecked = !deviceChecked"
                     @update:translateChecked="translateChecked = !translateChecked"
                     @update:running="(rn) => running = rn"
                     @update:options="(op) => modelOptions.push(op)"
                     @update:status="(st) => status = st"
                     @update:language="(lg) => sourceLanguage = lg"/>
        </div>

        <a class="links" href="https://github.com/stanley-nguyen/yt2sub" target="_blank">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
          </svg>
          <span class="link-text">GitHub</span>
        </a>
      </div>

      <div class="result-container" v-if="transcribed">
        <TranscriptionResult :transcribed="transcribed"/>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.title-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 350px;
  height: 45%;
  background: linear-gradient(45deg, #690000, #7e0808);
  border-radius: 20px;
}

.input-container, .result-container {
  display: block;
  justify-content: center;
  align-items: center;
  background-color: #2D2D2D;
  color: #ffffff;
  border-radius: 15px;
}

.input-container {
  padding: 0 5vw;
  justify-items: center;
  padding-bottom: 10px;
}

.result-container {
  padding: 2vh 0;
}

ul {
  list-style-type: none;
}

header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 10vh;
}

.url-item {
  display: block;
  justify-content: center;
  align-items: center;
}

.loading-box {
  filter: drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.7));
  font-size: 14px;
}

.links {
  width: 10px;
  color: #9c9c9c;
  padding: 4px 5px;
  border-radius: 10px;
}

.links:hover {
  background-color: #9c9c9c33;
}

.link-text {
  padding-left: 5px;
}
</style>
