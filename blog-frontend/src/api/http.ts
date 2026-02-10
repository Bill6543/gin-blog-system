import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// 创建axios实例
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // 由于vite.config.ts中配置了代理，这里只需要/api
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    // 排除不需要认证的接口
    const noAuthEndpoints = ['/auth/login', '/auth/register', '/auth/logout'];
    if (token && !noAuthEndpoints.some(endpoint => config.url?.endsWith(endpoint))) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 简化处理，只做错误处理
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 直接返回完整的response对象，让业务层处理数据格式
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      let errorMsg = '未知错误';
      
      // 尝试从不同位置获取错误消息
      if (data && typeof data === 'object') {
        if ('msg' in data) {
          errorMsg = data.msg;
        } else if ('message' in data) {
          errorMsg = data.message;
        } else if ('error' in data) {
          errorMsg = data.error;
        }
      }
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          break
        case 403:
          console.error('权限不足')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error('请求失败:', errorMsg)
      }
      
      return Promise.reject(new Error(errorMsg));
    } else {
      console.error('网络错误:', error.message)
      return Promise.reject(new Error('网络错误，请稍后重试'));
    }
  }
)

export default apiClient