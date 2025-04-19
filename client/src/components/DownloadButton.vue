<script setup>
import { ref } from 'vue';
import { transcriptToASS, transcriptToSRT, downloadFile } from '@/utils';

const props = defineProps({
  transcribed: Object,
  required: true
})

const subFormats = [
  '.ass',
  '.srt'
];

const selectedFormat = ref('.ass');

function dlStart() {
  switch (selectedFormat.value) {
    case '.ass':
      const formattedASS = transcriptToASS(props.transcribed);
      downloadFile(formattedASS, 'subs.ass');
      break;
    case '.srt':
      const formattedSRT = transcriptToSRT(props.transcribed);
      downloadFile(formattedSRT, 'subs.srt');
      break;
  }

}
</script>

<template>
  <div class="format-wrapper">
    <label for="format-select">Subtitle Format:</label>
    <select v-model="selectedFormat" id="format-select">
      <option v-for="format in subFormats" :key="format" :value="format">
        {{ format }}
      </option>
    </select>
  </div>

  <div class="dl-button" @click="dlStart">
    <h1 class="dl-text">Download</h1>
  </div>
</template>

<style scoped>
.dl-button {
  display: block;
  background: #730606;
  width: 20%;
  border-radius: 10px;
}

.dl-button:hover {
  cursor: pointer;
}

.dl-button:active {
  background: #450202;
}

.dl-text {
  text-align: center;
}

.format-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

#format-select {
  margin-left: 5px;
}
</style>