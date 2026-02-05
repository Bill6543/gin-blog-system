package service

import (
	"errors"
	"gin-blog-system/config"
	"gin-blog-system/model"
	"gorm.io/gorm"
)

// CreateComment 创建评论
func CreateComment(comment *model.Comment) error {
	// 验证文章是否存在
	var article model.Article
	result := config.DB.First(&article, comment.ArticleID)
	if result.Error != nil {
		return errors.New("文章不存在")
	}

	// 验证父评论是否存在（如果指定了父评论）
	if comment.ParentID != nil {
		var parentComment model.Comment
		result = config.DB.First(&parentComment, *comment.ParentID)
		if result.Error != nil {
			return errors.New("父评论不存在")
		}
	}

	// 开始事务
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	result = tx.Create(comment)
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// 更新文章评论数
	updateResult := tx.Model(&model.Article{}).Where("id = ?", comment.ArticleID).
		UpdateColumn("comment_count", gorm.Expr("comment_count + ?", 1))
	if updateResult.Error != nil {
		tx.Rollback()
		return updateResult.Error
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return err
	}

	// 重新查询完整的评论数据（包含嵌套关联对象）
	var fullComment model.Comment
	result = config.DB.Preload("User").Preload("Parent").Preload("Parent.User").Preload("Article.User").Preload("Article.Category").Preload("Article.Tags").First(&fullComment, comment.ID)
	if result.Error != nil {
		return errors.New("创建评论成功但查询失败: " + result.Error.Error())
	}

	// 将完整数据复制回原对象
	*comment = fullComment
	return nil
}

// GetCommentsByArticle 获取文章评论列表（支持分页）
func GetCommentsByArticle(articleID uint, page, pageSize int) ([]model.CommentResponse, int64, error) {
	var comments []model.Comment
	var total int64

	db := config.DB.Model(&model.Comment{}).
		Where("article_id = ? AND status = ?", articleID, 1).
		Preload("User").
		Preload("Parent").
		Preload("Parent.User")

	// 计算总数
	db.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	result := db.Offset(offset).Limit(pageSize).Find(&comments)

	// 转换为响应结构
	responses := make([]model.CommentResponse, len(comments))
	for i, comment := range comments {
		responses[i] = *comment.ConvertToCommentResponse()
	}

	return responses, total, result.Error
}

// DeleteComment 删除评论（级联删除子评论）
func DeleteComment(id uint) error {
	var comment model.Comment
	result := config.DB.First(&comment, id)
	if result.Error != nil {
		return errors.New("评论不存在")
	}

	// 开始事务
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 删除子评论（递归删除）
	deleteResult := tx.Where("parent_id = ?", id).Delete(&model.Comment{})
	if deleteResult.Error != nil {
		tx.Rollback()
		return deleteResult.Error
	}

	// 删除主评论
	result = tx.Delete(&comment)
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// 更新文章评论数
	updateResult := tx.Model(&model.Article{}).Where("id = ?", comment.ArticleID).
		UpdateColumn("comment_count", gorm.Expr("comment_count - ?", 1))
	if updateResult.Error != nil {
		tx.Rollback()
		return updateResult.Error
	}

	return tx.Commit().Error
}

// GetCommentByID 根据ID获取单条评论
func GetCommentByID(id uint) (*model.CommentResponse, error) {
	var comment model.Comment
	result := config.DB.Preload("User").Preload("Parent").Preload("Parent.User").First(&comment, id)
	if result.Error != nil {
		return nil, errors.New("评论不存在")
	}
	return comment.ConvertToCommentResponse(), nil
}
