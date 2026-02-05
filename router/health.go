package router

import (
	"gin-blog-system/config"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

// RegisterHealthRoutes 注册健康检查路由
func RegisterHealthRoutes(r *gin.Engine) {
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"message":   "Gin Blog System is running",
			"timestamp": time.Now().Format("2006-01-02 15:04:05"),
		})
	})

	// 数据库连接池监控
	r.GET("/health/db", func(c *gin.Context) {
		stats, err := config.GetDBStats()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Failed to get database stats",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().Format("2006-01-02 15:04:05"),
			"database":  stats,
		})
	})
}
