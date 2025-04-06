<script setup>
import { toRefs, watch } from 'vue';
import Progress from './Progress.vue';
import { formatSize } from '@/utils';

const props = defineProps({
  progressItems: Object,
  status: Object,
  statusMap: Object
});

const { progressItems, status, statusMap } = toRefs(props);

watch(() => props.progressItems, (newval) => {
  progressItems.value = newval;
})
</script>

<template>
  <div class="progress-bars-container">
      <label v-if="status">{{ statusMap[status]  }}</label>
      <div v-for="data in progressItems" :key="data.file">
        <Progress :text="`${data.file} : ${formatSize(data.loaded)} / ${formatSize(data.total)}`" :percentage="data.progress"></Progress>
      </div>
  </div>
</template>

<style scoped>
div {
  text-align: center;
  margin-bottom: 5em;
}
</style>
