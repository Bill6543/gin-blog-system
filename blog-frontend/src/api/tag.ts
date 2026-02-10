import apiClient from './http'
import { 
  Tag, 
  ApiResponse 
} from '../types'

// 标签相关API
export const tagApi = {
  // 获取标签列表
  getTags: () => {
    return apiClient.get<ApiResponse<Tag[]>>('/tags')
  },

  // 获取标签详情
  getTagById: (id: number) => {
    return apiClient.get<ApiResponse<Tag>>(`/tags/${id}`)
  },

  // 创建标签
  createTag: (data: Partial<Tag>) => {
    return apiClient.post<ApiResponse<Tag>>('/tags', data)
  },

  // 更新标签
  updateTag: (id: number, data: Partial<Tag>) => {
    return apiClient.put<ApiResponse<Tag>>(`/tags/${id}`, data)
  },

  // 删除标签
  deleteTag: (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/tags/${id}`)
  }
}