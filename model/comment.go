package model

import (
	"time"
)

// Comment 评论模型
type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Content   string    `gorm:"not null" json:"content"`
	UserID    uint      `json:"user_id"`                                     // 评论用户ID
	User      User      `gorm:"foreignKey:UserID" json:"user"`               // 关联用户
	ArticleID uint      `json:"article_id"`                                  // 所属文章ID
	Article   Article   `gorm:"foreignKey:ArticleID" json:"article"`         // 关联文章
	ParentID  *uint     `json:"parent_id,omitempty"`                         // 父评论ID（用于回复）
	Parent    *Comment  `gorm:"foreignKey:ParentID" json:"parent,omitempty"` // 关联父评论
	Status    int       `gorm:"default:1" json:"status"`                     // 1-正常, 0-禁用
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (Comment) TableName() string {
	return "comments"
}
