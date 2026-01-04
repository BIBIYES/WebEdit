<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import io from 'socket.io-client'
import 'xterm/css/xterm.css'
import { message } from 'ant-design-vue'

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['disconnect'])

const terminalContainer = ref(null)
let term = null
let socket = null
let fitAddon = null

const destroySession = () => {
  if (socket) {
    socket.emit('destroy')
  }
}

defineExpose({
  destroySession,
})

const initTerminal = () => {
  term = new Terminal({
    cursorBlink: true,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    fontSize: 14,
    theme: {
      background: '#141729', // Matches --termius-bg
      foreground: '#FFFFFF', // Matches --termius-text-primary
      cursor: '#20BFA9', // Matches --termius-accent
      selectionBackground: 'rgba(32, 191, 169, 0.3)',
    },
  })

  fitAddon = new FitAddon()
  term.loadAddon(fitAddon)

  term.open(terminalContainer.value)
  fitAddon.fit()

  term.onData((data) => {
    if (socket && socket.connected) {
      socket.emit('stdin', data)
    }
  })

  // Handle Resize
  term.onResize((size) => {
    if (socket && socket.connected) {
      socket.emit('resize', { cols: size.cols, rows: size.rows })
    }
  })

  // Observer for container resize
  const resizeObserver = new ResizeObserver(() => {
    fitAddon.fit()
  })
  resizeObserver.observe(terminalContainer.value)

  return resizeObserver
}

const connectSocket = () => {
  const baseUrl =
    import.meta.env.VITE_PROXY_BASE_URL || 'https://bytecourt.cn-hongkong.kitasoda.com'

  socket = io(`${baseUrl}/session/connect`, {
    query: {
      token: props.token,
    },
    transports: ['websocket'], // Force WebSocket as per docs
  })

  socket.on('connect', () => {
    term.writeln('\x1b[32mConnected to session...\x1b[0m')
    // Send initial size
    fitAddon.fit()
    socket.emit('resize', { cols: term.cols, rows: term.rows })
  })

  socket.on('ready', () => {
    term.writeln('\x1b[32mTerminal ready.\x1b[0m')
    term.focus()
  })

  socket.on('stdout', (data) => {
    term.write(data)
  })

  socket.on('error', (err) => {
    term.writeln(`\r\n\x1b[31mError: ${err.message || 'Unknown error'}\x1b[0m`)
    if (err.status === 'NOT FOUND' || err.status === 'ACCESS DECLINE') {
      message.error(`连接错误: ${err.message}`)
      socket.disconnect()
      emit('disconnect')
    }
  })

  socket.on('end', () => {
    term.writeln('\r\n\x1b[33mSession ended.\x1b[0m')
    socket.disconnect()
    emit('disconnect')
  })

  socket.on('disconnect', () => {
    term.writeln('\r\n\x1b[31mDisconnected from server.\x1b[0m')
  })

  socket.on('connect_error', (err) => {
    term.writeln(`\r\n\x1b[31mConnection Error: ${err.message}\x1b[0m`)
  })
}

let observer = null

onMounted(() => {
  if (props.token) {
    observer = initTerminal()
    connectSocket()
  } else {
    emit('disconnect')
  }
})

onBeforeUnmount(() => {
  if (socket) {
    socket.emit('destroy') // Good practice to cleanup
    socket.disconnect()
  }
  if (term) {
    term.dispose()
  }
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div ref="terminalContainer" class="terminal-wrapper"></div>
</template>

<style scoped>
.terminal-wrapper {
  width: 100%;
  height: 100%;
  background-color: var(--termius-bg);
  box-sizing: border-box;
}

/* Override xterm scrollbar if needed */
:deep(.xterm-viewport) {
  scrollbar-width: thin;
  scrollbar-color: var(--termius-border) var(--termius-bg); /* thumb track */
}
</style>
