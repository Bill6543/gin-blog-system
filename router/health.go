package router

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// RegisterHealthRoutes 注册健康检查路由
func RegisterHealthRoutes(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"message":   "Gin Blog System is running",
			"timestamp": "2026-02-02 20:00:16",
		})
	})
}
