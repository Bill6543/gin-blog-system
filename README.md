# Gin Blog System

基于 Go 和 Gin 框架构建的现代化博客系统，采用分层架构设计，具备完整的博客核心功能。

## 🌟 项目特色

- **现代化架构**：采用标准的 MVC 分层架构，代码结构清晰
- **RESTful API**：遵循 REST 设计原则，提供完整的 HTTP API 接口
- **安全认证**：基于 JWT 的用户身份认证机制
- **数据持久化**：使用 GORM ORM 框架，支持 MySQL 数据库
- **智能日志**：多级日志系统，支持文件和控制台输出
- **灵活配置**：YAML 配置文件，支持环境差异化配置
- **文件管理**：完善的文件上传和静态资源服务
- **完整功能**：涵盖博客系统的全部核心功能模块
- **数据库监控**：实时监控数据库连接池状态
- **跨域支持**：完善的 CORS 配置支持前后端分离
- **前后端分离**：内置 React 前端管理界面

## 🔧 技术栈

### 核心框架
- **Go 1.20+** - 现代化编程语言
- **Gin v1.9+** - 高性能 HTTP Web 框架
- **GORM v1.25+** - 强大的 ORM 数据库工具

### 数据存储
- **MySQL 8.0+** - 关系型数据库
- **YAML** - 配置文件格式

### 安全认证
- **JWT (JSON Web Token)** - 无状态认证机制
- **bcrypt** - 密码哈希加密

### 工具库
- **Viper** - 配置管理（通过 YAML）
- **gorm.io/driver/mysql** - MySQL 驱动
- **github.com/golang-jwt/jwt/v5** - JWT 处理
- **github.com/gin-contrib/cors** - CORS 跨域支持
- **github.com/spf13/viper** - 配置文件管理

## 🚀 快速开始

### 环境要求
- Go 1.20+
- MySQL 8.0+

### 项目初始化
```bash
go mod tidy
mkdir -p logs static/uploads config
```

### 配置文件
创建 `config/app.yaml` 和 `config/db.yaml` 配置文件

### 启动项目
```bash
go run main.go
```
项目在 `http://localhost:8080` 运行

### 启动前端
```bash
cd blog-frontend
npm install
npm run dev
```
前端在 `http://localhost:3000` 运行

## 📁 项目结构

```
gin-blog-system/
├── config/           # 配置文件
│   ├── config.go     # 应用配置加载
│   └── database.go   # 数据库连接配置
├── middleware/       # 中间件
│   ├── auth.go       # JWT 认证中间件
│   ├── logger.go     # 基础日志中间件
│   └── enhanced_logger.go # 增强版日志中间件
├── model/            # 数据模型
│   ├── article.go    # 文章模型
│   ├── user.go       # 用户模型
│   ├── category.go   # 分类模型
│   ├── tag.go        # 标签模型
│   ├── comment.go    # 评论模型
│   ├── like.go       # 点赞模型
│   ├── article_tag.go # 文章标签关联模型
│   └── response.go   # API 响应模型
├── router/           # 路由定义
│   ├── routes.go     # 路由注册中心
│   ├── auth.go       # 认证路由
│   ├── article.go    # 文章路由
│   ├── category.go   # 分类路由
│   ├── tag.go        # 标签路由
│   ├── comment.go    # 评论路由
│   ├── upload.go     # 上传路由
│   └── health.go     # 健康检查路由
├── service/          # 业务逻辑层
│   ├── auth_service.go    # 认证服务
│   ├── article_service.go # 文章服务
│   ├── category_service.go # 分类服务
│   ├── tag_service.go     # 标签服务
│   ├── comment_service.go # 评论服务
│   └── upload_service.go  # 上传服务
├── utils/            # 工具函数
│   ├── logger.go     # 日志工具
│   ├── response.go   # 响应工具
│   ├── file.go       # 文件处理工具
│   └── time_format.go # 时间格式化工具
├── static/           # 静态资源
│   └── uploads/      # 上传文件目录
├── logs/             # 日志文件目录
├── blog-frontend/    # 前端React项目
│   ├── src/          # 前端源码
│   ├── public/       # 公共资源
│   └── package.json  # 前端依赖配置
├── main.go           # 主程序入口
└── README.md         # 项目文档
```

## 🔄 核心功能模块

### 用户系统
- 用户注册与登录
- JWT Token 认证
- 密码加密存储
- 用户信息管理

### 文章管理
- 文章创建、编辑、删除
- 文章分类管理
- 文章标签系统
- 文章浏览量统计
- 文章点赞功能
- 文章评论系统

### 内容组织
- 分类管理（Category）
- 标签管理（Tag）
- 多对多关联关系

### 文件服务
- 图片上传
- 文件类型验证
- 文件大小限制
- 静态资源服务

## 🔐 API 接口文档

### 健康检查
- `GET /health` - 服务健康状态检查

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 文章接口
- `GET /api/articles` - 获取文章列表（需认证）
- `GET /api/articles/:id` - 获取文章详情（需认证）
- `POST /api/articles` - 创建文章（需认证）
- `PUT /api/articles/:id` - 更新文章（需认证）
- `DELETE /api/articles/:id` - 删除文章（需认证）
- `POST /api/articles/:id/like` - 文章点赞（需认证）
- `DELETE /api/articles/:id/like` - 取消点赞（需认证）

### 分类接口
- `GET /api/categories` - 获取分类列表
- `GET /api/categories/:id` - 获取分类详情
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 标签接口
- `GET /api/tags` - 获取标签列表
- `GET /api/tags/:id` - 获取标签详情
- `POST /api/tags` - 创建标签
- `PUT /api/tags/:id` - 更新标签
- `DELETE /api/tags/:id` - 删除标签

### 评论接口
- `POST /api/comments` - 创建评论（需认证）
- `GET /api/comments/article/:article_id` - 获取文章评论列表（需认证）
- `GET /api/comments/:id` - 获取评论详情（需认证）
- `DELETE /api/comments/:id` - 删除评论（需认证）

### 上传接口
- `POST /api/upload/image` - 上传图片
- `POST /api/upload/file` - 上传文件

## ⚙️ 配置说明

### 应用配置 (app.yaml)
```yaml
app:
  name: "Gin Blog System"
  port: "8080"
  debug: true
  jwt_secret: "your-jwt-secret-key"

upload:
  max_size: 10485760  # 10MB
  allowed_types:
    - "image/jpeg"
    - "image/png"
    - "image/gif"
  save_path: "./static/uploads"
```

### 数据库配置 (db.yaml)
```yaml
database:
  driver: "mysql"
  host: "localhost"
  port: "3306"
  username: "your_username"
  password: "your_password"
  dbname: "blog_system"
  charset: "utf8mb4"
  parseTime: true
  loc: "Asia/Shanghai"
  # 连接池配置
  maxIdleConns: 20        # 空闲连接数
  maxOpenConns: 100       # 最大打开连接数
  connMaxLifetime: "5m"   # 连接最大生命周期
  connMaxIdleTime: "10m"  # 空闲连接最大存活时间
```

## 🛠️ 开发指南

### 代码规范
- 遵循 Go 语言官方编码规范
- 使用驼峰命名法
- 接口和结构体添加详细注释
- 错误处理要完整且明确

### 数据库管理

#### 自动迁移
项目使用 GORM AutoMigrate 自动管理数据库结构：
- **users**（用户表）- 存储用户基本信息和认证数据
- **articles**（文章表）- 存储博客文章内容和元数据
- **categories**（分类表）- 文章分类管理体系
- **tags**（标签表）- 文章标签系统
- **article_tags**（文章标签关联表）- 多对多关系表
- **likes**（点赞表）- 用户点赞记录
- **comments**（评论表）- 文章评论系统

#### 表结构特点
- 所有表都包含 `created_at` 和 `updated_at` 时间戳字段
- 使用软删除机制（`deleted_at` 字段）
- 主键统一使用 `uint` 类型的自增ID
- 外键关系通过 GORM 标签自动维护

#### 数据库初始化流程
1. 应用启动时自动检查并创建表结构
2. 如果表已存在则只同步字段变更
3. 不会删除现有数据，保证数据安全性
4. 支持字段添加和修改，不支持字段删除

### 数据库连接池监控

项目提供完善的数据库连接池监控功能：

#### 监控特性
- **实时监控**：每个请求都会收集数据库连接池状态
- **性能指标**：记录请求处理时间和数据库延迟
- **预警机制**：连接池使用率超过80%时自动告警
- **等待队列监控**：跟踪连接等待情况

#### 监控数据
- 当前打开连接数
- 正在使用连接数
- 空闲连接数
- 等待连接的请求数
- 连接使用率
- 请求处理耗时

### 日志系统
- **多级日志**：支持 INFO、WARNING、ERROR 三级日志
- **自动轮转**：按日期自动轮转日志文件
- **多种格式**：支持 JSON 和文本格式日志
- **实时输出**：控制台实时显示日志信息
- **增强功能**：记录请求IP、User-Agent、处理时间等详细信息

### 跨域支持 (CORS)
- 支持多个开发端口（3000-3007）
- 允许常见HTTP方法（GET、POST、PUT、DELETE）
- 支持认证凭据传输
- 配置12小时预检缓存

### 错误处理
- **统一格式**：标准化的错误响应结构
- **详细记录**：完整的错误信息和堆栈跟踪
- **状态码规范**：遵循HTTP状态码最佳实践
- **用户友好**：面向用户的错误提示信息

## 📊 数据模型关系

```mermaid
erDiagram
    users ||--o{ articles : writes
    users ||--o{ comments : writes
    users ||--o{ likes : gives
    articles ||--o{ comments : has
    articles ||--o{ likes : receives
    articles ||--|| categories : belongs_to
    articles }|--{ tags : tagged_with
    comments ||--o{ comments : replies_to
    
    users {
        uint id PK
        string username UK
        string email UK
        string password
        string avatar
        int status
    }
    
    articles {
        uint id PK
        string title
        text content
        text summary
        string cover
        int status
        int view_count
        int like_count
        int comment_count
        uint user_id FK
        uint category_id FK
    }
    
    categories {
        uint id PK
        string name
        text description
        int status
    }
    
    tags {
        uint id PK
        string name
        string color
        int status
    }
```

## 🔒 安全特性

- JWT Token 认证机制
- 密码 bcrypt 加密存储
- SQL 注入防护（GORM ORM）
- XSS 攻击防护
- 文件上传安全验证
- 请求频率限制（可扩展）

## 🖥️ 前端管理界面

项目内置了基于 React 的现代化管理界面：

### 主要功能页面
- **文章管理**：创建、编辑、删除文章
- **分类管理**：管理文章分类
- **标签管理**：管理系统标签
- **用户认证**：登录、注册功能
- **仪表板**：系统状态概览

### 技术特点
- **现代化UI**：使用React + TypeScript构建
- **响应式设计**：适配不同屏幕尺寸
- **组件化架构**：高内聚低耦合的组件设计
- **类型安全**：完整的TypeScript类型定义
- **状态管理**：合理的状态管理和数据流

## 📊 数据库连接池监控

系统提供完善的数据库连接池监控功能：

### 监控接口
- `GET /health` - 服务健康状态检查
- `GET /health/db` - 获取数据库连接池详细统计信息

### 监控指标
```json
{
  "status": "healthy",
  "timestamp": "2026-02-05 15:30:45",
  "database": {
    "max_open_connections": 100,
    "open_connections": 15,
    "in_use": 3,
    "idle": 12,
    "wait_count": 0,
    "wait_duration": "0s",
    "max_idle_closed": 5,
    "max_lifetime_closed": 2,
    "max_idle_time_closed": 1
  }
}
```

### 关键指标说明
- **max_open_connections**: 最大允许打开连接数
- **open_connections**: 当前打开的连接数
- **in_use**: 正在使用的连接数
- **idle**: 空闲连接数
- **wait_count**: 等待连接的请求数
- **wait_duration**: 等待总时长
- **max_idle_closed**: 因空闲而关闭的连接数
- **max_lifetime_closed**: 因超时而关闭的连接数
- **max_idle_time_closed**: 因空闲超时而关闭的连接数

### 自动告警机制
系统会在以下情况自动标记警告：
- 连接池使用率超过80%
- 出现连接等待情况
- 数据库统计信息获取失败

## 🚀 部署建议

### 生产环境配置
1. 设置 `debug: false`
2. 使用强密码的 JWT Secret
3. 配置 HTTPS 证书
4. 设置合适的数据库连接池参数
5. 配置反向代理（Nginx/Apache）

### 性能优化
- **数据库连接池优化**：智能配置空闲连接、最大连接数和连接生命周期
- **实时监控**：提供 `/health/db` 接口监控连接池状态
- **请求日志**：记录每个请求的处理时间和资源消耗
- **连接复用**：高效的数据库连接复用机制
- **内存优化**：合理的内存使用和垃圾回收

### 安全加固
- **输入验证**：严格的参数校验和过滤
- **SQL注入防护**：通过GORM ORM防止SQL注入
- **XSS防护**：输出内容安全转义
- **CSRF保护**：Token验证机制
- **文件上传安全**：类型检查和大小限制

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题，请提交 GitHub Issue 或联系项目维护者。

## 📝 Git提交规范

### 提交信息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型说明
- **feat**: 新功能开发
- **fix**: Bug修复
- **docs**: 文档更新
- **style**: 代码格式调整
- **refactor**: 代码重构
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建过程或辅助工具变动

### 示例提交信息
```
docs(README): 完善数据库管理文档

- 详细说明GORM AutoMigrate工作机制
- 添加表结构特点描述
- 补充数据库初始化流程

refactor(project): 清理空目录和冗余文件

- 删除空的migrations目录
- 移除未使用的SQLite依赖
- 优化项目结构

## 📋 项目基线和回滚

项目提供了完整的基线管理和回滚机制：

### 基线文件
- `PROJECT_BASELINE.md` - 项目当前状态基线
- `ROLLBACK_GUIDE.md` - 回滚操作指南

### 回滚脚本
- `rollback.bat` - Windows回滚批处理脚本
- `cleanup_ports.bat` - 端口清理脚本

### 版本管理
- Git版本控制
- 功能分支开发模式
- 规范化的提交信息

更多信息请参考 [项目基线文档](PROJECT_BASELINE.md) 和 [回滚指南](ROLLBACK_GUIDE.md)
```