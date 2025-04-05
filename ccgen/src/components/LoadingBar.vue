<script setup>
import { toRefs } from 'vue';
import Progress from './Progress.vue';

const props = defineProps({
  progressItems: Object,
  status: Object,
  statusMap: Object
});

const { progressItems, status, statusMap } = toRefs(props);
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
