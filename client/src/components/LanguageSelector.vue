<script setup>
import { watch, ref } from 'vue';
const props = defineProps({
  type: String,
  defaultLanguage: String,
  model: Object
});

// List of supported languages:
// https://help.openai.com/en/articles/7031512-whisper-api-faq
// https://github.com/openai/whisper/blob/248b6cb124225dd263bb9bd32d060b6517e067f8/whisper/tokenizer.py#L79
const ALL_LANGUAGES = {
  en: "English",
  zh: "Chinese",
  de: "German",
  es: "Spanish/Castilian",
  ru: "Russian",
  ko: "Korean",
  fr: "French",
  ja: "Japanese",
  pt: "Portuguese",
  tr: "Turkish",
  pl: "Polish",
  ca: "Catalan/Valencian",
  nl: "Dutch/Flemish",
  ar: "Arabic",
  sv: "Swedish",
  it: "Italian",
  id: "Indonesian",
  hi: "Hindi",
  fi: "Finnish",
  vi: "Vietnamese",
  he: "Hebrew",
  uk: "Ukrainian",
  el: "Greek",
  ms: "Malay",
  cs: "Czech",
  ro: "Romanian/Moldavian/Moldovan",
  da: "Danish",
  hu: "Hungarian",
  ta: "Tamil",
  no: "Norwegian",
  th: "Thai",
  ur: "Urdu",
  hr: "Croatian",
  bg: "Bulgarian",
  lt: "Lithuanian",
  la: "Latin",
  mi: "Maori",
  ml: "Malayalam",
  cy: "Welsh",
  sk: "Slovak",
  te: "Telugu",
  fa: "Persian",
  lv: "Latvian",
  bn: "Bengali",
  sr: "Serbian",
  az: "Azerbaijani",
  sl: "Slovenian",
  kn: "Kannada",
  et: "Estonian",
  mk: "Macedonian",
  br: "Breton",
  eu: "Basque",
  is: "Icelandic",
  hy: "Armenian",
  ne: "Nepali",
  mn: "Mongolian",
  bs: "Bosnian",
  kk: "Kazakh",
  sq: "Albanian",
  sw: "Swahili",
  gl: "Galician",
  mr: "Marathi",
  pa: "Punjabi/Panjabi",
  si: "Sinhala/Sinhalese",
  km: "Khmer",
  sn: "Shona",
  yo: "Yoruba",
  so: "Somali",
  af: "Afrikaans",
  oc: "Occitan",
  ka: "Georgian",
  be: "Belarusian",
  tg: "Tajik",
  sd: "Sindhi",
  gu: "Gujarati",
  am: "Amharic",
  yi: "Yiddish",
  lo: "Lao",
  uz: "Uzbek",
  fo: "Faroese",
  ht: "Haitian Creole/Haitian",
  ps: "Pashto/Pushto",
  tk: "Turkmen",
  nn: "Nynorsk",
  mt: "Maltese",
  sa: "Sanskrit",
  lb: "Luxembourgish/Letzeburgesch",
  my: "Myanmar/Burmese",
  bo: "Tibetan",
  tl: "Tagalog",
  mg: "Malagasy",
  as: "Assamese",
  tt: "Tatar",
  haw: "Hawaiian",
  ln: "Lingala",
  ha: "Hausa",
  ba: "Bashkir",
  jw: "Javanese",
  su: "Sundanese"
};

const LANGUAGES = ref({ ...ALL_LANGUAGES });

watch(() => props.model?.value, (newModel) => {
  if (newModel && newModel.endsWith('en')) {
    LANGUAGES.value = { en: "English" };
  }
  else {
    LANGUAGES.value = { ...ALL_LANGUAGES };
  }
});
</script>

<template>
  <div className='language-selector'>
    <label>{{ type }}</label>
      <select :disabled="Object.keys(LANGUAGES).length === 1" :value="defaultLanguage">
        <option v-for="(value, key) in LANGUAGES" :key="key" :value="value">
          {{ value }}
        </option>
    </select>
  </div>
</template>

<style scoped>
.language-selector select {
  margin-left: 10px;
  width: 250px;
}

.language-selector select:disabled {
  opacity: 100%;
  color: #414141;
}
</style>