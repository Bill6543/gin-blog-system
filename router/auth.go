package router

import (
	"gin-blog-system/model"
	"gin-blog-system/service"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"net/http"
)

// RegisterAuthRoutes 注册认证相关路由
func RegisterAuthRoutes(rg *gin.RouterGroup) {
	// 测试路由：直接在/api下添加登录路由（临时）
	rg.POST("/test-login", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "test login success"})
	})

	auth := rg.Group("/auth")
	{
		auth.OPTIONS("/login", func(c *gin.Context) {
			c.Header("Access-Control-Allow-Origin", "*")
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Status(200)
		})

		auth.POST("/login", func(c *gin.Context) {
			var loginInfo struct {
				Username string `json:"username" binding:"required"`
				Password string `json:"password" binding:"required"`
			}

			if err := c.ShouldBindJSON(&loginInfo); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			user, err := service.AuthenticateUser(loginInfo.Username, loginInfo.Password)
			if err != nil {
				utils.Error(c, http.StatusUnauthorized, err.Error())
				return
			}

			token, err := service.GenerateToken(user)
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "生成令牌失败: "+err.Error())
				return
			}

			response := map[string]interface{}{
				"user":  user,
				"token": token,
			}
			utils.Success(c, response)
		})

		auth.POST("/register", func(c *gin.Context) {
			var user model.User
			if err := c.ShouldBindJSON(&user); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			if err := service.CreateUser(&user); err != nil {
				utils.Error(c, http.StatusInternalServerError, err.Error())
				return
			}

			// 不返回密码
			user.Password = ""
			utils.Success(c, user)
		})

		auth.POST("/logout", func(c *gin.Context) {
			// JWT是无状态的，服务器端不需要特殊处理登出
			// 前端只需要删除本地存储的token即可
			utils.Success(c, "登出成功")
		})
	}
}
