package model

// ArticleTag 文章标签关联模型（多对多中间表）
type ArticleTag struct {
	TagID     uint `gorm:"primaryKey;not null" json:"tag_id"`
	ArticleID uint `gorm:"primaryKey;not null" json:"article_id"`
}

// TableName 指定表名
func (ArticleTag) TableName() string {
	return "article_tags"
}
