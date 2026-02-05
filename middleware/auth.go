package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"strings"
	"time"

	"gin-blog-system/config"
)

// Claims JWT自定义声明
type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// AuthMiddleware 认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Authorization header required",
			})
			c.Abort()
			return
		}

		// 简化验证逻辑，实际项目中应该解析JWT token
		if !strings.HasPrefix(token, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token format",
			})
			c.Abort()
			return
		}

		// 解析JWT token并验证过期时间
		tokenString := strings.TrimPrefix(token, "Bearer ")
		claims := &Claims{}
		// 使用标准验证选项，包括过期时间验证
		tokenObj, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.AppConfig.App.JWTSecret), nil
		}, jwt.WithValidMethods([]string{"HS256"})) // 指定有效的签名方法
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token: " + err.Error(),
			})
			c.Abort()
			return
		}

		// 额外验证token是否有效
		if !tokenObj.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token is invalid or expired",
			})
			c.Abort()
			return
		}

		// 手动验证过期时间（双重保险）
		if claims.ExpiresAt != nil && claims.ExpiresAt.Before(time.Now()) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token has expired",
			})
			c.Abort()
			return
		}

		// 将用户ID存入上下文
		c.Set("user_id", claims.UserID)
		c.Next()
	}
}
