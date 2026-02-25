// 用户相关类型
export interface User {
  id: number
  username: string
  nickname: string
  email: string
  avatar: string
  status: number
  created_at: string
  updated_at: string
}

// 文章相关类型
export interface Article {
  id: number
  title: string
  content: string
  summary: string
  cover: string
  status: number
  view_count: number
  like_count: number
  comment_count: number
  user_id: number
  user: UserResponse
  category_id: number
  category: CategoryResponse
  tag_ids: number[]
  tags: TagResponse[]
  created_at: string
  updated_at: string
}

// 分类类型
export interface Category {
  id: number
  name: string
  description: string
  status: number
  created_at: string
  updated_at: string
}

// 标签类型
export interface Tag {
  id: number
  name: string
  color: string
  status: number
  article_count?: number
  created_at: string
  updated_at: string
}

// 后端实际返回的响应类型（首字母大写）
export interface UserResponse {
  ID: number
  Username: string
  Nickname: string
  Email: string
  Avatar: string
  Status: number
  CreatedAt: string
  UpdatedAt: string
}

export interface CategoryResponse {
  ID: number
  Name: string
  Description: string
  Status: number
  CreatedAt: string
  UpdatedAt: string
}

export interface TagResponse {
  ID: number
  Name: string
  Color: string
  Status: number
  CreatedAt: string
  UpdatedAt: string
}

// 评论类型
export interface Comment {
  id: number
  content: string
  user_id: number
  user: User
  article_id: number
  parent_id?: number
  parent?: Comment
  status: number
  created_at: string
  updated_at: string
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

// 登录请求类型
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  user: User
  token: string
}

// 注册请求类型
export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
  avatar?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  page_size: number
}

// 分页响应
export interface PaginatedResponse<T> {
  articles: T[]
  total: number
  page: number
  page_size: number
}