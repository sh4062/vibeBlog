# VibeBlog - 个人主页平台设计文档

## 项目概述

一个模块化的个人主页平台，前后端分离架构，博客作为第一个模块，预留后续扩展空间。

## 技术栈

### 前端
- **框架**: React 18 + Vite + TypeScript
- **状态管理**: Zustand
- **数据请求**: TanStack Query + Axios
- **样式**: Tailwind CSS + shadcn/ui
- **Markdown编辑器**: ByteMD（支持公式、代码高亮、图片/视频外链）
- **路由**: React Router v6

### 后端
- **框架**: Gin
- **ORM**: GORM
- **认证**: JWT-Go
- **数据库**: MySQL
- **缓存**: Redis
- **开发工具**: Air（热重载）

### 基础设施
- **容器化**: Docker Compose
- **反向代理**: Nginx（生产环境）

## 功能需求

### 博客模块

#### 前台页面
- 首页（文章列表，分页）
- 文章详情页（Markdown渲染，支持公式、图片、视频）
- 标签页（按标签筛选文章）
- 归档页（按时间归档）
- 搜索功能（标题/内容搜索）
- 关于我页面

#### 后台管理
- 登录/登出
- 文章管理（CRUD）
- 标签管理
- 文章状态：草稿 / 已发布 / 定时发布

### 认证模块
- JWT Token 认证
- 单用户登录（预留多用户扩展）
- Token 刷新机制

## 架构设计

### 项目结构

```
vibeBlog/
├── web/                          # 前端项目
│   ├── src/
│   │   ├── modules/              # 模块化架构
│   │   │   ├── blog/             # 博客模块
│   │   │   │   ├── pages/        # 页面组件
│   │   │   │   ├── components/   # 模块专用组件
│   │   │   │   ├── hooks/        # 模块专用hooks
│   │   │   │   ├── stores/       # 模块状态
│   │   │   │   └── api/          # API调用
│   │   │   └── ...               # 未来模块
│   │   ├── shared/               # 共享资源
│   │   │   ├── components/       # 通用组件
│   │   │   ├── hooks/            # 通用hooks
│   │   │   ├── utils/            # 工具函数
│   │   │   └── types/            # 类型定义
│   │   ├── layouts/              # 布局组件
│   │   │   ├── MainLayout.tsx    # 主布局
│   │   │   └── AdminLayout.tsx   # 后台布局
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── server/                       # 后端项目
│   ├── cmd/
│   │   └── main.go               # 入口文件
│   ├── internal/
│   │   ├── modules/              # 模块化架构
│   │   │   ├── auth/             # 认证模块
│   │   │   │   ├── handler/      # HTTP处理器
│   │   │   │   ├── service/      # 业务逻辑
│   │   │   │   ├── repository/   # 数据访问
│   │   │   │   └── model/        # 数据模型
│   │   │   ├── blog/             # 博客模块
│   │   │   │   ├── handler/
│   │   │   │   ├── service/
│   │   │   │   ├── repository/
│   │   │   │   └── model/
│   │   │   └── ...               # 未来模块
│   │   ├── shared/               # 共享资源
│   │   │   ├── middleware/       # 中间件
│   │   │   ├── config/           # 配置
│   │   │   ├── database/         # 数据库连接
│   │   │   └── utils/            # 工具函数
│   │   └── router/                # 路由注册
│   ├── go.mod
│   └── go.sum
│
├── docker-compose.yml            # Docker Compose配置
├── Dockerfile.web                 # 前端Dockerfile
├── Dockerfile.server              # 后端Dockerfile
├── nginx.conf                    # Nginx配置（生产用）
└── README.md
```

### 前端路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | Home | 首页，导航入口 |
| `/blog` | BlogList | 博客首页，文章列表 |
| `/blog/article/:id` | ArticleDetail | 文章详情 |
| `/blog/tag/:tag` | TagFilter | 按标签筛选 |
| `/blog/archive` | Archive | 归档页 |
| `/blog/search` | Search | 搜索结果页 |
| `/about` | About | 关于我 |
| `/admin` | AdminDashboard | 后台首页 |
| `/admin/articles` | ArticleManage | 文章管理 |
| `/admin/articles/new` | ArticleEdit | 新建文章 |
| `/admin/articles/:id/edit` | ArticleEdit | 编辑文章 |
| `/admin/tags` | TagManage | 标签管理 |
| `/login` | Login | 登录页 |

### 后端API设计

#### 认证模块
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 登录 |
| POST | `/api/auth/logout` | 登出 |
| POST | `/api/auth/refresh` | 刷新Token |

#### 博客模块 - 公开API
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/blog/articles` | 文章列表（分页、筛选） |
| GET | `/api/blog/articles/:id` | 文章详情 |
| GET | `/api/blog/tags` | 标签列表 |
| GET | `/api/blog/archive` | 归档数据 |
| GET | `/api/blog/search` | 搜索文章 |

#### 博客模块 - 管理API（需认证）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/articles` | 获取所有文章（含草稿） |
| POST | `/api/admin/articles` | 创建文章 |
| PUT | `/api/admin/articles/:id` | 更新文章 |
| DELETE | `/api/admin/articles/:id` | 删除文章 |
| POST | `/api/admin/articles/:id/publish` | 发布文章 |
| POST | `/api/admin/articles/:id/schedule` | 定时发布 |
| GET | `/api/admin/tags` | 获取标签 |
| POST | `/api/admin/tags` | 创建标签 |
| PUT | `/api/admin/tags/:id` | 更新标签 |
| DELETE | `/api/admin/tags/:id` | 删除标签 |

### 数据库设计

#### 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'author',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 文章表 (articles)
```sql
CREATE TABLE articles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    summary TEXT,
    content LONGTEXT,
    cover_image VARCHAR(255),
    status ENUM('draft', 'published', 'scheduled') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    view_count INT DEFAULT 0,
    author_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### 标签表 (tags)
```sql
CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 文章标签关联表 (article_tags)
```sql
CREATE TABLE article_tags (
    article_id BIGINT,
    tag_id BIGINT,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### Docker Compose 配置

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: vibe_blog
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
    volumes:
      - ./server:/app
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./web:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8080

volumes:
  mysql_data:
```

## 扩展性设计

### 前端模块化
- 每个功能模块独立目录，包含页面、组件、hooks、API
- 共享组件放在 `shared/` 目录
- 新增模块只需在 `modules/` 下新建目录并注册路由

### 后端模块化
- 采用六边形架构，模块间通过接口通信
- 每个模块包含 handler、service、repository、model
- 新增模块只需在 `modules/` 下新建目录并注册路由

### 未来模块预留
- 项目模块（Portfolio）
- 相册模块（Gallery）
- 书签模块（Bookmarks）
- 待办模块（Todo）

## 开发阶段

### Phase 1: 基础架构
1. 项目初始化（前端 + 后端）
2. Docker Compose 环境搭建
3. 数据库表结构创建
4. 基础中间件配置（CORS、日志、错误处理）

### Phase 2: 认证模块
1. 用户模型与数据库迁移
2. JWT 认证实现
3. 登录/登出 API
4. 前端登录页面与状态管理

### Phase 3: 博客前台
1. 文章列表页
2. 文章详情页
3. 标签筛选
4. 归档页
5. 搜索功能
6. 关于我页面

### Phase 4: 博客后台
1. 后台布局
2. 文章管理（CRUD）
3. Markdown 编辑器集成
4. 标签管理
5. 草稿/发布/定时发布

### Phase 5: 优化与部署
1. Redis 缓存实现
2. SEO 优化
3. 性能优化
4. 生产环境部署配置