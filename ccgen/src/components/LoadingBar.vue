<script setup>
import Progress from './Progress.vue';

const props = defineProps({
  progressItems: Object,
  ready: Object,
  status: Object,
  statusMap: Object
});

let progressItems = props.progressItems;
let status = props.status;
</script>

<template>
  <div class="progress-bars-container">
      <label v-if="status">{{ statusMap[status]  }}</label>
      <div v-for="data in progressItems" :key="data.file">
        <Progress :text="data.file" :percentage="data.progress"></Progress>
      </div>
  </div>
</template>

<style scoped>
div {
  text-align: center;
  margin-bottom: 5em;
}
</style>
