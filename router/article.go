package router

import (
	"gin-blog-system/config"
	"gin-blog-system/middleware"
	"gin-blog-system/model"
	"gin-blog-system/service"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"

	"gorm.io/gorm"
)

// RegisterArticleRoutes 注册文章相关路由
func RegisterArticleRoutes(rg *gin.RouterGroup) {

	// 公开访问的文章路由（无需认证）
	// 获取文章列表（公开）
	rg.GET("/articles", func(c *gin.Context) {
		pageStr := c.DefaultQuery("page", "1")
		pageSizeStr := c.DefaultQuery("page_size", "10")
		// 兼容前端传来的 pageSize 参数（驼峰命名）
		if pageSizeStr == "10" {
			pageSizeStr = c.DefaultQuery("pageSize", "10")
		}

		page, _ := strconv.Atoi(pageStr)
		pageSize, _ := strconv.Atoi(pageSizeStr)

		if page < 1 {
			page = 1
		}
		if pageSize < 1 || pageSize > 100 {
			pageSize = 10
		}

		articles, total, err := service.GetAllArticles(page, pageSize)
		if err != nil {
			utils.Error(c, http.StatusInternalServerError, "获取文章列表失败")
			return
		}

		response := map[string]interface{}{
			"articles":  articles,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		}
		utils.Success(c, response)
	})

	// 根据ID获取单篇文章（公开）
	rg.GET("/articles/:id", func(c *gin.Context) {
		idParam := c.Param("id")
		id, err := strconv.ParseUint(idParam, 10, 32)
		if err != nil {
			utils.Error(c, http.StatusBadRequest, "无效的文章ID")
			return
		}

		// 先增加浏览量
		updateResult := config.DB.Model(&model.Article{}).Where("id = ?", id).UpdateColumn("view_count", gorm.Expr("view_count + ?", 1))
		if updateResult.Error != nil {
			utils.Error(c, http.StatusInternalServerError, "更新浏览量失败: "+updateResult.Error.Error())
			return
		}

		article, err := service.GetArticleByID(uint(id))
		if err != nil {
			utils.Error(c, http.StatusNotFound, err.Error())
			return
		}

		utils.Success(c, article)
	})

	// 需要认证的操作
	articleAuth := rg.Group("/articles", middleware.AuthMiddleware())
	{
		// 创建文章
		articleAuth.POST("", func(c *gin.Context) {
			var req model.ArticleCreateRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			// 获取用户ID（从中间件设置的上下文）
			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			// 确保状态值有效（0-草稿，1-发布）
			status := req.Status
			if status != 0 && status != 1 {
				status = 1 // 默认发布
			}

			// 构建文章模型
			article := model.Article{
				Title:      req.Title,
				Content:    req.Content,
				Summary:    req.Summary,
				Cover:      req.Cover,
				Status:     status, // 使用验证后的状态值
				UserID:     userID.(uint),
				CategoryID: req.CategoryID,
			}

			// 如果提供了TagIDs，则加载对应的标签
			if len(req.TagIDs) > 0 {
				var tags []model.Tag
				result := config.DB.Where("id IN ?", req.TagIDs).Find(&tags)
				if result.Error != nil {
					utils.Error(c, http.StatusInternalServerError, "查询标签失败: "+result.Error.Error())
					return
				}
				article.Tags = tags
			}

			if err := service.CreateArticle(&article); err != nil {
				utils.Error(c, http.StatusInternalServerError, "创建文章失败: "+err.Error())
				return
			}

			// 创建成功后，获取完整的文章数据（包含关联的用户、分类和标签）
			createdArticle, err := service.GetArticleByID(article.ID)
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "创建文章成功但获取完整数据失败: "+err.Error())
				return
			}
			utils.Success(c, createdArticle)
		})

		// 更新文章
		articleAuth.PUT("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章 ID")
				return
			}

			var req model.ArticleUpdateRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			// 获取用户ID（从中间件设置的上下文）
			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			// 确保状态值有效（0-草稿，1-发布）
			status := req.Status
			if status != 0 && status != 1 {
				status = 1 // 默认发布
			}

			// 构建文章模型 - 只更新提供的字段
			var articleData model.Article

			// 只更新非零值的字段
			if req.Title != "" {
				articleData.Title = req.Title
			}
			if req.Content != "" {
				articleData.Content = req.Content
			}
			if req.Summary != "" {
				articleData.Summary = req.Summary
			}
			if req.Cover != "" {
				articleData.Cover = req.Cover
			}
			if req.CategoryID != 0 {
				articleData.CategoryID = req.CategoryID
			}
			articleData.Status = status // 状态总是更新（0或1）
			articleData.UserID = userID.(uint)

			// 如果提供了TagIDs，则加载对应的标签
			if len(req.TagIDs) > 0 {
				var tags []model.Tag
				result := config.DB.Where("id IN ?", req.TagIDs).Find(&tags)
				if result.Error != nil {
					utils.Error(c, http.StatusInternalServerError, "查询标签失败: "+result.Error.Error())
					return
				}
				articleData.Tags = tags
			}

			// 使用原始SQL直接更新状态，确保100%可靠
			result := config.DB.Exec("UPDATE articles SET status = ? WHERE id = ?", status, id)
			if result.Error != nil {
				utils.Error(c, http.StatusInternalServerError, "更新文章状态失败: "+result.Error.Error())
				return
			}

			// 检查是否真的更新了
			var updatedStatus int
			err = config.DB.Raw("SELECT status FROM articles WHERE id = ?", id).Scan(&updatedStatus).Error
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "检查状态更新失败: "+err.Error())
				return
			}

			// 如果状态更新成功，再处理其他字段
			if req.Title != "" || req.Content != "" || req.Summary != "" || req.Cover != "" || req.CategoryID != 0 {
				if err := service.UpdateArticle(uint(id), &articleData); err != nil {
					utils.Error(c, http.StatusInternalServerError, "更新文章其他字段失败: "+err.Error())
					return
				}
			}

			updatedArticle, err := service.GetArticleByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取更新后的文章失败")
				return
			}

			utils.Success(c, updatedArticle)
		})

		// 删除文章
		articleAuth.DELETE("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			if err := service.DeleteArticle(uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "删除文章失败: "+err.Error())
				return
			}

			utils.Success(c, map[string]string{"message": "文章删除成功"})
		})

		// 获取当前用户的文章
		articleAuth.GET("/my", func(c *gin.Context) {
			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			pageStr := c.DefaultQuery("page", "1")
			pageSizeStr := c.DefaultQuery("page_size", "10")
			// 兼容前端传来的 pageSize 参数（驼峰命名）
			if pageSizeStr == "10" {
				pageSizeStr = c.DefaultQuery("pageSize", "10")
			}

			page, _ := strconv.Atoi(pageStr)
			pageSize, _ := strconv.Atoi(pageSizeStr)

			if page < 1 {
				page = 1
			}
			if pageSize < 1 || pageSize > 100 {
				pageSize = 10
			}

			articles, total, err := service.GetArticlesByUser(userID.(uint), page, pageSize)
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取用户文章失败")
				return
			}

			response := map[string]interface{}{
				"articles":  articles,
				"total":     total,
				"page":      page,
				"page_size": pageSize,
			}
			utils.Success(c, response)
		})

		// 文章点赞功能
		articleAuth.POST("/:id/like", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			if err := service.AddLike(userID.(uint), uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "点赞失败: "+err.Error())
				return
			}

			utils.Success(c, map[string]string{"message": "点赞成功"})
		})

		// 取消文章点赞
		articleAuth.DELETE("/:id/like", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			if err := service.RemoveLike(userID.(uint), uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "取消点赞失败: "+err.Error())
				return
			}

			utils.Success(c, map[string]string{"message": "取消点赞成功"})
		})

		// 检查用户是否已点赞某文章
		articleAuth.GET("/:id/is-liked", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			// 检查用户是否已点赞过
			userLike, err := service.CheckUserLiked(userID.(uint), uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "检查点赞状态失败: "+err.Error())
				return
			}

			utils.Success(c, map[string]bool{"is_liked": userLike})
		})
	}
}
