package service

import (
	"errors"
	"gin-blog-system/config"
	"gin-blog-system/model"
	"gorm.io/gorm"
)

// CreateTag 创建标签
func CreateTag(tag *model.Tag) error {
	result := config.DB.Create(tag)
	return result.Error
}

// GetTagByID 根据ID获取标签
func GetTagByID(id uint) (*model.Tag, error) {
	var tag model.Tag
	result := config.DB.Preload("Articles").First(&tag, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("标签不存在")
	}
	return &tag, result.Error
}

// GetAllTags 获取所有标签
func GetAllTags() ([]model.Tag, error) {
	var tags []model.Tag
	result := config.DB.Preload("Articles").Find(&tags)
	return tags, result.Error
}

// UpdateTag 更新标签
func UpdateTag(id uint, tagData *model.Tag) error {
	var existingTag model.Tag
	result := config.DB.First(&existingTag, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("标签不存在")
	}

	result = config.DB.Model(&existingTag).Updates(tagData)
	return result.Error
}

// DeleteTag 删除标签
func DeleteTag(id uint) error {
	var tag model.Tag
	result := config.DB.First(&tag, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("标签不存在")
	}

	// 删除标签前，需要处理相关的文章（可以将文章的标签关联移除）
	deleteResult := config.DB.Where("tag_id = ?", id).Delete(&model.ArticleTag{})
	if deleteResult.Error != nil {
		return deleteResult.Error
	}

	// 删除标签本身
	result = config.DB.Delete(&tag)
	return result.Error
}

// GetTagsByStatus 根据状态获取标签
func GetTagsByStatus(status int) ([]model.Tag, error) {
	var tags []model.Tag
	result := config.DB.Where("status = ?", status).Preload("Articles").Find(&tags)
	return tags, result.Error
}
