package model

import (
	"time"
)

// Like 点赞记录模型
type Like struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index:idx_user_article,unique" json:"user_id"`    // 点赞用户ID
	ArticleID uint      `gorm:"not null;index:idx_user_article,unique" json:"article_id"` // 被点赞文章ID
	CreatedAt time.Time `json:"created_at"`                                               // 点赞时间
}

// TableName 指定表名
func (Like) TableName() string {
	return "likes"
}
