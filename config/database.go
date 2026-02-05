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

	// 配置连接池
	if err := configureConnectionPool(DB); err != nil {
		return fmt.Errorf("配置连接池失败: %w", err)
	}

	// 自动迁移
	err = DB.AutoMigrate(&model.Article{}, &model.User{}, &model.Category{}, &model.Tag{}, &model.ArticleTag{}, &model.Like{}, &model.Comment{})
	if err != nil {
		return err
	}

	fmt.Println("数据库连接成功!")
	return nil
}

// configureConnectionPool 配置数据库连接池
func configureConnectionPool(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("获取sql.DB失败: %w", err)
	}

	// 设置连接池参数
	sqlDB.SetMaxIdleConns(DBConfig.Database.MaxIdleConns)
	sqlDB.SetMaxOpenConns(DBConfig.Database.MaxOpenConns)

	// 解析并设置连接最大生命周期
	if DBConfig.Database.ConnMaxLifetime != "" {
		lifetime, err := time.ParseDuration(DBConfig.Database.ConnMaxLifetime)
		if err != nil {
			return fmt.Errorf("解析connMaxLifetime失败: %w", err)
		}
		sqlDB.SetConnMaxLifetime(lifetime)
	}

	// 解析并设置空闲连接最大存活时间
	if DBConfig.Database.ConnMaxIdleTime != "" {
		idleTime, err := time.ParseDuration(DBConfig.Database.ConnMaxIdleTime)
		if err != nil {
			return fmt.Errorf("解析connMaxIdleTime失败: %w", err)
		}
		sqlDB.SetConnMaxIdleTime(idleTime)
	}

	// 输出连接池配置信息
	fmt.Printf("数据库连接池配置:\n")
	fmt.Printf("  MaxIdleConns: %d\n", DBConfig.Database.MaxIdleConns)
	fmt.Printf("  MaxOpenConns: %d\n", DBConfig.Database.MaxOpenConns)
	fmt.Printf("  ConnMaxLifetime: %s\n", DBConfig.Database.ConnMaxLifetime)
	fmt.Printf("  ConnMaxIdleTime: %s\n", DBConfig.Database.ConnMaxIdleTime)

	return nil
}

// GetDBStats 获取数据库连接池统计信息
func GetDBStats() (map[string]interface{}, error) {
	if DB == nil {
		return nil, fmt.Errorf("数据库未初始化")
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return nil, fmt.Errorf("获取sql.DB失败: %w", err)
	}

	stats := sqlDB.Stats()

	return map[string]interface{}{
		"max_open_connections": stats.MaxOpenConnections,
		"open_connections":     stats.OpenConnections,
		"in_use":               stats.InUse,
		"idle":                 stats.Idle,
		"wait_count":           stats.WaitCount,
		"wait_duration":        stats.WaitDuration.String(),
		"max_idle_closed":      stats.MaxIdleClosed,
		"max_lifetime_closed":  stats.MaxLifetimeClosed,
		"max_idle_time_closed": stats.MaxIdleTimeClosed,
	}, nil
}
