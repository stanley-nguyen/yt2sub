<template>
  <div>
    <label for="dropdown">Preset Models </label>
    <select v-model="selected" @change="handleChange" id="dropdown">
      <option v-for="option in props.options" :key="option" :value="option">{{ option }}</option>
    </select>
    <label for="dropdown" class="size-item">Size: {{ formattedSize }}</label>
  </div>

  <div class="model-container">
    <div class="model-input-container">
      <label for="model-input">Model </label>
      <input @keyup.enter="handleEnter" type="text" class="model-input" placeholder="Enter model name">
    </div>
    <label v-if="invalidModel" for="model-input" class="invalid-model">
      Invalid model, try a different one.
    </label>
    <div v-else-if="modelFound" for="model-input" class="found-model">
      Model found!
    </div>
    <div v-else-if="modelExists" for="model-input" class="exists-model">
      Model already exists!
    </div>

    <div class="model-info">
      Models can be found on
      <a href="https://huggingface.co/models?pipeline_tag=automatic-speech-recognition&library=transformers.js&sort=trending" target="_blank" class="info-link">HuggingFace</a>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue';
  import { getModelSize } from '@/transcribe';

  const props = defineProps({
    model: Object,
    modelSize: Object,
    sizeIndex: Object,
    deviceChecked: Object,
    options: Array,
    selected: String
  });

  const selected = ref(props.selected);
  const invalidModel = ref(false);
  const modelFound = ref(false);
  const searchModel = ref(false);
  const modelExists = ref(false);
  
  if (!selected.value) {
    selected.value = props.model.value;
  }

  // cache model & model size if not already cached,
  // check if model is valid on huggingface
  // if not, log error and return 0.
  // if model is valid, update the model size in props and selected value.
  watch([props.model, props.deviceChecked, searchModel], async (val) => {
    invalidModel.value = false;
    const newModel = val[0];
    const device = props.deviceChecked.value ? 'webgpu' : 'wasm';
    const indexName = `${newModel}-${device}`;
    const indexedSize = props.sizeIndex.value.get(indexName);
    let size;

    if (indexedSize) {
      size = indexedSize;
      props.modelSize.value = size;
    }
    else {
      size = await getModelSize(newModel, device);
    }

    if (!size) {
      console.error('Invalid model.');
      invalidModel.value = true;
      setTimeout(() => invalidModel.value = false, 3000);
      return 0;
    }

    if (!props.options.includes(newModel))
      props.options.push(newModel);

    props.sizeIndex.value.set(indexName, size);
    props.modelSize.value = size;
    selected.value = newModel;
    if (searchModel.value && !indexedSize) {
      modelFound.value = true;
      setTimeout(() => modelFound.value = false, 3000);
      searchModel.value = false;
    }
    else if (searchModel.value && indexedSize) {
      modelExists.value = true;
      setTimeout(() => modelExists.value = false, 3000);
      searchModel.value = false;
    }

  });

  function handleChange() {
    props.model.value = selected.value;
  };

  function handleEnter(event) {
    props.model.value = event.target.value;
    searchModel.value = true;
    event.target.value = '';
  }

  // format model size to MB or GB, depending on size in MB
  const formattedSize = computed(() => {
    const sizeMB = props.modelSize.value;
    return sizeMB >= 1000
         ? `${(sizeMB / 1000).toFixed(2)} GB`
         : `${sizeMB.toFixed(2)} MB`;
  });
</script>

<style scoped>
.size-item {
  margin-left: 10px;
  color: #6666FF;
}

.model-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  padding: 0 0 1em 0;
}

.model-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70%;
}

.model-input {
  text-align: center;
  width: 50%;
}

.invalid-model {
  color: #d20000;
}

.invalid-link {
  color: #ff0000;
  text-decoration: underline;
  padding: 0;
}

.invalid-link:hover {
  background-color: #d8000083;
  border-radius: 4px;
}

.found-model {
  color: #00de00;
}

.exists-model {
  color: #ff8000;
}

.model-info {
  color: #3067c4;
  margin-top: 10px;
}

.info-link {
  color: #2877ff;
  text-decoration: underline;
  padding: 0;
}
</style>