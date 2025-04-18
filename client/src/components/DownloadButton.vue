<script setup>
import { transcriptToASS, downloadFile } from '@/utils';

const props = defineProps({
  transcribed: Object,
  required: true
})

function dlStart() {
  const formattedASS = transcriptToASS(props.transcribed);
  downloadFile(formattedASS, 'subs.ass')
}
</script>

<template>
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
</style>