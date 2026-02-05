package config

import (
	"fmt"
	"gin-blog-system/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
	"time"
)

var DB *gorm.DB

// InitDB 初始化数据库连接
func InitDB() error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=%t&loc=%s",
		DBConfig.Database.Username,
		DBConfig.Database.Password,
		DBConfig.Database.Host,
		DBConfig.Database.Port,
		DBConfig.Database.DBName,
		DBConfig.Database.Charset,
		DBConfig.Database.ParseTime,
		DBConfig.Database.Loc,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			logger.Config{
				SlowThreshold:             200 * time.Millisecond,
				LogLevel:                  logger.Info,
				IgnoreRecordNotFoundError: true,
				Colorful:                  true,
			},
		),
	})

	if err != nil {
		fmt.Printf("数据库连接失败: %v\n", err)
		fmt.Println("请确保已启动MySQL服务，并且数据库配置正确")
		fmt.Printf("尝试连接的DSN: %s\n", dsn)
		return err
	}

	// 自动迁移
	err = DB.AutoMigrate(&model.Article{}, &model.User{}, &model.Category{}, &model.Tag{}, &model.ArticleTag{}, &model.Like{}, &model.Comment{})
	if err != nil {
		return err
	}

	fmt.Println("数据库连接成功!")
	return nil
}
