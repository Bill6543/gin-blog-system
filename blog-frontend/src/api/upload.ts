import apiClient from './http'
import { ApiResponse } from '../types'

// 上传相关API
export const uploadApi = {
  // 上传图片
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<ApiResponse<{ url: string; filePath: string }>>(
      '/api/upload/image',  // 修复：添加完整的/api前缀
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

  // 上传文件
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post<ApiResponse<{ url: string; filePath: string }>>(
      '/api/upload/file',  // 修复：添加完整的/api前缀
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  }
}