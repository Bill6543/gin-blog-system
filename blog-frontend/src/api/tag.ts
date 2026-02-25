import apiClient from './http'
import apiClient from './http';
import { Tag, ApiResponse } from '../types';

// 标签相关API
export const tagApi = {
  // 获取所有标签
  getTags: () => apiClient.get('/tags'),
  
  // 创建标签
  createTag: (data: Partial<Tag>) => apiClient.post('/tags', data),
  
  // 更新标签
  updateTag: (id: number, data: Partial<Tag>) => apiClient.put(`/tags/${id}`, data),
  
  // 删除标签
  deleteTag: (id: number) => apiClient.delete(`/tags/${id}`)
};