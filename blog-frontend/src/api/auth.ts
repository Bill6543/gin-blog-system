import apiClient from './http'
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User
} from '../types'

// 认证相关API
export const authApi = {
  // 用户登录 - 使用相对路径
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/auth/login', data)
      .then(response => {
        // 直接处理完整的API响应格式
        const responseData = response.data;
        
        if (responseData.code === 200 && responseData.data) {
          return {
            user: responseData.data.user,
            token: responseData.data.token
          };
        } else {
          throw new Error(responseData.msg || '登录失败');
        }
      });
  },

  // 用户注册
  register: (data: RegisterRequest): Promise<User> => {
    return apiClient.post('/auth/register', data)
      .then(response => {
        const responseData = response.data;
        
        if (responseData.code === 200 && responseData.data) {
          return responseData.data;
        } else {
          throw new Error(responseData.msg || '注册失败');
        }
      });
  },

  // 用户登出
  logout: (): Promise<null> => {
    return apiClient.post('/auth/logout')
      .then(response => {
        const responseData = response.data;
        
        if (responseData.code === 200) {
          return null;
        } else {
          throw new Error(responseData.msg || '登出失败');
        }
      });
  }
}
