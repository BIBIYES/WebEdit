import request from '@/utils/request'

// 健康检查接口
export const healthCheck = () => {
  return request.get('/')
}
