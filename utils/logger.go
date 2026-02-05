package utils

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// LogFile 日志文件管理器
type LogFile struct {
	file           *os.File
	path           string
	size           int64
	maxSize        int64 // 最大文件大小，单位字节
	mutex          sync.Mutex
	lastRotateDate string // 上次轮转的日期
}

// NewLogFile 创建新的日志文件管理器
func NewLogFile(path string, maxSize int64) (*LogFile, error) {
	if maxSize <= 0 {
		maxSize = 100 << 20 // 默认100MB
	}

	// 确保目录存在
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return nil, err
	}

	// 打开或创建日志文件
	file, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return nil, err
	}

	// 获取当前文件大小
	info, err := file.Stat()
	if err != nil {
		return nil, err
	}

	// 获取当前日期作为初始轮转日期
	currentTime := time.Now()
	currentDate := currentTime.Format("2006-01-02")

	lf := &LogFile{
		file:           file,
		path:           path,
		size:           info.Size(),
		maxSize:        maxSize,
		lastRotateDate: currentDate,
	}

	return lf, nil
}

// Write 写入日志内容
func (lf *LogFile) Write(p []byte) (n int, err error) {
	lf.mutex.Lock()
	defer lf.mutex.Unlock()

	// 检查是否需要按日期轮转
	if err := lf.rotateByDate(); err != nil {
		return 0, err
	}

	// 检查是否需要按大小轮转
	if lf.size+int64(len(p)) > lf.maxSize {
		if err := lf.rotate(); err != nil {
			return 0, err
		}
	}

	n, err = lf.file.Write(p)
	if err == nil {
		lf.size += int64(n)
	}
	return n, err
}

// rotateByDate 按日期轮转日志文件
func (lf *LogFile) rotateByDate() error {
	currentTime := time.Now()
	currentDate := currentTime.Format("2006-01-02")

	// 检查是否是新一天
	if currentDate == lf.lastRotateDate {
		// 如果还是同一天，无需轮转
		return nil
	}

	// 更新最后轮转日期
	lf.lastRotateDate = currentDate

	// 关闭当前文件
	if err := lf.file.Close(); err != nil {
		return err
	}

	// 生成新文件路径，包含日期
	newPath := fmt.Sprintf("%s.%s", lf.path, currentDate)

	// 打开新文件
	file, err := os.OpenFile(newPath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		// 如果打开新文件失败，尝试重新打开原文件
		origFile, err2 := os.OpenFile(lf.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err2 != nil {
			// 如果原文件也无法打开，返回原始错误
			return err
		}
		lf.file = origFile
		info, _ := origFile.Stat()
		lf.size = info.Size()
		return err
	}

	lf.file = file
	lf.size = 0
	return nil
}

// rotate 轮转日志文件
func (lf *LogFile) rotate() error {
	// 关闭当前文件
	if err := lf.file.Close(); err != nil {
		return err
	}

	// 重命名当前文件
	timestamp := time.Now().Format("20060102_150405")
	newPath := fmt.Sprintf("%s.%s", lf.path, timestamp)
	if err := os.Rename(lf.path, newPath); err != nil {
		// 如果重命名失败，尝试重新打开原文件
		file, err2 := os.OpenFile(lf.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err2 != nil {
			// 如果重命名和重新打开都失败，返回原始错误
			return err
		}
		lf.file = file
		info, _ := file.Stat()
		lf.size = info.Size()
		return err
	}

	// 创建新文件
	file, err := os.OpenFile(lf.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return err
	}

	lf.file = file
	lf.size = 0
	return nil
}

// Close 关闭日志文件
func (lf *LogFile) Close() error {
	lf.mutex.Lock()
	defer lf.mutex.Unlock()
	return lf.file.Close()
}

// JSONLogWriter JSON格式日志写入器
type JSONLogWriter struct {
	logFile *LogFile
}

// NewJSONLogWriter 创建JSON格式日志写入器
func NewJSONLogWriter(logFile *LogFile) *JSONLogWriter {
	return &JSONLogWriter{
		logFile: logFile,
	}
}

// WriteJSON 写入JSON格式日志
func (jw *JSONLogWriter) WriteJSON(v interface{}) error {
	jsonBytes, err := json.Marshal(v)
	if err != nil {
		return err
	}

	// 添加换行符
	jsonBytes = append(jsonBytes, '\n')

	_, err = jw.logFile.Write(jsonBytes)
	return err
}
