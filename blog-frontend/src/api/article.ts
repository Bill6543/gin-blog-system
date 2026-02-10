import apiClient from './http'
import { ApiResponse, PaginatedResponse, Article, PaginationParams } from '../types'

// 文章相关API
export const articleApi = {
  // 获取文章列表
  getArticles: (params: PaginationParams) => {
    return apiClient.get<ApiResponse<PaginatedResponse<Article>>>('/articles', { params })
  },

  // 获取文章详情
  getArticleById: (id: number) => {
    return apiClient.get<ApiResponse<Article>>(`/articles/${id}`)
  },

  // 创建文章
  createArticle: (data: Partial<Article>) => {
    return apiClient.post<ApiResponse<Article>>('/articles', data)
  },

  // 更新文章
  updateArticle: (id: number, data: Partial<Article>) => {
    return apiClient.put<ApiResponse<Article>>(`/articles/${id}`, data)
  },

  // 删除文章
  deleteArticle: (id: number) => {
    return apiClient.delete<ApiResponse<null>>(`/articles/${id}`)
  },

  // 文章点赞
  likeArticle: (id: number) => {
    return apiClient.post<ApiResponse<Article>>(`/articles/${id}/like`)
  },

  // 取消点赞
  unlikeArticle: (id: number) => {
    return apiClient.delete<ApiResponse<Article>>(`/articles/${id}/like`)
  },

  // 检查用户是否已点赞
  checkUserLiked: (articleId: number) => {
    return apiClient.get<ApiResponse<{ is_liked: boolean }>>(`/articles/${articleId}/like/status`)
  }
}