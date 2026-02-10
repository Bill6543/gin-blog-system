# 博客系统API接口文档

## 📋 接口概览

### 基础配置
- **Base URL**: `http://localhost:8080/api`
- **认证方式**: JWT Token (Bearer)
- **Content-Type**: `application/json`

## 🔐 认证相关接口

### 用户注册
**POST** `/auth/register`
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "nickname": "测试用户"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatar": "/static/uploads/default_avatar.png",
    "status": 1,
    "created_at": "2026-02-07 10:30:00",
    "updated_at": "2026-02-07 10:30:00"
  },
  "msg": "success"
}
```

### 用户登录
**POST** `/auth/login`
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "nickname": "测试用户",
      "avatar": "/static/uploads/default_avatar.png",
      "status": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "msg": "success"
}
```

### 用户登出
**POST** `/auth/logout`
> 注意：JWT是无状态的，前端只需清除本地token即可

## 📝 文章相关接口

### 获取文章列表
**GET** `/articles?page=1&page_size=10`

**Headers**:
```
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "articles": [
      {
        "id": 1,
        "title": "我的第一篇博客",
        "content": "这是文章内容...",
        "summary": "文章摘要",
        "cover": "/static/uploads/cover.jpg",
        "status": 1,
        "view_count": 100,
        "like_count": 25,
        "comment_count": 10,
        "user_id": 1,
        "user": {
          "id": 1,
          "username": "author",
          "nickname": "作者昵称",
          "avatar": "/static/uploads/avatar.jpg"
        },
        "category_id": 1,
        "category": {
          "id": 1,
          "name": "技术分享",
          "description": "技术相关内容"
        },
        "tag_ids": [1, 2],
        "tags": [
          {
            "id": 1,
            "name": "Go语言",
            "color": "#007acc"
          },
          {
            "id": 2,
            "name": "后端开发",
            "color": "#4caf50"
          }
        ],
        "created_at": "2026-02-07 10:30:00",
        "updated_at": "2026-02-07 10:30:00"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10
  },
  "msg": "success"
}
```

### 获取文章详情
**GET** `/articles/{id}`

**Headers**:
```
Authorization: Bearer <token>
```

### 创建文章
**POST** `/articles`
```json
{
  "title": "新文章标题",
  "content": "文章正文内容",
  "summary": "文章摘要",
  "cover": "/static/uploads/cover.jpg",
  "status": 1,
  "category_id": 1,
  "tag_ids": [1, 2, 3]
}
```

### 更新文章
**PUT** `/articles/{id}`
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "summary": "更新后的摘要",
  "cover": "/static/uploads/new_cover.jpg",
  "status": 1,
  "category_id": 2,
  "tag_ids": [2, 3, 4]
}
```

### 删除文章
**DELETE** `/articles/{id}`

### 文章点赞
**POST** `/articles/{id}/like`

### 取消点赞
**DELETE** `/articles/{id}/like`

## 🏷️ 分类相关接口

### 获取分类列表
**GET** `/categories`

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "技术分享",
      "description": "技术相关内容",
      "status": 1,
      "created_at": "2026-02-07 10:30:00",
      "updated_at": "2026-02-07 10:30:00"
    }
  ],
  "msg": "success"
}
```

### 获取分类详情
**GET** `/categories/{id}`

### 创建分类
**POST** `/categories`
```json
{
  "name": "新分类",
  "description": "分类描述"
}
```

### 更新分类
**PUT** `/categories/{id}`
```json
{
  "name": "更新后的分类名",
  "description": "更新后的描述"
}
```

### 删除分类
**DELETE** `/categories/{id}`

## 🔖 标签相关接口

### 获取标签列表
**GET** `/tags`

### 获取标签详情
**GET** `/tags/{id}`

### 创建标签
**POST** `/tags`
```json
{
  "name": "新标签",
  "color": "#ff5722"
}
```

### 更新标签
**PUT** `/tags/{id}`
```json
{
  "name": "更新后的标签名",
  "color": "#4caf50"
}
```

### 删除标签
**DELETE** `/tags/{id}`

## 💬 评论相关接口

### 创建评论
**POST** `/comments`
```json
{
  "content": "这是一条评论",
  "article_id": 1,
  "parent_id": null
}
```

### 获取文章评论列表
**GET** `/comments/article/{article_id}?page=1&page_size=10`

### 获取评论详情
**GET** `/comments/{id}`

### 删除评论
**DELETE** `/comments/{id}`

## 📤 上传相关接口

### 上传图片
**POST** `/upload/image`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: 图片文件

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "url": "/static/uploads/2026/02/07/1745678901_a1b2c3d4.jpg",
    "filePath": "uploads/2026/02/07/1745678901_a1b2c3d4.jpg"
  },
  "msg": "success"
}
```

### 上传文件
**POST** `/upload/file`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: 任意文件

## 🏥 健康检查接口

### 服务健康状态
**GET** `/health`

**响应示例**:
```json
{
  "status": "healthy",
  "message": "Gin Blog System is running",
  "timestamp": "2026-02-07 10:30:00"
}
```

### 数据库连接池状态
**GET** `/health/db`

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07 10:30:00",
  "database": {
    "max_open_connections": 100,
    "open_connections": 15,
    "in_use": 3,
    "idle": 12,
    "wait_count": 0,
    "wait_duration": "0s"
  }
}
```

## ❌ 错误响应格式

```json
{
  "code": 400,
  "data": null,
  "msg": "参数绑定失败: Key: 'Article.Title' Error:Field validation for 'Title' failed on the 'required' tag"
}
```

## 🔧 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token失效 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 📱 前端集成要点

1. **认证管理**: 使用localStorage存储JWT token
2. **请求拦截**: 统一添加Authorization头
3. **响应处理**: 统一处理错误状态码
4. **文件上传**: 使用FormData格式
5. **分页处理**: 支持page和page_size参数
6. **时间格式**: 后端返回自定义格式的时间字符串

## 🚀 开发建议

1. 创建API客户端封装所有请求
2. 使用TypeScript定义接口响应类型
3. 实现全局错误处理和loading状态
4. 图片上传前进行压缩和格式验证
5. 实现防抖和节流优化用户体验