# Gin Blog System

基于 Go 和 Gin 框架构建的博客系统。

## 功能特性

- 文章管理（创建、编辑、删除、发布）
- 用户认证（注册、登录、JWT令牌）
- 分类管理
- 文件上传（图片等）
- RESTful API 设计

## 技术栈

- Go 语言
- Gin Web 框架
- GORM ORM
- MySQL 数据库
- JWT 认证
- YAML 配置

## 快速开始

### 环境准备

1. 安装 Go 1.20+
2. 安装 MySQL 数据库

### 配置

1. 修改 `config/db.yaml` 配置数据库连接信息
2. 修改 `config/app.yaml` 配置应用设置

### 运行

```bash
# 下载依赖
go mod tidy

# 运行项目
go run main.go
```

项目将在 `http://localhost:8080` 启动。

## API 接口

### 认证接口

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出

### 文章接口

- `GET /api/v1/articles` - 获取文章列表
- `GET /api/v1/articles/:id` - 获取文章详情
- `POST /api/v1/articles` - 创建文章
- `PUT /api/v1/articles/:id` - 更新文章
- `DELETE /api/v1/articles/:id` - 删除文章

### 分类接口

- `GET /api/v1/categories` - 获取分类列表
- `GET /api/v1/categories/:id` - 获取分类详情
- `POST /api/v1/categories` - 创建分类
- `PUT /api/v1/categories/:id` - 更新分类
- `DELETE /api/v1/categories/:id` - 删除分类

### 上传接口

- `POST /api/v1/upload/image` - 上传图片
- `POST /api/v1/upload/file` - 上传文件

## 项目结构

```
gin-blog-system/
├── config/           # 配置文件
├── middleware/       # 中间件
├── model/            # 数据模型
├── router/           # 路由定义
├── service/          # 业务逻辑
├── utils/            # 工具函数
├── main.go           # 主程序入口
└── README.md
```