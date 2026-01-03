<script setup>
import TerminalEmulator from '@/components/TerminalEmulator.vue'
import { useRouter } from 'vue-router'
import { h } from 'vue'
import { CodepenOutlined } from '@ant-design/icons-vue'
const router = useRouter()

const handleToCodeEdit = () => {
  router.push({ name: 'CodeEditView' })
}
</script>

<template>
  <div class="terminal-emulator">
    <div class="action">
      <div class="left"></div>
      <div class="right">
        <a-button :icon="h(CodepenOutlined)" @click="handleToCodeEdit">代码编辑器</a-button>
      </div>
    </div>
    <TerminalEmulator></TerminalEmulator>
  </div>
</template>

<style scoped lang="scss">
.terminal-emulator {
  display: flex;
  gap: 10px;
  flex-direction: column;
  .action {
    padding: 10px;
    display: flex;
    justify-content: space-between;
  }
  .left {
  }
  .right {
  }
}
</style>
