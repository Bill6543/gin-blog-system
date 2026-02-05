package model

import (
	"time"
)

// User 用户模型
type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"unique;not null" json:"username"`
	Nickname  string    `json:"nickname"`
	Email     string    `gorm:"unique" json:"email"`
	Password  string    `json:"password"`
	Avatar    string    `json:"avatar"`
	Status    int       `gorm:"default:1" json:"status"`           // 1-正常, 0-禁用
	Articles  []Article `gorm:"foreignKey:UserID" json:"articles"` // 关联文章
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}
