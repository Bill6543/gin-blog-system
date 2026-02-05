package model

import (
	"time"
)

// Category 分类模型
type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null;size:100" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Status      int       `gorm:"default:1" json:"status"`               // 1-启用, 0-禁用
	Articles    []Article `gorm:"foreignKey:CategoryID" json:"articles"` // 关联文章
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName 指定表名
func (Category) TableName() string {
	return "categories"
}
