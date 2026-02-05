package router

import (
	"gin-blog-system/model"
	"gin-blog-system/service"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// RegisterTagsRoutes 注册标签相关路由
func RegisterTagsRoutes(rg *gin.RouterGroup) {
	tag := rg.Group("/tags")
	{
		// 获取标签列表
		tag.GET("", func(c *gin.Context) {
			tags, err := service.GetAllTags()
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取标签列表失败")
				return
			}
			utils.Success(c, tags)
		})

		// 根据ID获取单个标签
		tag.GET("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的标签ID")
				return
			}

			tag, err := service.GetTagByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusNotFound, err.Error())
				return
			}

			utils.Success(c, tag)
		})

		// 创建标签
		tag.POST("", func(c *gin.Context) {
			var tag model.Tag
			if err := c.ShouldBindJSON(&tag); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			if err := service.CreateTag(&tag); err != nil {
				utils.Error(c, http.StatusInternalServerError, "创建标签失败: "+err.Error())
				return
			}

			utils.Success(c, tag)
		})

		// 更新标签
		tag.PUT("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的标签ID")
				return
			}

			var tagData model.Tag
			if err := c.ShouldBindJSON(&tagData); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			if err := service.UpdateTag(uint(id), &tagData); err != nil {
				utils.Error(c, http.StatusInternalServerError, "更新标签失败: "+err.Error())
				return
			}

			updatedTag, err := service.GetTagByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取更新后的标签失败")
				return
			}

			utils.Success(c, updatedTag)
		})

		// 删除标签
		tag.DELETE("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的标签ID")
				return
			}

			if err := service.DeleteTag(uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "删除标签失败: "+err.Error())
				return
			}

			utils.Success(c, nil)
		})
	}
}
