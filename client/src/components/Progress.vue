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
  <div class="progress-container">
    {{ text }}
    <div class="progress-bar-container">
      <div class='progress-bar' :style="{ width: `${percentage}%` }">
          ({{ `${percentage.toFixed(2)}%` }})
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  color: #6e6e6e;
  text-align: left;
  font-weight: bold;
}

.progress-bar-container {
  width: 100%;
  height: 26px;
  background-color: #ffffff88;
  border-radius: 15px;
  overflow: auto;
  margin: 10px 0 20px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(45deg, #690000, #b80a0a);
  border-radius: 5px;
  transition: width 0s ease-in-out;
  font-weight: bold;
  padding-top: 1px;
  padding-left: 10px;
}
</style>