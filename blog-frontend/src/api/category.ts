import apiClient from './http'
import { 
  Category, 
  ApiResponse 
} from '../types'

// 分类相关API
export const categoryApi = {
  // 获取分类列表
  getCategories: () => {
    return apiClient.get<ApiResponse<Category[]>>('/categories')
  },

  // 获取分类详情
  getCategoryById: (id: number) => {
    return apiClient.get<ApiResponse<Category>>(`/categories/${id}`)
  },

  // 创建分类
  createCategory: (data: Partial<Category>) => {
    return apiClient.post<ApiResponse<Category>>('/categories', data)
  },

  // 更新分类
  updateCategory: (id: number, data: Partial<Category>) => {
    return apiClient.put<ApiResponse<Category>>(`/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory: (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/categories/${id}`)
  }
}