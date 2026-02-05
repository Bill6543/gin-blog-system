package middleware

import (
	"gin-blog-system/config"
	"github.com/gin-gonic/gin"
	"time"
)

// DBMonitor 数据库连接池监控中间件
func DBMonitor() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 记录请求开始时间
		startTime := time.Now()

		// 处理请求
		c.Next()

		// 请求结束后获取数据库连接池状态
		stats, err := config.GetDBStats()
		if err != nil {
			// 如果获取统计信息失败，记录错误但不影响主流程
			c.Set("db_stats_error", err.Error())
			return
		}

		// 计算请求处理时间
		latency := time.Since(startTime)

		// 将数据库统计信息添加到上下文中
		c.Set("db_stats", stats)
		c.Set("request_latency", latency.String())

		// 如果连接池使用率过高，记录警告
		if openConns, ok := stats["open_connections"].(int); ok {
			if maxConns, ok := stats["max_open_connections"].(int); ok && maxConns > 0 {
				usageRate := float64(openConns) / float64(maxConns)
				if usageRate > 0.8 { // 使用率超过80%时警告
					c.Set("db_high_usage_warning", true)
					c.Set("db_usage_rate", usageRate)
				}
			}
		}

		// 如果有等待连接的情况，记录相关信息
		if waitCount, ok := stats["wait_count"].(int64); ok && waitCount > 0 {
			c.Set("db_wait_count", waitCount)
			if waitDuration, ok := stats["wait_duration"].(string); ok {
				c.Set("db_wait_duration", waitDuration)
			}
		}
	}
}
