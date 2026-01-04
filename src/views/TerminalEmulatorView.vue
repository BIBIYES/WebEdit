<script setup>
import { ref, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import {
  CodepenOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue'
import TerminalEmulator from '@/components/TerminalEmulator.vue'
import { sessionImages, createSession } from '@/api/sandboxApi'
import { message, Modal } from 'ant-design-vue'

const router = useRouter()
const images = ref([])
const createLoading = ref(false)
const fetchLoading = ref(false)
const approach = ref('create') // create or connected
const sessionToken = ref('')
const selectedImage = ref(undefined)
const timeLimit = ref(90) // minutes
const terminalRef = ref(null)

const fetchImages = async () => {
  try {
    fetchLoading.value = true
    const res = await sessionImages()
    if (res.data.status === 'SUCCESS') {
      images.value = res.data.message
      if (images.value.length > 0) {
        selectedImage.value = images.value[0].image
      }
    }
  } catch (error) {
    message.error('获取镜像列表失败: ' + error.message)
  } finally {
    fetchLoading.value = false
  }
}

const handleCreateSession = async () => {
  if (!selectedImage.value) {
    message.warning('请选择一个镜像')
    return
  }

  try {
    createLoading.value = true
    const payload = {
      image: selectedImage.value,
      timeLimit: timeLimit.value * 60 * 1000, // convert to ms
    }
    const res = await createSession(payload)
    if (res.data.status === 'SUCCESS') {
      const token = String(res.data.message || '').trim()
      sessionToken.value = token
      approach.value = 'connected'
      message.success('容器创建成功')
    } else {
      message.error('创建失败: ' + (res.data.message || '未知错误'))
    }
  } catch (error) {
    message.error('创建会话错误: ' + error.message)
  } finally {
    createLoading.value = false
  }
}

const handleToCodeEdit = () => {
  router.push({ name: 'home' })
}

const handleDisconnect = () => {
  approach.value = 'create'
  sessionToken.value = ''
}

const handleDestroy = () => {
  Modal.confirm({
    title: '确认销毁',
    content: '确定要销毁当前会话吗？这将断开连接并删除容器。',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      if (terminalRef.value) {
        terminalRef.value.destroySession()
      }
    },
  })
}

onMounted(() => {
  fetchImages()
})
</script>

<template>
  <div class="terminal-emulator-view">
    <div class="header">
      <div class="left">
        <h2>终端模拟器</h2>
      </div>
      <div class="right" style="display: flex; gap: 10px">
        <a-button
          v-if="approach === 'connected'"
          danger
          :icon="h(DeleteOutlined)"
          @click="handleDestroy"
        >
          销毁会话
        </a-button>
        <a-button :icon="h(CodepenOutlined)" @click="handleToCodeEdit">代码编辑器</a-button>
      </div>
    </div>

    <div class="content">
      <!-- Creation Form -->
      <div v-if="approach === 'create'" class="creation-panel">
        <a-card title="创建新的会话" style="width: 500px">
          <a-form layout="vertical">
            <a-form-item label="选择镜像">
              <a-select v-model:value="selectedImage" placeholder="请选择镜像">
                <a-select-option v-for="img in images" :key="img.image" :value="img.image">
                  {{ img.image }} ({{ img.base }})
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="时间限制 (分钟)">
              <a-input-number v-model:value="timeLimit" :min="1" :max="1440" style="width: 100%" />
            </a-form-item>

            <a-form-item>
              <a-button
                type="primary"
                block
                :loading="createLoading"
                @click="handleCreateSession"
                :icon="h(PlayCircleOutlined)"
              >
                创建并连接
              </a-button>
            </a-form-item>
          </a-form>

          <div class="actions">
            <a-button
              type="link"
              @click="fetchImages"
              :icon="h(ReloadOutlined)"
              :loading="fetchLoading"
              >刷新镜像列表</a-button
            >
          </div>
        </a-card>
      </div>

      <!-- Terminal -->
      <div v-else class="terminal-container">
        <TerminalEmulator ref="terminalRef" :token="sessionToken" @disconnect="handleDisconnect" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.terminal-emulator-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--termius-bg);
  color: var(--termius-text-primary);

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

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    position: relative;
  }

  /* Custom styling for Ant Design components in dark mode context */
  :deep(.ant-card) {
    background-color: var(--termius-panel-bg);
    border: 1px solid var(--termius-border);
    color: var(--termius-text-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

    .ant-card-head {
      border-bottom: 1px solid var(--termius-border);
      color: var(--termius-text-primary);

      .ant-card-head-title {
        color: var(--termius-text-primary);
      }
    }

    .ant-card-body {
      color: var(--termius-text-secondary);
    }
  }

  :deep(.ant-form-item-label > label) {
    color: var(--termius-text-secondary);
  }

  :deep(.ant-input),
  :deep(.ant-input-number),
  :deep(.ant-select-selector) {
    background-color: var(--termius-input-bg) !important;
    border-color: var(--termius-border) !important;
    color: var(--termius-text-primary) !important;

    input {
      color: var(--termius-text-primary) !important;
      background-color: transparent !important;
    }
  }

  :deep(.ant-input-number-input) {
    color: var(--termius-text-primary) !important;
    background-color: transparent !important;
  }

  :deep(.ant-select-arrow) {
    color: var(--termius-text-secondary);
  }

  // Consistent Button Styling
  :deep(.ant-btn-primary) {
    background-color: var(--termius-accent);
    border-color: var(--termius-accent);
    color: #fff;
    &:hover {
      opacity: 0.9;
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

  :deep(.ant-btn-text) {
    color: var(--termius-text-secondary);
    &:hover {
      color: var(--termius-text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
  }

  :deep(.ant-btn-link) {
    color: var(--termius-accent);
    &:hover {
      opacity: 0.8;
    }
  }

  :deep(.ant-btn-danger) {
    color: #ff4d4f;
    border-color: #ff4d4f;
    background: transparent;
    &:hover {
      color: #ff7875;
      border-color: #ff7875;
    }
  }

  .creation-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;

    .actions {
      text-align: right;
      margin-top: 10px;
    }
  }

  .terminal-container {
    width: 100%;
    height: 100%;
    background: var(--termius-bg); /* Match container bg */
    border-radius: 0;
    overflow: hidden;
    position: relative;
  }
}
</style>
