package service

import (
	"errors"
	"gin-blog-system/config"
	"gin-blog-system/model"
	"gorm.io/gorm"
)

// CreateCategory 创建分类
func CreateCategory(category *model.Category) error {
	result := config.DB.Create(category)
	return result.Error
}

// GetCategoryByID 根据ID获取分类
func GetCategoryByID(id uint) (*model.Category, error) {
	var category model.Category
	result := config.DB.Preload("Articles").First(&category, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("分类不存在")
	}
	return &category, result.Error
}

// GetAllCategories 获取所有分类
func GetAllCategories() ([]model.Category, error) {
	var categories []model.Category
	result := config.DB.Preload("Articles").Find(&categories)
	return categories, result.Error
}

// UpdateCategory 更新分类
func UpdateCategory(id uint, categoryData *model.Category) error {
	var existingCategory model.Category
	result := config.DB.First(&existingCategory, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("分类不存在")
	}

	result = config.DB.Model(&existingCategory).Updates(categoryData)
	return result.Error
}

// DeleteCategory 删除分类
func DeleteCategory(id uint) error {
	var category model.Category
	result := config.DB.First(&category, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("分类不存在")
	}

	// 删除分类前，需要处理相关的文章（可以将文章的分类设为NULL或其他默认分类）
	result = config.DB.Model(&model.Article{}).Where("category_id = ?", id).Update("category_id", 0)
	if result.Error != nil {
		return result.Error
	}

	result = config.DB.Delete(&category)
	return result.Error
}

// GetCategoriesWithStatus 根据状态获取分类
func GetCategoriesWithStatus(status int) ([]model.Category, error) {
	var categories []model.Category
	result := config.DB.Where("status = ?", status).Preload("Articles").Find(&categories)
	return categories, result.Error
}
