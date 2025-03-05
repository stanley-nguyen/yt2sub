<script setup>
import InputBar from './components/InputBar.vue';

</script>

<template>
  <header>
    <div class="title-item">
      <h1 class="title-header">Konicihwarts minasan</h1>
    </div>
  </header>

  <main>
    <div class="url-item">
      <InputBar/>
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
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-box {
  filter: drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.7));
  font-size: 14px;
}
</style>
