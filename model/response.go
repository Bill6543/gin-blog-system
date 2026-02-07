package model

import (
	"gin-blog-system/utils"
	"strings"
)

// ArticleResponse 用于API响应的文章结构体
type ArticleResponse struct {
	ID           uint             `json:"id"`
	Title        string           `json:"title"`
	Content      string           `json:"content"`
	Summary      string           `json:"summary"`
	Cover        string           `json:"cover"`
	Status       int              `json:"status"`
	ViewCount    int              `json:"view_count"`
	LikeCount    int              `json:"like_count"`
	CommentCount int              `json:"comment_count"` // 新增评论计数
	UserID       uint             `json:"user_id"`
	User         UserResponse     `json:"user"`
	CategoryID   uint             `json:"category_id"`
	Category     CategoryResponse `json:"category"`
	TagIDs       []uint           `json:"tag_ids,omitempty"`
	Tags         []TagResponse    `json:"tags"`
	CreatedAt    utils.CustomTime `json:"created_at"` // 使用自定义时间格式
	UpdatedAt    utils.CustomTime `json:"updated_at"` // 使用自定义时间格式
}

// UserResponse 用于API响应的用户结构体
type UserResponse struct {
	ID        uint             `json:"id"`
	Username  string           `json:"username"`
	Nickname  string           `json:"nickname"`
	Email     string           `json:"email"`
	Avatar    string           `json:"avatar"`
	Status    int              `json:"status"`
	CreatedAt utils.CustomTime `json:"created_at"` // 使用自定义时间格式
	UpdatedAt utils.CustomTime `json:"updated_at"` // 使用自定义时间格式
}

// CategoryResponse 用于API响应的分类结构体
type CategoryResponse struct {
	ID          uint             `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Status      int              `json:"status"`
	CreatedAt   utils.CustomTime `json:"created_at"` // 使用自定义时间格式
	UpdatedAt   utils.CustomTime `json:"updated_at"` // 使用自定义时间格式
}

// TagResponse 用于API响应的标签结构体
type TagResponse struct {
	ID        uint             `json:"id"`
	Name      string           `json:"name"`
	Color     string           `json:"color"`
	Status    int              `json:"status"`
	CreatedAt utils.CustomTime `json:"created_at"` // 使用自定义时间格式
	UpdatedAt utils.CustomTime `json:"updated_at"` // 使用自定义时间格式
}

// CommentResponse 用于API响应的评论结构体
type CommentResponse struct {
	ID        uint             `json:"id"`
	Content   string           `json:"content"`
	UserID    uint             `json:"user_id"`
	User      UserResponse     `json:"user"`
	ArticleID uint             `json:"article_id"`
	ParentID  *uint            `json:"parent_id,omitempty"`
	Parent    *CommentResponse `json:"parent,omitempty"`
	Status    int              `json:"status"`
	CreatedAt utils.CustomTime `json:"created_at"` // 使用自定义时间格式
	UpdatedAt utils.CustomTime `json:"updated_at"` // 使用自定义时间格式
}

// addStaticPrefix 为图片路径添加静态文件前缀
func addStaticPrefix(path string) string {
	if path == "" {
		return "/static/default_cover.png"
	}
	// 如果已经是完整路径，直接返回
	if strings.HasPrefix(path, "/static/") {
		return path
	}
	// 添加前缀（注意：Gin静态文件配置为 r.Static("/static", "./static/uploads")）
	return "/static/" + path
}

// ConvertToArticleResponse 将Article模型转换为API响应结构体
func (a *Article) ConvertToArticleResponse() *ArticleResponse {
	response := &ArticleResponse{
		ID:      a.ID,
		Title:   a.Title,
		Content: a.Content,
		Summary: a.Summary,
		// 为图片路径添加静态文件前缀
		Cover:        addStaticPrefix(a.Cover),
		Status:       a.Status,
		ViewCount:    a.ViewCount,
		LikeCount:    a.LikeCount,
		CommentCount: a.CommentCount, // 新增评论计数
		UserID:       a.UserID,
		CategoryID:   a.CategoryID,
		CreatedAt:    utils.CustomTime{Time: a.CreatedAt},
		UpdatedAt:    utils.CustomTime{Time: a.UpdatedAt},
	}

	// 从关联的标签中提取标签ID
	for _, tag := range a.Tags {
		response.TagIDs = append(response.TagIDs, tag.ID)
	}

	// 转换关联对象
	if a.User.ID != 0 {
		response.User = UserResponse{
			ID:       a.User.ID,
			Username: a.User.Username,
			Nickname: a.User.Nickname,
			Email:    a.User.Email,
			// 为头像路径添加静态文件前缀
			Avatar:    addStaticPrefix(a.User.Avatar),
			Status:    a.User.Status,
			CreatedAt: utils.CustomTime{Time: a.User.CreatedAt},
			UpdatedAt: utils.CustomTime{Time: a.User.UpdatedAt},
		}
	}

	if a.Category.ID != 0 {
		response.Category = CategoryResponse{
			ID:          a.Category.ID,
			Name:        a.Category.Name,
			Description: a.Category.Description,
			Status:      a.Category.Status,
			CreatedAt:   utils.CustomTime{Time: a.Category.CreatedAt},
			UpdatedAt:   utils.CustomTime{Time: a.Category.UpdatedAt},
		}
	}

	for _, tag := range a.Tags {
		tagResp := TagResponse{
			ID:        tag.ID,
			Name:      tag.Name,
			Color:     tag.Color,
			Status:    tag.Status,
			CreatedAt: utils.CustomTime{Time: tag.CreatedAt},
			UpdatedAt: utils.CustomTime{Time: tag.UpdatedAt},
		}
		response.Tags = append(response.Tags, tagResp)
	}

	return response
}

// ConvertToCommentResponse 将Comment模型转换为API响应结构体
func (c *Comment) ConvertToCommentResponse() *CommentResponse {
	response := &CommentResponse{
		ID:        c.ID,
		Content:   c.Content,
		UserID:    c.UserID,
		ArticleID: c.ArticleID,
		Status:    c.Status,
		CreatedAt: utils.CustomTime{Time: c.CreatedAt},
		UpdatedAt: utils.CustomTime{Time: c.UpdatedAt},
	}

	// 转换关联对象（过滤敏感字段：密码）
	if c.User.ID != 0 {
		response.User = UserResponse{
			ID:        c.User.ID,
			Username:  c.User.Username,
			Nickname:  c.User.Nickname,
			Email:     c.User.Email,
			Avatar:    c.User.Avatar,
			Status:    c.User.Status,
			CreatedAt: utils.CustomTime{Time: c.User.CreatedAt},
			UpdatedAt: utils.CustomTime{Time: c.User.UpdatedAt},
		}
	}

	if c.ParentID != nil && c.Parent != nil && c.Parent.ID != 0 {
		parentResp := CommentResponse{
			ID:        c.Parent.ID,
			Content:   c.Parent.Content,
			UserID:    c.Parent.UserID,
			ArticleID: c.Parent.ArticleID,
			Status:    c.Parent.Status,
			CreatedAt: utils.CustomTime{Time: c.Parent.CreatedAt},
			UpdatedAt: utils.CustomTime{Time: c.Parent.UpdatedAt},
		}
		// 转换父评论的关联对象
		if c.Parent.User.ID != 0 {
			parentResp.User = UserResponse{
				ID:        c.Parent.User.ID,
				Username:  c.Parent.User.Username,
				Nickname:  c.Parent.User.Nickname,
				Email:     c.Parent.User.Email,
				Avatar:    c.Parent.User.Avatar,
				Status:    c.Parent.User.Status,
				CreatedAt: utils.CustomTime{Time: c.Parent.User.CreatedAt},
				UpdatedAt: utils.CustomTime{Time: c.Parent.User.UpdatedAt},
			}
		}
		response.Parent = &parentResp
	}

	return response
}
