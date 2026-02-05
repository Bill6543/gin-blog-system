package router

import (
	"gin-blog-system/model"
	"gin-blog-system/service"
	"gin-blog-system/utils"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// RegisterCategoryRoutes 注册分类相关路由
func RegisterCategoryRoutes(rg *gin.RouterGroup) {
	category := rg.Group("/categories")
	{
		category.GET("", func(c *gin.Context) {
			categories, err := service.GetAllCategories()
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取分类列表失败")
				return
			}
			utils.Success(c, categories)
		})

		category.GET("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的分类ID")
				return
			}

			category, err := service.GetCategoryByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusNotFound, err.Error())
				return
			}

			utils.Success(c, category)
		})

		category.POST("", func(c *gin.Context) {
			var category model.Category
			if err := c.ShouldBindJSON(&category); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			if err := service.CreateCategory(&category); err != nil {
				utils.Error(c, http.StatusInternalServerError, "创建分类失败: "+err.Error())
				return
			}

			utils.Success(c, category)
		})

		category.PUT("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的分类ID")
				return
			}

			var categoryData model.Category
			if err := c.ShouldBindJSON(&categoryData); err != nil {
				utils.Error(c, http.StatusBadRequest, "参数绑定失败: "+err.Error())
				return
			}

			if err := service.UpdateCategory(uint(id), &categoryData); err != nil {
				utils.Error(c, http.StatusInternalServerError, "更新分类失败: "+err.Error())
				return
			}

			updatedCategory, err := service.GetCategoryByID(uint(id))
			if err != nil {
				utils.Error(c, http.StatusInternalServerError, "获取更新后的分类失败")
				return
			}

			utils.Success(c, updatedCategory)
		})

		category.DELETE("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := strconv.ParseUint(idParam, 10, 32)
			if err != nil {
				utils.Error(c, http.StatusBadRequest, "无效的分类ID")
				return
			}

			if err := service.DeleteCategory(uint(id)); err != nil {
				utils.Error(c, http.StatusInternalServerError, "删除分类失败: "+err.Error())
				return
			}

			utils.Success(c, nil)
		})
	}
}
