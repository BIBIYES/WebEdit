import request from '@/utils/request'

// 健康检查接口
export const healthCheck = () => {
  return request.get('/')
}

// 提交代码执行
export const runCode = (payload) => {
  return request.post('/run', payload)
}

// 获取可用镜像列表
export const sessionImages = () => {
  return request.get('/session/images')
}

// 创建 Session 容器
export const createSession = (payload) => {
  return request.post('/session/create', payload)
}
