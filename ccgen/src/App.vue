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
       { status: status, deviceChecked: deviceChecked, transcribed: transcribed } : // props for InputBar component
       { status: status.value, deviceChecked: deviceChecked.value };                // props for LoadingBar component
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
          <component :is="status === 0 ? InputBar : LoadingBar" v-bind="inputProps"/>
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
  padding: 3vh 0;
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
