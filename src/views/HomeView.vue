<script setup>
import { h, onMounted, ref } from 'vue'
import { ArrowUpOutlined, CodeOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import WebEidt from '@/components/WebEidt.vue'
import { healthCheck } from '@/api/sandboxApi'
const isConsoleOpen = ref(true)
const codeType = ref('java')

// 健康检查
const handleHealthCheck = async () => {
  try {
    console.log('正在进行健康检查...')
    const res = await healthCheck()
    console.log('健康检查成功：', res.data)
  } catch (error) {
    console.error('健康检查失败：', error)
    notification.error({
      message: '健康检查失败',
      description: '无法连接至沙箱服务，请稍后重试。',
      placement: 'topRight',
      duration: 3,
    })
  }
}

onMounted(() => {
  handleHealthCheck()
})
</script>

<template>
  <div class="app">
    <div class="problem-details">
      <h2>题目：太空羊驼的时间折叠器</h2>
      <p>
        传说中有一台只接受 Java 语法输入的时间折叠器。它会把输入的数字序列变成一只
        “太空羊驼”的行程表。你的任务是写一个程序，生成它要求的输出，否则羊驼会把你的 CPU
        变成毛线球。
      </p>
      <h3>输入</h3>
      <p>第一行一个整数 N (1 ≤ N ≤ 2×10^5)。第二行 N 个整数 ai (1 ≤ ai ≤ 10^9)。</p>
      <h3>输出</h3>
      <p>
        输出一个长度为 N 的序列 bi，满足：
        <br />
        1) bi = 所有 aj 中满足 (j % (i+1) == 0) 的元素之和；
        <br />
        2) 如果 bi 为偶数，则再加上 ai 的二进制 1 的个数；
        <br />
        3) 如果 bi 为奇数，则再减去 i 的阶乘末尾 0 的个数。
      </p>
      <h3>样例</h3>
      <pre>
输入：
5
3 1 4 1 5

输出：
9 5 8 3 9</pre
      >
      <h3>说明</h3>
      <p>数据量巨大且规则诡异，请在 O(N log N) 或更快的复杂度内解决。</p>
    </div>
    <div class="web-edit">
      <div class="action">
        <a-button :icon="h(CodeOutlined)" @click="isConsoleOpen = !isConsoleOpen"> 控制台</a-button>
        <a-select v-model:value="codeType" style="width: 120px">
          <a-select-option value="javascript">javascript</a-select-option>
          <a-select-option value="java">java</a-select-option>
          <a-select-option value="python">python</a-select-option>
        </a-select>
        <a-button :icon="h(ArrowUpOutlined)"> 提交</a-button>
      </div>
      <div class="editor-pane">
        <WebEidt />
      </div>
      <div class="console" v-if="isConsoleOpen">
        <div class="console-hander">
          <a-space><CodeOutlined />控制台</a-space>
          <span style="cursor: pointer" @click="isConsoleOpen = !isConsoleOpen"
            ><CloseCircleOutlined
          /></span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.app {
  width: 100%;
  height: 100vh;
  display: flex;
}
.console {
  width: 100%;
  flex: 0 0 30%;
  min-height: 140px;
  background-color: #fff8ee;
  border-top: 3px #b39c84 solid;
  display: flex;
  flex-direction: column;
}
.console-hander {
  padding: 8px 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6b5b4b;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #e2d6c8;
}
.action {
  width: 100%;
  padding: 10px;
  background-color: #f7f3ec;
  border-bottom: 2px solid #e2d6c8;
  display: flex;
  align-items: center;
  gap: 10px;
}
.console-close {
  visibility: hidden;
}
.problem-details {
  width: 30%;
  height: 100%;
  background-color: #f7f3ec;
  color: #2b2620;
  padding: 20px 18px;
  overflow: auto;

  line-height: 1.6;
  font-size: 14px;
  border-right: 3px #b39c84 solid;
}
.problem-details h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  letter-spacing: 0.5px;
}
.problem-details h3 {
  margin: 14px 0 6px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6b5b4b;
}
.problem-details p {
  margin: 0 0 8px 0;
}
.problem-details pre {
  background: #1f1a16;
  color: #f4e9da;
  padding: 10px 12px;
  border-radius: 6px;
  overflow: auto;
  font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
}

.web-edit {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.editor-pane {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
</style>
