import request from '@/utils/request'

// 健康检查接口
export const healthCheck = () => {
  return request.get('/')
}

// 提交代码执行
export const runCode = (payload) => {
  return request.post('/run', payload)
}
