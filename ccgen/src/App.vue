<script setup>
import { ref, computed } from 'vue';
import InputBar from './components/InputBar.vue';
import LoadingBar from './components/LoadingBar.vue';
import TranscriptionResult from './components/TranscriptionResult.vue';

const status = ref(0);
const transcribed = ref(null);
const deviceChecked = ref(true);

const inputProps = computed(() => {
  return status.value === 0 ? 
       { status: status, deviceChecked: deviceChecked, transcribed: transcribed } :
       { status: status.value, deviceChecked: deviceChecked.value };
});

</script>

<template>
  <header>
    <div class="title-item">
      <h1 class="title-header">Youtube to Transcript</h1>
    </div>
  </header>

  <main>
    <div class="url-item">
      <component :is="status === 0 ? InputBar : LoadingBar" v-bind="inputProps"/>
      <TranscriptionResult :transcribed="transcribed"/>
    </div>
  </main>
</template>

<style scoped>
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
