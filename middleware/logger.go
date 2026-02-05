package middleware

import (
	"github.com/gin-gonic/gin"
	"time"
)

// LoggerToFile 日志中间件
func LoggerToFile() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 开始时间
		startTime := time.Now()

		// 处理请求
		c.Next()

		// 结束时间
		endTime := time.Now()

		// 执行时间
		latencyTime := endTime.Sub(startTime)

		// 请求信息
		method := c.Request.Method
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		reqURL := c.Request.RequestURI

		// 输出日志
		c.Set("startTime", startTime.Format("2006-01-02 15:04:05"))
		c.Set("latency", latencyTime.String())
		c.Set("method", method)
		c.Set("status", statusCode)
		c.Set("ip", clientIP)
		c.Set("url", reqURL)

		// 打印日志
		if statusCode >= 400 {
			// 错误请求记录更详细的日志
			_ = c.Errors.ByType(gin.ErrorTypePrivate).String()
		}

		// 在控制台输出日志（生产环境中可能需要写入文件）
		println("[GIN]", startTime.Format("2006/01/02 - 15:04:05"), "|", latencyTime.String(), "|", statusCode, "|", clientIP, "|", method, "|", reqURL)
	}
}
