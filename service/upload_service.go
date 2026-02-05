package service

import (
	"fmt"
	"gin-blog-system/config"
	"gin-blog-system/utils"
	"math/rand"
	"mime/multipart"
	"path/filepath"
	"time"
)

// UploadImage 上传图片
func UploadImage(fileHeader *multipart.FileHeader) (string, error) {
	// 检查文件类型
	fileType := fileHeader.Header.Get("Content-Type")
	allowedTypes := config.AppConfig.Upload.AllowedTypes
	if !utils.IsAllowedFileType(fileType, allowedTypes) {
		return "", fmt.Errorf("不允许的文件类型: %s", fileType)
	}

	// 检查文件大小
	if int(fileHeader.Size) > config.AppConfig.Upload.MaxSize {
		return "", fmt.Errorf("文件大小超出限制: %d bytes", fileHeader.Size)
	}

	// 生成唯一文件名
	extension := filepath.Ext(fileHeader.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().Unix(), generateRandomString(8), extension)
	relativePath := filepath.Join("uploads", time.Now().Format("2006/01/02")) // 按日期组织文件

	// 构建完整路径
	fullPath := filepath.Join(config.AppConfig.Upload.SavePath, relativePath)

	// 保存文件
	if err := utils.SaveUploadFileWithFilename(fileHeader, fullPath, filename); err != nil {
		return "", fmt.Errorf("保存文件失败: %v", err)
	}

	// 返回相对URL路径
	return filepath.Join(relativePath, filename), nil
}

// generateRandomString 生成随机字符串
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

// ValidateUploadFile 验证上传文件
func ValidateUploadFile(fileHeader *multipart.FileHeader) error {
	// 检查文件类型
	fileType := fileHeader.Header.Get("Content-Type")
	allowedTypes := config.AppConfig.Upload.AllowedTypes
	if !utils.IsAllowedFileType(fileType, allowedTypes) {
		return fmt.Errorf("不允许的文件类型: %s", fileType)
	}

	// 检查文件大小
	if int(fileHeader.Size) > config.AppConfig.Upload.MaxSize {
		return fmt.Errorf("文件大小超出限制: %d bytes", fileHeader.Size)
	}

	return nil
}
