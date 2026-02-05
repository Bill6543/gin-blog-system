package utils

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

// SaveUploadFile 保存上传的文件
func SaveUploadFile(file *multipart.FileHeader, destPath string) error {
	// 检查目标路径是否存在，不存在则创建
	if err := os.MkdirAll(destPath, os.ModePerm); err != nil {
		return err
	}

	// 获取文件扩展名
	ext := filepath.Ext(file.Filename)
	filename := strings.TrimSuffix(file.Filename, ext)
	// 确保文件名安全
	safeFilename := sanitizeFileName(filename)
	finalFilename := fmt.Sprintf("%s%s", safeFilename, ext)
	dest := filepath.Join(destPath, finalFilename)

	// 保存文件
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}

// SaveUploadFileWithFilename 保存上传的文件，使用指定的文件名
func SaveUploadFileWithFilename(file *multipart.FileHeader, destPath string, filename string) error {
	// 检查目标路径是否存在，不存在则创建
	if err := os.MkdirAll(destPath, os.ModePerm); err != nil {
		return err
	}

	// 确保文件名安全
	safeFilename := sanitizeFileName(filename)
	dest := filepath.Join(destPath, safeFilename)

	// 保存文件
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}

// sanitizeFileName 清理文件名，移除不安全字符
func sanitizeFileName(name string) string {
	// 移除路径分隔符和其他不安全字符
	name = strings.ReplaceAll(name, "/", "_")
	name = strings.ReplaceAll(name, "\\", "_")
	name = strings.ReplaceAll(name, "..", "")
	return name
}

// IsAllowedFileType 检查文件类型是否被允许
func IsAllowedFileType(fileType string, allowedTypes []string) bool {
	for _, allowedType := range allowedTypes {
		if strings.EqualFold(fileType, allowedType) {
			return true
		}
	}
	return false
}

// GetFileSize 获取文件大小
func GetFileSize(filePath string) (int64, error) {
	info, err := os.Stat(filePath)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}
