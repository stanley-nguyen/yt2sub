<script setup>
const props = defineProps({
  text: String,
  percentage: { 
    type: Number,
    default: 0
  }
});
</script>

<template>
  <div className="progress-container">
    <div className='progress-bar' :style="{ width: `${percentage}` }">
        {{ text }} ({{ `${percentage.toFixed(2)}%` }})
    </div>
  </div>
</template>