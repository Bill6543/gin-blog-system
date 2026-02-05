package router

import (
	"gin-blog-system/middleware"
	"gin-blog-system/model"
	"gin-blog-system/service"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// RegisterCommentRoutes 注册评论相关路由
func RegisterCommentRoutes(rg *gin.RouterGroup) {
	comment := rg.Group("/comments", middleware.AuthMiddleware())
	{
		// 创建评论
		comment.POST("", func(c *gin.Context) {
			var req struct {
				Content   string `json:"content" binding:"required"`
				ArticleID uint   `json:"article_id" binding:"required"`
				ParentID  *uint  `json:"parent_id,omitempty"`
			}

			if err := c.ShouldBindJSON(&req); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			// 获取用户ID（从认证中间件设置的上下文）
			userID, exists := c.Get("user_id")
			if !exists {
				utils.Error(c, http.StatusUnauthorized, "请先登录")
				return
			}

			comment := model.Comment{
				Content:   req.Content,
				UserID:    userID.(uint),
				ArticleID: req.ArticleID,
				ParentID:  req.ParentID,
			}

			if err := service.CreateComment(&comment); err != nil {
				utils.Error(c, http.StatusInternalServerError, "创建评论失败: "+err.Error())
				return
			}

			// 创建成功后，获取完整的评论响应数据（过滤敏感字段）
			createdComment, err := service.GetCommentByID(comment.ID)
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "创建评论成功但获取完整数据失败: "+err.Error())
				return
			}
			utils.Success(c, createdComment)
		})

		// 获取文章评论列表
		comment.GET("/article/:article_id", func(c *gin.Context) {
			articleIDParam := c.Param("article_id")
			articleID, err := strconv.ParseUint(articleIDParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的文章ID")
				return
			}

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

			comments, total, err := service.GetCommentsByArticle(uint(articleID), page, pageSize)
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取评论列表失败")
				return
			}

			response := map[string]interface{}{
				"comments":  comments,
				"total":     total,
				"page":      page,
				"page_size": pageSize,
			}
			utils.Success(c, response)
		})

		// 根据ID获取单条评论
		comment.GET("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的评论ID")
				return
			}

			comment, err := service.GetCommentByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusNotFound, err.Error())
				return
			}

			utils.Success(c, comment)
		})

		// 删除评论
		comment.DELETE("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的评论ID")
				return
			}

			if err := service.DeleteComment(uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "删除评论失败: "+err.Error())
				return
			}

			utils.Success(c, "评论删除成功")
		})
	}
}
