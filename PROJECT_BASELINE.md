# 项目基线状态文档

## 📋 基本信息
- **创建时间**: 2026年2月10日
- **Git提交哈希**: 40535bf
- **分支**: master (基线备份在 baseline-backup 分支)
- **作者**: Bill

## 🎯 项目当前状态

### 核心功能模块
1. **用户认证系统** - JWT Token 认证
2. **文章管理** - CRUD 操作，支持分类和标签
3. **评论系统** - 文章评论功能
4. **文件上传** - 图片上传和静态资源服务
5. **前端界面** - React + TypeScript 博客前端

### 技术栈
- **后端**: Go + Gin + GORM + MySQL
- **前端**: React + TypeScript + Vite
- **数据库**: MySQL
- **部署**: 静态文件服务

## 📁 目录结构快照

```
gin-blog-system/
├── config/           # 配置文件
├── middleware/       # 中间件
├── model/           # 数据模型
├── router/          # 路由定义
├── service/         # 业务逻辑
├── utils/           # 工具函数
├── blog-frontend/   # 前端代码
├── static/          # 静态资源
├── main.go          # 主程序入口
└── README.md        # 项目文档
```

## 🔧 关键配置信息

### 数据库配置
- 连接地址: localhost:3306
- 数据库名: gin_blog
- 字符集: utf8mb4

### JWT配置
- 签名密钥: 自动随机生成
- 过期时间: 24小时

### 文件上传配置
- 最大文件大小: 10MB
- 支持格式: jpg, jpeg, png, gif
- 存储路径: ./static/

## ⚠️ 重要提醒

此文档记录了项目在2026年2月10日的完整状态。所有后续修改都应该基于此基线进行。

## 🔄 回滚方法

如果需要回滚到此基线状态，请参考 `ROLLBACK_GUIDE.md` 文件。