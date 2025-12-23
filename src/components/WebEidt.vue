<script setup>
import { CodeEditor } from 'monaco-editor-vue3'
import { ref } from 'vue'

const code = ref(`import java.util.*;

public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, Java in Monaco!");
  }
}`)

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
      language="java"
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
