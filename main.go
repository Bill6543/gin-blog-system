package main

import (
	"gin-blog-system/config"
	"gin-blog-system/middleware"
	_ "gin-blog-system/model"
	"gin-blog-system/router"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. 加载配置（如数据库、端口等）
	if err := config.Init(); err != nil {
		panic(err)
	}

	// 2. 初始化数据库
	if err := config.InitDB(); err != nil {
		panic(err)
	}

	// 3. 初始化 Gin 引擎
	r := gin.New() // 使用 New() 而不是 Default()，以便我们可以自定义中间件
	// 添加增强版日志中间件
	r.Use(middleware.EnhancedLogger())
	// 添加恢复中间件
	r.Use(gin.Recovery())

	// 配置静态文件服务
	r.Static("/static", "./static/uploads")

	// 4. 注册路由
	router.RegisterRoutes(r)
	// 注册健康检查路由
	router.RegisterHealthRoutes(r)

	// 5. 启动服务（端口从配置读取，默认8080）
	port := config.AppConfig.App.Port
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
