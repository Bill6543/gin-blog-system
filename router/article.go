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
	article := rg.Group("/articles", middleware.AuthMiddleware())
	{
		// 获取文章列表
		article.GET("", func(c *gin.Context) {
			pageStr := c.DefaultQuery("page", "1")
			pageSizeStr := c.DefaultQuery("page_size", "10")

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

		// 根据ID获取单篇文章
		article.GET("/:id", func(c *gin.Context) {
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

		// 临时结构体用于接收包含TagIDs的请求
		type ArticleRequest struct {
			Title      string `json:"title"`
			Content    string `json:"content"`
			Summary    string `json:"summary"`
			Cover      string `json:"cover"`
			Status     int    `json:"status"`
			CategoryID uint   `json:"category_id"`
			TagIDs     []uint `json:"tag_ids,omitempty"`
		}

		// 创建文章
		article.POST("", func(c *gin.Context) {
			var req ArticleRequest
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

			// 构建文章模型
			article := model.Article{
				Title:      req.Title,
				Content:    req.Content,
				Summary:    req.Summary,
				Cover:      req.Cover,
				Status:     req.Status,
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
		article.PUT("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			var req ArticleRequest
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

			// 构建文章模型
			articleData := model.Article{
				Title:      req.Title,
				Content:    req.Content,
				Summary:    req.Summary,
				Cover:      req.Cover,
				Status:     req.Status,
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
				articleData.Tags = tags
			}

			if err := service.UpdateArticle(uint(id), &articleData); err != nil {
				utils.Error(c, http.StatusInternalServerError, "更新文章失败: "+err.Error())
				return
			}

			updatedArticle, err := service.GetArticleByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取更新后的文章失败")
				return
			}

			utils.Success(c, updatedArticle)
		})

		// 删除文章
		article.DELETE("/:id", func(c *gin.Context) {
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

			utils.Success(c, nil)
		})

		// 点赞文章
		article.POST("/:id/like", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			// 获取用户ID（从中间件设置的上下文）
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
			if userLike {
				utils.Error(c, http.StatusBadRequest, "您已点赞过该文章")
				return
			}

			// 增加点赞
			if err := service.AddLike(userID.(uint), uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "点赞失败: "+err.Error())
				return
			}

			// 返回更新后的文章
			updatedArticle, err := service.GetArticleByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取文章失败")
				return
			}

			utils.Success(c, updatedArticle)
		})

		// 取消点赞
		article.DELETE("/:id/like", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

			// 获取用户ID（从中间件设置的上下文）
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
			if !userLike {
				utils.Error(c, http.StatusBadRequest, "您尚未点赞该文章")
				return
			}

			// 取消点赞
			if err := service.RemoveLike(userID.(uint), uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "取消点赞失败: "+err.Error())
				return
			}

			// 返回更新后的文章
			updatedArticle, err := service.GetArticleByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取文章失败")
				return
			}

			utils.Success(c, updatedArticle)
		})
	}
}
