package router

import (
	"gin-blog-system/service"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"path/filepath"
)

// RegisterUploadRoutes 注册上传相关路由
func RegisterUploadRoutes(rg *gin.RouterGroup) {
	upload := rg.Group("/upload")
	{
		upload.POST("/image", func(c *gin.Context) {
			// 获取上传的文件
			file, err := c.FormFile("file")
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "获取上传文件失败: "+err.Error())
				return
			}

			// 验证文件
			if err := service.ValidateUploadFile(file); err != nil {
				utils.Error(c, http.StatusBadRequest, err.Error())
				return
			}

			// 保存文件
			filePath, err := service.UploadImage(file)
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "上传文件失败: "+err.Error())
				return
			}

			// 返回文件访问URL
			accessURL := filepath.Join("/static", filePath)
			response := map[string]string{
				"url":      accessURL,
				"filePath": filePath,
			}
			utils.Success(c, response)
		})

		upload.POST("/file", func(c *gin.Context) {
			// 文件上传功能（通用文件上传）
			file, err := c.FormFile("file")
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "获取上传文件失败: "+err.Error())
				return
			}

			// 验证文件
			if err := service.ValidateUploadFile(file); err != nil {
				utils.Error(c, http.StatusBadRequest, err.Error())
				return
			}

			// 保存文件
			filePath, err := service.UploadImage(file) // 使用相同的方法处理普通文件
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "上传文件失败: "+err.Error())
				return
			}

			// 返回文件访问URL
			accessURL := filepath.Join("/static", filePath)
			response := map[string]string{
				"url":      accessURL,
				"filePath": filePath,
			}
			utils.Success(c, response)
		})
	}
}
