package config

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"os"
)

// AppConfig 应用配置
type AppConf struct {
	App struct {
		Name      string `yaml:"name"`
		Port      string `yaml:"port"`
		Debug     bool   `yaml:"debug"`
		JWTSecret string `yaml:"jwt_secret"`
	} `yaml:"app"`
	Upload struct {
		MaxSize      int      `yaml:"max_size"`
		AllowedTypes []string `yaml:"allowed_types"`
		SavePath     string   `yaml:"save_path"`
	} `yaml:"upload"`
}

// DBConfig 数据库配置
type DBConf struct {
	Database struct {
		Driver       string `yaml:"driver"`
		Host         string `yaml:"host"`
		Port         string `yaml:"port"`
		Username     string `yaml:"username"`
		Password     string `yaml:"password"`
		DBName       string `yaml:"dbname"`
		Charset      string `yaml:"charset"`
		ParseTime    bool   `yaml:"parseTime"`
		Loc          string `yaml:"loc"`
		MaxIdleConns int    `yaml:"maxIdleConns"`
		MaxOpenConns int    `yaml:"maxOpenConns"`
	} `yaml:"database"`
}

// 全局配置变量
var (
	AppConfig = &AppConf{}
	DBConfig  = &DBConf{}
)

// Init 初始化配置
func Init() error {
	// 加载应用配置
	if err := loadConfig("config/app.yaml", AppConfig); err != nil {
		return fmt.Errorf("load app config failed: %w", err)
	}

	// 加载数据库配置
	if err := loadConfig("config/db.yaml", DBConfig); err != nil {
		return fmt.Errorf("load db config failed: %w", err)
	}

	return nil
}

// loadConfig 加载YAML配置文件
func loadConfig(filePath string, config interface{}) error {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("read config file %s failed: %w", filePath, err)
	}

	if err := yaml.Unmarshal(data, config); err != nil {
		return fmt.Errorf("unmarshal config file %s failed: %w", filePath, err)
	}

	return nil
}
