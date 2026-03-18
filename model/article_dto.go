package model

// ArticleCreateRequest 创建文章请求
type ArticleCreateRequest struct {
	Title      string `json:"title" binding:"required"`
	Content    string `json:"content" binding:"required"`
	Summary    string `json:"summary"`
	Cover      string `json:"cover"`
	Status     int    `json:"status"`
	CategoryID uint   `json:"category_id"`
	TagIDs     []uint `json:"tag_ids,omitempty"`
}

// ArticleUpdateRequest 更新文章请求
type ArticleUpdateRequest struct {
	Title      string `json:"title"`
	Content    string `json:"content"`
	Summary    string `json:"summary"`
	Cover      string `json:"cover"`
	Status     int    `json:"status"`
	CategoryID uint   `json:"category_id"`
	TagIDs     []uint `json:"tag_ids,omitempty"`
}

// ArticleResponse 文章响应（已存在 ConvertToArticleResponse 方法）
// 直接使用 Article 模型的转换方法即可
