import apiClient from './http'
import { Comment, ApiResponse, PaginationParams } from '../types'

// 评论相关API接口
export const commentApi = {
  // 创建评论
  createComment: (data: {
    content: string
    article_id: number
    parent_id?: number
  }): Promise<ApiResponse<Comment>> => {
    // 明确指定完整路径，避免代理配置问题
    return apiClient.post('/comments', data)
  },

  // 获取文章评论列表
  getArticleComments: (
    articleId: number,
    params?: PaginationParams
  ): Promise<ApiResponse<{
    comments: Comment[]
    total: number
    page: number
    page_size: number
  }>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString())
    
    // 明确指定完整路径
    return apiClient.get(`/comments/article/${articleId}?${queryParams}`)
  },

  // 获取单条评论
  getComment: (id: number): Promise<ApiResponse<Comment>> => {
    // 使用相对路径，配合baseURL
    return apiClient.get(`/comments/${id}`)
  },

  // 删除评论
  deleteComment: (id: number): Promise<ApiResponse<string>> => {
    // 使用相对路径，配合baseURL
    return apiClient.delete(`/comments/${id}`)
  }
}