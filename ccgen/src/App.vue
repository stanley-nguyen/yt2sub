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
const model = ref('Xenova/whisper-tiny');
const modelSize = ref(151.489138);
const sizeIndex = ref(new Map());
const modelOptions = ['Xenova/whisper-tiny', 'Xenova/whisper-tiny.en', 'Xenova/whisper-base', 'Xenova/whisper-medium'];
const status = ref(0);
const statusMap = {
  0: 'Ready to transcribe',
  1: 'Fetching Audio Stream...',
  2: 'Loading Model (first time may take a while)...',
  3: 'Transcribing using WebGPU...',
  4: 'Transcribing using WASM...'
}

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
          return { ...item, progress: e.data.progress }
        }
        return item;
      });
      break;

    case 'done':
      // Model file loaded: remove the progress item from the list.
      status.value = deviceChecked ? 3 : 4; // set status to transcribing with WebGPU or WASM
      progressItems.value = progressItems.value.filter(item => item.file !== e.data.file);
      break;

    case 'ready':
      // Pipeline ready: the worker is ready to accept messages.
      ready.value = true;
      break;

    case 'error':
      // Transcription error: display an error.
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
      }, 7000);
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
        deviceChecked: deviceChecked, transcribed: transcribed, model: model, modelSize: modelSize, sizeIndex: sizeIndex, modelOptions: modelOptions, errored: errored } // props for InputBar component
     : { progressItems: progressItems, ready: ready, status: status, statusMap: statusMap };                                                                                                                    // props for LoadingBar component
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
                     @update:running="(rn) => running = rn"
                     @update:options="(op) => modelOptions.push(op)"
                     @update:status="(st) => status = st"/>
        </div>
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
</style>
