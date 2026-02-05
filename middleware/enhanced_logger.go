package middleware

import (
	"fmt"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"os"
	"path/filepath"
	"time"
)

// LogLevel 日志级别
type LogLevel int

const (
	DEBUG LogLevel = iota
	INFO
	WARNING
	ERROR
)

// String 返回日志级别的字符串表示
func (level LogLevel) String() string {
	switch level {
	case DEBUG:
		return "DEBUG"
	case INFO:
		return "INFO"
	case WARNING:
		return "WARNING"
	case ERROR:
		return "ERROR"
	default:
		return "UNKNOWN"
	}
}

// LogEntry 日志条目结构
type LogEntry struct {
	Timestamp    utils.CustomTime `json:"timestamp"`
	Level        LogLevel         `json:"level"`
	Method       string           `json:"method"`
	URL          string           `json:"url"`
	ClientIP     string           `json:"client_ip"`
	UserAgent    string           `json:"user_agent"`
	ResponseTime string           `json:"response_time"`
	StatusCode   int              `json:"status_code"`
	Message      string           `json:"message"`
	Error        string           `json:"error,omitempty"`
}

// EnhancedLogger 增强版日志中间件
func EnhancedLogger() gin.HandlerFunc {
	// 确保日志目录存在
	logDir := "logs"
	if err := os.MkdirAll(logDir, os.ModePerm); err != nil {
		fmt.Printf("创建日志目录失败: %v\n", err)
	}

	// 创建日志文件，使用当前日期作为文件名的一部分
	currentDate := time.Now().Format("2006-01-02")
	logFilePath := filepath.Join(logDir, fmt.Sprintf("app-%s.log", currentDate))
	logFile, err := utils.NewLogFile(logFilePath, 100<<20) // 100MB最大文件大小
	if err != nil {
		fmt.Printf("创建日志文件失败: %v\n", err)
		// 回退到控制台
		return func(c *gin.Context) {
			c.Next()
			fmt.Printf("Request: %s %s, Status: %d\n", c.Request.Method, c.Request.RequestURI, c.Writer.Status())
		}
	}
	jsonWriter := utils.NewJSONLogWriter(logFile)

	return func(c *gin.Context) {
		// 开始时间
		startTime := time.Now()

		// 处理请求
		c.Next()

		// 结束时间
		endTime := time.Now()
		latencyTime := endTime.Sub(startTime)

		// 请求信息
		method := c.Request.Method
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		reqURL := c.Request.RequestURI
		userAgent := c.Request.UserAgent()

		// 确定日志级别
		level := INFO
		if statusCode >= 400 && statusCode < 500 {
			level = WARNING
		} else if statusCode >= 500 {
			level = ERROR
		}

		// 错误消息
		errorMessage := ""
		if len(c.Errors) > 0 {
			errorMessage = c.Errors.String()
		}

		// 创建日志条目
		logEntry := LogEntry{
			Timestamp:    utils.CustomTime{Time: endTime},
			Level:        level,
			Method:       method,
			URL:          reqURL,
			ClientIP:     clientIP,
			UserAgent:    userAgent,
			ResponseTime: latencyTime.String(),
			StatusCode:   statusCode,
			Message:      fmt.Sprintf("Request processed: %s %s", method, reqURL),
			Error:        errorMessage,
		}

		// 写入JSON格式的日志到文件
		err = jsonWriter.WriteJSON(logEntry)
		if err != nil {
			fmt.Printf("写入日志失败: %v\n", err)
		}

		// 同时输出到控制台（可选）
		consoleOutput := fmt.Sprintf("[%s] [%s] %s | %13v | %3d | %-7s %s\n",
			endTime.Format("2006-01-02 15:04:05"),
			level.String(),
			clientIP,
			latencyTime,
			statusCode,
			method,
			reqURL,
		)
		fmt.Print(consoleOutput)

		// 对于错误日志，同时输出到控制台
		if level >= WARNING {
			fmt.Fprintf(os.Stderr, "[ERROR] %s\n", errorMessage)
		}
	}
}
