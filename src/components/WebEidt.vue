<script setup>
import { CodeEditor } from 'monaco-editor-vue3'
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'java',
  },
})

const emit = defineEmits(['update:modelValue'])

const code = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const editorOptions = {
  fontSize: 14,
  minimap: { enabled: true },
  automaticLayout: true,
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
}
</script>

<template>
  <div class="app">
    <CodeEditor
      v-model:value="code"
      :language="language"
      theme="vs-dark"
      :options="editorOptions"
      class="editor"
    ></CodeEditor>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  height: 100%;
}
</style>
