<script setup>
import { ref } from 'vue'
import { notification } from 'ant-design-vue'
import { useRouter } from 'vue-router'

const AUTH_STORAGE_KEY = 'sandbox_auth_key'
const router = useRouter()
const authKey = ref('')
const isChecking = ref(false)

const handleLogin = async () => {
  const trimmedKey = authKey.value.trim()
  if (!trimmedKey) {
    notification.warning({
      message: '请输入密钥',
      placement: 'topRight',
      duration: 2,
    })
    return
  }

  isChecking.value = true
  localStorage.setItem(AUTH_STORAGE_KEY, trimmedKey)
  router.push({ name: 'home' })
  isChecking.value = false
}
</script>

<template>
  <div class="login">
    <div class="login-card">
      <div class="login-title">填写key来进入web编辑器</div>
      <div class="login-subtitle">请输入密钥以继续</div>
      <a-input
        v-model:value="authKey"
        placeholder="请输入 key"
        size="large"
        @keyup.enter="handleLogin"
      />
      <a-button
        type="primary"
        size="large"
        :loading="isChecking"
        class="login-button"
        @click="handleLogin"
      >
        验证并进入
      </a-button>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--termius-bg);
  padding: 20px;
}
.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--termius-panel-bg);
  border: 1px solid var(--termius-border);
  border-radius: 10px;
  padding: 28px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.login-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--termius-text-primary);
}
.login-subtitle {
  font-size: 13px;
  color: var(--termius-text-secondary);
}
.login-button {
  width: 100%;
  background-color: var(--termius-accent);
  border-color: var(--termius-accent);
}
.login-button:hover {
  opacity: 0.9;
  background-color: var(--termius-accent);
  border-color: var(--termius-accent);
}

:deep(.ant-input) {
  background-color: var(--termius-input-bg);
  border-color: var(--termius-border);
  color: var(--termius-text-primary);
}
</style>
