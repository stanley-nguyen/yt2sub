<script setup>
  defineProps({
    transcribed: Object
  })
</script>

<template>
  <table v-if="transcribed">
    <caption>Transcript</caption>
    <thead>
      <tr>
        <th v-if="transcribed && transcribed.chunks">Start</th>
        <th v-if="transcribed && transcribed.chunks">End</th>
        <th>Text</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="transcribed && transcribed.chunks" v-for="(chunk, index) in transcribed.chunks" :key="index">
        <td v-for="(t, _) in chunk.timestamp">
          <span>{{ t.toFixed(2) }}</span> 
        </td>
        <td>{{ chunk.text }}</td>
      </tr>
      <tr v-else-if="transcribed && !transcribed.chunks">
        <td colspan="3">{{ transcribed.text }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  margin: 0 auto;
  width: 95%;
  border-collapse: collapse;
}

caption {
  font-weight: bold;
  margin-bottom: 1em;
  font-size: 24px;
}

th, td {
  border: 1px solid #4e4e4e;
  padding: 8px;
  text-align: left;
}

th:nth-child(n+3) {
  text-align: center;  
  justify-items: center;
}
</style>