<script setup>
import { h, onMounted, ref, watch } from 'vue'
import {
  ArrowUpOutlined,
  CodeOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  LogoutOutlined,
  DesktopOutlined,
} from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import WebEidt from '@/components/WebEidt.vue'
import { healthCheck, runCode } from '@/api/sandboxApi'
import { useRouter } from 'vue-router'
const AUTH_STORAGE_KEY = 'sandbox_auth_key'
const isConsoleOpen = ref(true)
const codeType = ref('java')

const defaultCodeTemplates = {
  java: `import java.util.*;

public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, Java in Monaco!");
  }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, C in Monaco!\\n");
    return 0;
}`,
  python: `print("Hello, Python in Monaco!")`,
  nodejs: `console.log("Hello, Node.js in Monaco!");`,
}

const editorCode = ref(defaultCodeTemplates.java)

watch(codeType, (newLang) => {
  if (defaultCodeTemplates[newLang]) {
    editorCode.value = defaultCodeTemplates[newLang]
  }
})
const runLogs = ref([])
const isSubmitting = ref(false)
const router = useRouter()

// 健康检查
const handleHealthCheck = async () => {
  try {
    console.log('正在进行健康检查...')
    const res = await healthCheck()
    console.log('健康检查成功：', res.data)
    notification.success({
      message: '健康检查成功',
      description: '沙箱服务连接正常。',
      placement: 'topRight',
      duration: 3,
    })
  } catch (error) {
    console.error('健康检查失败：', error)
    notification.error({
      message: '健康检查失败',
      description: '无法连接至沙箱服务，请稍后重试。',
      placement: 'topRight',
      duration: 3,
    })
    localStorage.removeItem(AUTH_STORAGE_KEY)
    router.push({ name: 'login' })
  }
}

const handleRun = async () => {
  try {
    isSubmitting.value = true
    const res = await runCode({
      language: codeType.value,
      code: editorCode.value,
    })
    const payload = res?.data || {}
    const message = payload?.message || {}
    const metadata = message?.metadata || {}
    const traceId = payload?.traceId || `local_${Date.now()}`
    const traceDate = traceId.split('_')[0] || new Date().toISOString()

    runLogs.value.push({
      id: traceId,
      traceId,
      time: traceDate,
      status: payload?.status || 'UNKNOWN',
      exitCode: metadata?.exitCode ?? null,
      oom: metadata?.oom ?? false,
      stdout: message?.stdout || '',
      stderr: message?.stderr || '',
    })
    notification.success({
      message: '提交成功',
      description: '执行完成',
      placement: 'topRight',
      duration: 2,
    })
  } catch (error) {
    console.error('提交失败：', error)
    if (error?.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      router.push({ name: 'login' })
      notification.error({
        message: '密钥失效',
        description: '请重新验证密钥。',
        placement: 'topRight',
        duration: 3,
      })
      return
    }
    notification.error({
      message: '提交失败',
      description: '接口调用失败，请稍后重试。',
      placement: 'topRight',
      duration: 3,
    })
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteLog = (logId) => {
  runLogs.value = runLogs.value.filter((item) => item.id !== logId)
}

const formatTraceTime = (isoTime) => {
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) return isoTime
  return date.toLocaleString()
}

const handleLogout = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  router.push({ name: 'login' })
}

const handleOpenTerminal = () => {
  router.push({ name: 'TerminalEmulator' })
}

onMounted(() => {
  handleHealthCheck()
})
</script>

<template>
  <div class="app">
    <!-- <div class="problem-details">
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
    </div> -->
    <div class="web-edit">
      <div class="header">
        <div class="left">
          <h2>代码编辑器</h2>
        </div>
        <div class="right">
          <a-space size="middle">
            <a-button type="text" :icon="h(CodeOutlined)" @click="isConsoleOpen = !isConsoleOpen"
              >控制台</a-button
            >
            <a-select v-model:value="codeType" style="width: 120px" :bordered="false">
              <a-select-option value="java">java</a-select-option>
              <a-select-option value="c">c</a-select-option>
              <a-select-option value="python">python</a-select-option>
              <a-select-option value="nodejs">nodejs</a-select-option>
            </a-select>
            <a-button
              type="primary"
              :icon="h(ArrowUpOutlined)"
              :loading="isSubmitting"
              @click="handleRun"
            >
              提交
            </a-button>
            <a-divider type="vertical" style="border-color: var(--termius-border)" />
            <a-button :icon="h(DesktopOutlined)" @click="handleOpenTerminal">终端模拟器</a-button>
            <a-button danger :icon="h(LogoutOutlined)" @click="handleLogout">退出</a-button>
          </a-space>
        </div>
      </div>
      <div class="editor-pane">
        <WebEidt v-model="editorCode" :language="codeType" />
      </div>
      <div class="console" v-show="isConsoleOpen">
        <!-- ... console content ... -->
        <div class="console-hander">
          <a-space><CodeOutlined />控制台</a-space>
          <span style="cursor: pointer" @click="isConsoleOpen = !isConsoleOpen"
            ><CloseCircleOutlined
          /></span>
        </div>
        <div class="console-body">
          <div class="console-empty" v-if="runLogs.length === 0">暂无执行记录</div>
          <div
            class="console-log"
            :class="{ 'console-log-error': log.exitCode === 1 }"
            v-for="log in runLogs"
            :key="log.id"
          >
            <!-- ... log content ... -->
            <div class="console-log-header">
              <div class="console-log-title">
                <span class="console-log-time">{{ formatTraceTime(log.time) }}</span>
                <span class="console-log-status">{{ log.status }}</span>
                <span class="console-log-meta">
                  exitCode: {{ log.exitCode === null ? '-' : log.exitCode }}
                </span>
                <span class="console-log-meta">oom: {{ log.oom ? 'true' : 'false' }}</span>
              </div>
              <a-button
                type="text"
                size="small"
                :icon="h(DeleteOutlined)"
                @click="handleDeleteLog(log.id)"
              />
            </div>
            <div class="console-log-body">
              <div class="console-log-block">
                <div class="console-log-label">stdout</div>
                <pre class="console-log-output">{{ log.stdout || '（空）' }}</pre>
              </div>
              <div class="console-log-block">
                <div class="console-log-label">stderr</div>
                <pre class="console-log-output">{{ log.stderr || '（空）' }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.app {
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: var(--termius-bg);
  color: var(--termius-text-primary);
}

.header {
  padding: 20px 20px;
  height: 50px;
  background: var(--termius-header-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--termius-border);

  h2 {
    margin: 0;
    font-size: 16px;
    color: var(--termius-text-primary);
    font-weight: 500;
    letter-spacing: 0.5px;
  }
}

/* Ant Design Overrides for this View */
:deep(.ant-btn-primary) {
  background-color: var(--termius-accent);
  border-color: var(--termius-accent);
  color: #fff;
  &:hover {
    opacity: 0.9;
  }
}
:deep(.ant-btn-text) {
  color: var(--termius-text-secondary);
  &:hover {
    color: var(--termius-text-primary);
    background: rgba(255, 255, 255, 0.05);
  }
}
:deep(.ant-btn-default) {
  background-color: transparent;
  border-color: var(--termius-border);
  color: var(--termius-text-primary);
  &:hover {
    border-color: var(--termius-accent);
    color: var(--termius-accent);
  }
}
:deep(.ant-btn-danger) {
  color: #ff4d4f;
  border-color: #ff4d4f;
  &:hover {
    color: #ff7875;
    border-color: #ff7875;
  }
}
:deep(.ant-select-selector) {
  background-color: transparent !important;
  color: var(--termius-text-primary) !important;
}
:deep(.ant-select-arrow) {
  color: var(--termius-text-secondary);
}

.console {
  width: 100%;
  flex: 0 0 30%;
  min-height: 140px;
  background-color: var(--termius-panel-bg);
  border-top: 1px solid var(--termius-border);
  display: flex;
  flex-direction: column;
}
.console-body {
  padding: 10px 12px;
  margin: 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.4;
  color: var(--termius-text-secondary);
  font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
}
.console-empty {
  color: var(--termius-text-dim);
}
.console-log {
  border: 1px solid var(--termius-border);
  border-radius: 6px;
  padding: 8px;
  background: var(--termius-input-bg);
  margin-bottom: 10px;
}
.console-log-error {
  border-color: #e4b3b3;
  background: rgba(228, 179, 179, 0.1);
}
.console-log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--termius-border);
}
.console-log-title {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}
.console-log-time {
  color: var(--termius-text-secondary);
}
.console-log-status {
  font-weight: 600;
  color: var(--termius-accent);
}
.console-log-meta {
  color: var(--termius-text-dim);
}
.console-log-body {
  padding-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.console-log-label {
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--termius-text-dim);
  font-size: 11px;
}
.console-log-output {
  margin: 4px 0 0 0;
  padding: 6px 8px;
  background: var(--termius-bg);
  color: var(--termius-text-primary);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}
.console-hander {
  padding: 8px 12px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--termius-text-secondary);
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--termius-border);
  background-color: var(--termius-header-bg);
}
.console-close {
  visibility: hidden;
}
.problem-details {
  width: 30%;
  height: 100%;
  background-color: var(--termius-panel-bg);
  color: var(--termius-text-primary);
  padding: 20px 18px;
  overflow: auto;
  visibility: inherit;

  line-height: 1.6;
  font-size: 14px;
  border-right: 1px solid var(--termius-border);
}
.problem-details h2 {
  margin: 0 0 10px 0;
  font-size: 18px;
  letter-spacing: 0.5px;
  color: var(--termius-accent);
}
.problem-details h3 {
  margin: 14px 0 6px 0;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--termius-text-secondary);
}
.problem-details p {
  margin: 0 0 8px 0;
}
.problem-details pre {
  background: var(--termius-input-bg);
  color: var(--termius-text-primary);
  padding: 10px 12px;
  border-radius: 6px;
  overflow: auto;
  font-family: 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 12px;
  border: 1px solid var(--termius-border);
}

.web-edit {
  width: 100%;
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
