package router

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes 注册所有路由
func RegisterRoutes(r *gin.Engine) {
	// 注册API路由组
	api := r.Group("/api")
	{
		// API根路径
		api.GET("", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "Welcome to Gin Blog System API",
				"version": "1.0.0",
				"endpoints": map[string]string{
					"auth":       "/api/auth",
					"articles":   "/api/articles",
					"categories": "/api/categories",
					"tags":       "/api/tags",
					"upload":     "/api/upload",
				},
			})
		})
		api.POST("", func(c *gin.Context) {
			c.JSON(405, gin.H{
				"error":   "Method Not Allowed",
				"message": "POST method is not allowed on the API root path. Please use specific endpoints like /api/auth/register",
				"available_endpoints": map[string]string{
					"auth":       "/api/auth",
					"articles":   "/api/articles",
					"categories": "/api/categories",
					"upload":     "/api/upload",
				},
			})
		})

		RegisterAuthRoutes(api)
		RegisterArticleRoutes(api)
		RegisterCategoryRoutes(api)
		RegisterTagsRoutes(api)
		RegisterUploadRoutes(api)
		RegisterCommentRoutes(api)
	}
}
