package model

import (
	"time"
)

// Tag 标签模型
type Tag struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"not null;size:50" json:"name"`
	Color     string    `gorm:"size:20" json:"color"`                    // 标签颜色
	Status    int       `gorm:"default:1" json:"status"`                 // 1-启用, 0-禁用
	Articles  []Article `gorm:"many2many:article_tags;" json:"articles"` // 关联文章
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName 指定表名
func (Tag) TableName() string {
	return "tags"
}
