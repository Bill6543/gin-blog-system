package service

import (
	"errors"
	"gin-blog-system/config"
	"gin-blog-system/model"
	"gorm.io/gorm"
)

// CreateArticle 创建文章
func CreateArticle(article *model.Article) error {
	// 开始事务
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 如果封面为空，则使用默认封面
	if article.Cover == "" {
		article.Cover = "/static/uploads/default_cover.png"
	}

	// 创建文章
	result := tx.Create(article)
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// 处理标签关联（多对多）- 使用关联的Tags
	if len(article.Tags) > 0 {
		var articleTags []model.ArticleTag
		for _, tag := range article.Tags {
			// 检查关联是否已存在，避免重复插入
			var count int64
			tx.Model(&model.ArticleTag{}).Where("tag_id = ? AND article_id = ?", tag.ID, article.ID).Count(&count)
			if count == 0 {
				articleTags = append(articleTags, model.ArticleTag{
					TagID:     tag.ID,
					ArticleID: article.ID,
				})
			}
		}
		if len(articleTags) > 0 {
			result = tx.Create(&articleTags)
			if result.Error != nil {
				tx.Rollback()
				return result.Error
			}
		}
	}

	// 提交事务
	return tx.Commit().Error
}

// GetArticleByID 根据ID获取文章
func GetArticleByID(id uint) (*model.ArticleResponse, error) {
	var article model.Article
	// 正确的预加载方式：GORM会自动根据外键关系关联数据
	result := config.DB.Preload("User").Preload("Category").Preload("Tags").First(&article, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, errors.New("文章不存在")
	}
	return article.ConvertToArticleResponse(), result.Error
}

// GetAllArticles 获取所有文章
func GetAllArticles(page, pageSize int) ([]model.ArticleResponse, int64, error) {
	var articles []model.Article
	var total int64

	db := config.DB.Model(&model.Article{}).Preload("User").Preload("Category").Preload("Tags")

	// 计算总数
	db.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	result := db.Offset(offset).Limit(pageSize).Find(&articles)

	// 转换为响应结构
	responses := make([]model.ArticleResponse, len(articles))
	for i, article := range articles {
		responses[i] = *article.ConvertToArticleResponse()
	}

	return responses, total, result.Error
}

// UpdateArticle 更新文章
func UpdateArticle(id uint, articleData *model.Article) error {
	// 开始事务
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var existingArticle model.Article
	result := tx.First(&existingArticle, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return errors.New("文章不存在")
	}

	// 更新文章基本信息
	result = tx.Model(&existingArticle).Updates(articleData)
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// 处理标签关联：先删除旧的关联，再创建新的
	// 删除现有的标签关联
	deleteResult := tx.Where("article_id = ?", id).Delete(&model.ArticleTag{})
	if deleteResult.Error != nil {
		tx.Rollback()
		return deleteResult.Error
	}

	// 创建新的标签关联 - 使用更新后的文章数据中的标签
	if len(articleData.Tags) > 0 {
		var articleTags []model.ArticleTag
		for _, tag := range articleData.Tags {
			articleTags = append(articleTags, model.ArticleTag{
				ArticleID: id,
				TagID:     tag.ID,
			})
		}
		createResult := tx.Create(&articleTags)
		if createResult.Error != nil {
			tx.Rollback()
			return createResult.Error
		}
	}

	// 重新加载文章以包含最新的标签信息
	tx.Preload("Tags").First(&existingArticle, id)

	// 提交事务
	return tx.Commit().Error
}

// DeleteArticle 删除文章
func DeleteArticle(id uint) error {
	var article model.Article
	result := config.DB.First(&article, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return errors.New("文章不存在")
	}

	// 删除文章前，先删除相关的标签关联
	deleteResult := config.DB.Where("article_id = ?", id).Delete(&model.ArticleTag{})
	if deleteResult.Error != nil {
		return deleteResult.Error
	}

	// 删除文章前，先删除相关的评论
	commentDeleteResult := config.DB.Where("article_id = ?", id).Delete(&model.Comment{})
	if commentDeleteResult.Error != nil {
		return commentDeleteResult.Error
	}

	// 删除文章本身
	result = config.DB.Delete(&article)
	return result.Error
}

// GetArticlesByCategory 根据分类获取文章
func GetArticlesByCategory(categoryID uint, page, pageSize int) ([]model.Article, int64, error) {
	var articles []model.Article
	var total int64

	db := config.DB.Model(&model.Article{}).Where("category_id = ? AND status = ?", categoryID, 1).Preload("User").Preload("Category").Preload("Tags")

	// 计算总数
	db.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	result := db.Offset(offset).Limit(pageSize).Find(&articles)

	return articles, total, result.Error
}

// GetArticlesByUser 根据用户获取文章
func GetArticlesByUser(userID uint, page, pageSize int) ([]model.Article, int64, error) {
	var articles []model.Article
	var total int64

	db := config.DB.Model(&model.Article{}).Where("user_id = ? AND status = ?", userID, 1).Preload("User").Preload("Category").Preload("Tags")

	// 计算总数
	db.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	result := db.Offset(offset).Limit(pageSize).Find(&articles)

	return articles, total, result.Error
}

// AddLike 给文章点赞（增加点赞数，检查用户是否已点赞）
func AddLike(userID, articleID uint) error {
	// 开始事务
	tx := config.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 检查文章是否存在
	var article model.Article
	result := tx.First(&article, articleID)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		tx.Rollback()
		return errors.New("文章不存在")
	}
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// 检查用户是否已点赞过
	var like model.Like
	result = tx.Where("user_id = ? AND article_id = ?", userID, articleID).First(&like)
	if result.Error == nil {
		tx.Rollback()
		return errors.New("用户已点赞过该文章")
	}

	// 创建点赞记录
	like = model.Like{
		UserID:    userID,
		ArticleID: articleID,
	}
	result = tx.Create(&like)
	if result.Error != nil {
		tx.Rollback()
		return result.Error
	}

	// 增加文章点赞数
	updateResult := tx.Model(&model.Article{}).Where("id = ?", articleID).UpdateColumn("like_count", gorm.Expr("like_count + ?", 1))
	if updateResult.Error != nil {
		tx.Rollback()
		return updateResult.Error
	}

	// 提交事务
	return tx.Commit().Error
}

// RemoveLike 取消点赞（减少点赞数）
func RemoveLike(userID, articleID uint) error {
	// 删除点赞记录
	result := config.DB.Where("user_id = ? AND article_id = ?", userID, articleID).Delete(&model.Like{})
	if result.Error != nil {
		return result.Error
	}

	// 减少文章点赞数
	updateResult := config.DB.Model(&model.Article{}).Where("id = ?", articleID).UpdateColumn("like_count", gorm.Expr("like_count - ?", 1))
	return updateResult.Error
}

// CheckUserLiked 检查用户是否已点赞
func CheckUserLiked(userID, articleID uint) (bool, error) {
	var like model.Like
	result := config.DB.Where("user_id = ? AND article_id = ?", userID, articleID).First(&like)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return false, nil
		}
		return false, result.Error
	}
	return true, nil
}

// GetArticleLikeCount 获取文章点赞数
func GetArticleLikeCount(articleID uint) (int, error) {
	var article model.Article
	result := config.DB.Select("like_count").First(&article, articleID)
	if result.Error != nil {
		return 0, result.Error
	}
	return article.LikeCount, nil
}
