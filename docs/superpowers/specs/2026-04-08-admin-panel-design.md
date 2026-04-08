# 管理后台设计文档

> **日期**: 2026-04-08
> **状态**: 设计确认，待实现

## 概述

为 VibeBlog 实现管理后台，提供文章管理、标签管理、站点设置等功能。采用现代仪表盘风格，与前台玻璃拟态风格保持一致。

## 设计决策

| 决策项 | 选择 | 理由 |
|---|---|---|
| 视觉风格 | 现代仪表盘 | 深色渐变背景 + 玻璃拟态卡片，与前台呼应 |
| 功能范围 | 完整 5 功能 | 文章CRUD + 标签管理 + 发布管理 + 站点设置 |
| Markdown编辑器 | ByteMD | 与前台渲染一致，已安装 |
| 布局方式 | 侧边栏 + 内容区 | 经典后台布局，功能清晰 |

## 功能清单

### 1. 仪表盘首页

**路径**: `/admin`

**内容**:
- 3 个统计卡片：文章总数、已发布数、草稿数
- 总阅读量统计
- 最近文章列表（最新 5 篇）
- 快捷操作：新建文章、管理标签

**API**:
- `GET /api/admin/stats` - 获取统计数据

```json
// Response
{
  "data": {
    "total_articles": 128,
    "published": 100,
    "drafts": 28,
    "total_views": 12580
  }
}
```

### 2. 文章列表

**路径**: `/admin/articles`

**功能**:
- 搜索：标题关键词
- 筛选：状态（全部/已发布/草稿）
- 表格列：标题、状态、标签、发布时间、阅读量、操作
- 操作：编辑、删除
- 分页

**API**:
- `GET /api/admin/articles?page=1&limit=10&status=&keyword=` - 文章列表
- `DELETE /api/admin/articles/:id` - 删除文章

### 3. 文章编辑

**路径**: `/admin/articles/new` (新建), `/admin/articles/:id/edit` (编辑)

**表单字段**:
| 字段 | 类型 | 说明 |
|---|---|---|
| title | 文本 | 标题（必填） |
| slug | 文本 | URL别名（可选，自动生成） |
| summary | 文本域 | 摘要 |
| content | Markdown | 正文内容 |
| cover_image | URL | 封面图（可选） |
| tags | 多选 | 标签选择 |
| status | 单选 | draft/published |

**操作按钮**:
- 保存草稿
- 发布
- 保存更改（编辑模式）

> 注：定时发布功能推迟到后续阶段实现。

**API**:
- `POST /api/admin/articles` - 创建文章
- `GET /api/admin/articles/:id` - 获取文章详情
- `PUT /api/admin/articles/:id` - 更新文章
- `POST /api/admin/articles/:id/publish` - 发布文章
- `POST /api/admin/articles/:id/schedule` - 定时发布

### 4. 标签管理

**路径**: `/admin/tags`

**功能**:
- 标签列表表格：名称、Slug、描述、文章数、操作
- 创建标签弹窗
- 编辑标签弹窗
- 删除确认

**API**:
- `GET /api/admin/tags` - 标签列表
- `POST /api/admin/tags` - 创建标签
- `PUT /api/admin/tags/:id` - 更新标签
- `DELETE /api/admin/tags/:id` - 删除标签

### 5. 站点设置

**路径**: `/admin/settings`

**设置项**:
| 字段 | 类型 | 说明 |
|---|---|---|
| avatar | URL | 头像图片地址 |
| about_content | Markdown | 关于我内容 |
| social_links | JSON | 社交链接 {"github": "url", "twitter": "url"} |

**API**:
- `GET /api/site/config` - 获取配置（已存在）
- `PUT /api/admin/site/config` - 更新配置

## 视觉规范

### 布局

```
+------------------+------------------------+
|                  |                        |
|    Sidebar       |      Content Area      |
|    (240px)       |      (flex-1)          |
|                  |                        |
|    - 仪表盘      |                        |
|    - 文章管理    |                        |
|    - 标签管理    |                        |
|    - 站点设置    |                        |
|                  |                        |
|    ──────────    |                        |
|    退出登录      |                        |
|                  |                        |
+------------------+------------------------+
```

### 配色

| 元素 | 颜色 |
|---|---|
| 背景 | `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900` |
| 侧边栏 | `bg-slate-900/80 backdrop-blur` |
| 卡片 | `bg-white/10 backdrop-blur border border-white/20` |
| 主色调 | 蓝紫渐变 `#667eea → #764ba2` |
| 成功 | `#10b981` (green-500) |
| 警告 | `#f59e0b` (amber-500) |
| 错误 | `#ef4444` (red-500) |

### 状态标签

| 状态 | 样式 |
|---|---|
| published | 绿色徽章 `bg-green-500/20 text-green-400` |
| draft | 黄色徽章 `bg-amber-500/20 text-amber-400` |

## 文件结构

### 前端

```
web/src/
├── layouts/
│   └── AdminLayout.tsx           # 后台布局
├── modules/admin/
│   ├── api/
│   │   └── adminApi.ts           # 管理 API
│   ├── pages/
│   │   ├── DashboardPage.tsx     # 仪表盘
│   │   ├── ArticleListPage.tsx   # 文章列表
│   │   ├── ArticleEditPage.tsx   # 文章编辑
│   │   ├── TagManagePage.tsx     # 标签管理
│   │   └── SettingsPage.tsx      # 站点设置
│   └── components/
│       ├── AdminSidebar.tsx      # 侧边导航
│       ├── StatsCard.tsx         # 统计卡片
│       ├── ArticleTable.tsx      # 文章表格
│       ├── TagModal.tsx          # 标签弹窗
│       └── MarkdownEditor.tsx    # MD编辑器
└── App.tsx                       # 添加后台路由
```

### 后端

```
server/internal/
├── modules/admin/
│   ├── handler/
│   │   └── admin_handler.go      # 管理 API 处理器
│   └── service/
│       └── admin_service.go      # 管理业务逻辑
├── shared/
│   └── middleware/
│       └── auth.go               # JWT 认证中间件
└── router/
    └── router.go                 # 添加管理路由
```

## API 设计

### 认证中间件

```go
func AuthMiddleware() gin.HandlerFunc {
    // 验证 Authorization: Bearer <token>
    // 解析 JWT 获取用户信息
    // 设置 c.Set("userID", userID)
}
```

### 统计 API

```
GET /api/admin/stats

Response:
{
  "data": {
    "total_articles": 128,
    "published": 100,
    "drafts": 28,
    "total_views": 12580
  }
}
```

### 文章管理 API

```
GET /api/admin/articles?page=1&limit=10&status=&keyword=
POST /api/admin/articles
GET /api/admin/articles/:id
PUT /api/admin/articles/:id
DELETE /api/admin/articles/:id
POST /api/admin/articles/:id/publish
```

> 注：定时发布 API 将在后续阶段添加。

**文章列表响应格式**:
```json
{
  "data": [
    {
      "id": 1,
      "title": "文章标题",
      "slug": "article-slug",
      "summary": "摘要",
      "status": "published",
      "published_at": "2026-04-08T10:00:00Z",
      "view_count": 100,
      "tags": [{"id": 1, "name": "Go"}],
      "created_at": "2026-04-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### 标签管理 API

```
GET /api/admin/tags
POST /api/admin/tags
PUT /api/admin/tags/:id
DELETE /api/admin/tags/:id
```

### 站点设置 API

```
PUT /api/admin/site/config

Request:
{
  "avatar": "https://...",
  "about_content": "# About me...",
  "social_links": "{\"github\":\"https://...\"}"
}
```

### 错误响应格式

所有 API 错误响应统一格式：
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "标题不能为空"
  }
}
```

常见错误码：
| 错误码 | HTTP状态码 | 说明 |
|--------|-----------|------|
| UNAUTHORIZED | 401 | 未登录或token过期 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| DUPLICATE_SLUG | 400 | Slug已存在 |

## 认证流程

### 已有实现（Phase 2）

**登录页面**: `web/src/modules/auth/pages/LoginPage.tsx`（已存在）

**登录 API**: `POST /api/auth/login`（已实现）
```json
// Request
{ "username": "admin", "password": "password123" }

// Response
{
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "user": { "id": 1, "username": "admin", "nickname": "博主" }
  }
}
```

**Token 刷新**: `POST /api/auth/refresh`（已实现）

### 后台访问流程

1. 用户访问 `/admin/*` 路由
2. 前端检查 localStorage 中的 `access_token`
3. 无 token 则重定向到 `/login`（已存在）
4. 有 token 则请求 API，携带 `Authorization: Bearer <token>`
5. 后端中间件验证 token
6. 验证失败返回 401，前端重定向到 `/login`

## 实现任务

### Phase 5: 管理后台

1. **后端认证中间件** - JWT 验证
2. **后端管理 API** - 文章/标签/统计
3. **前端 AdminLayout** - 侧边栏布局
4. **前端 adminApi** - API 封装
5. **仪表盘页面** - 统计卡片
6. **文章列表页** - 表格 + 筛选
7. **文章编辑页** - Markdown 编辑器
8. **标签管理页** - CRUD 弹窗
9. **站点设置页** - 表单
10. **路由配置** - 添加管理路由
11. **认证守卫** - 登录检查

## 依赖

### 前端已有

- ByteMD（编辑器 + 渲染）
- TanStack Query
- Zustand
- Tailwind CSS
- React Router

### 前端新增

- 无需新增依赖

### 后端已有

- JWT-Go
- Gin
- GORM