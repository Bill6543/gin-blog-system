package model

import (
	"time"
)

// Article 文章模型
type Article struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Title        string    `gorm:"not null" json:"title"`
	Content      string    `gorm:"type:text" json:"content"`
	Summary      string    `gorm:"type:text" json:"summary"`
	Cover        string    `json:"cover"`                   // 封面图片URL
	Status       int       `gorm:"default:1" json:"status"` // 1-发布, 0-草稿
	ViewCount    int       `gorm:"default:0" json:"view_count"`
	LikeCount    int       `gorm:"default:0" json:"like_count"`
	CommentCount int       `gorm:"default:0" json:"comment_count"`        // 新增评论计数
	UserID       uint      `json:"user_id"`                               // 作者ID
	User         User      `gorm:"foreignKey:UserID" json:"user"`         // 关联用户
	CategoryID   uint      `json:"category_id"`                           // 分类ID
	Category     Category  `gorm:"foreignKey:CategoryID" json:"category"` // 关联分类
	Tags         []Tag     `gorm:"many2many:article_tags;" json:"tags"`   // 关联标签
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// TableName 指定表名
func (Article) TableName() string {
	return "articles"
}
