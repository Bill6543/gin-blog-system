package utils

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// Response 统一响应格式
type Response struct {
	Code int         `json:"code"`
	Data interface{} `json:"data,omitempty"`
	Msg  string      `json:"msg"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code: http.StatusOK,
		Data: data,
		Msg:  "success",
	})
}

// Error 错误响应
func Error(c *gin.Context, code int, msg string) {
	c.JSON(code, Response{
		Code: code,
		Data: nil,
		Msg:  msg,
	})
}

// Result 自定义响应
func Result(c *gin.Context, code int, data interface{}, msg string) {
	c.JSON(code, Response{
		Code: code,
		Data: data,
		Msg:  msg,
	})
}
