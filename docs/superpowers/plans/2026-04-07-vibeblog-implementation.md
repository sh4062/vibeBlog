# VibeBlog - 博客平台实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个前后端分离的模块化个人主页平台，博客作为第一个模块。

**Architecture:** 前端 React + Vite + TypeScript 模块化架构，后端 Go + Gin 六边形模块化架构，通过 Docker Compose 统一管理 MySQL + Redis + 服务。

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Go, Gin, GORM, JWT, MySQL 8, Redis 7

---

## 文件结构规划

```
vibeBlog/
├── docker-compose.yml          # Docker Compose 配置
├── server/                     # Go 后端
│   ├── cmd/main.go             # 入口
│   ├── go.mod                  # Go 模块定义
│   ├── internal/
│   │   ├── shared/
│   │   │   ├── config/config.go        # 配置加载
│   │   │   ├── database/mysql.go       # MySQL 连接
│   │   │   ├── database/redis.go       # Redis 连接
│   │   │   ├── middleware/auth.go      # JWT 认证中间件
│   │   │   ├── middleware/cors.go      # CORS 中间件
│   │   │   ├── middleware/logger.go    # 日志中间件
│   │   │   ├── utils/response.go       # 统一响应格式
│   │   │   ├── utils/jwt.go            # JWT 工具函数
│   │   │   ├── utils/hash.go           # 密码哈希工具
│   │   │   └── utils/slug.go           # Slug 生成工具
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── model/user.go       # 用户模型
│   │   │   │   ├── repository/user_repo.go
│   │   │   │   ├── service/auth_service.go
│   │   │   │   └── handler/auth_handler.go
│   │   │   ├── blog/
│   │   │   │   ├── model/article.go    # 文章模型
│   │   │   │   ├── model/tag.go        # 标签模型
│   │   │   │   ├── model/site_config.go
│   │   │   │   ├── repository/article_repo.go
│   │   │   │   ├── repository/tag_repo.go
│   │   │   │   ├── repository/site_config_repo.go
│   │   │   │   ├── service/article_service.go
│   │   │   │   ├── service/tag_service.go
│   │   │   │   ├── service/scheduler.go  # 定时发布
│   │   │   │   ├── handler/blog_handler.go   # 公开API
│   │   │   │   └── handler/admin_handler.go  # 管理API
│   │   └── router/router.go           # 路由注册
│   ├── Dockerfile
│   └── .air.toml                      # Air 热重载配置
│
├── web/                         # React 前端
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx         # 前台布局
│   │   │   └── AdminLayout.tsx        # 后台布局
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── stores/authStore.ts
│   │   │   │   ├── api/authApi.ts
│   │   │   │   └── pages/LoginPage.tsx
│   │   │   └── blog/
│   │   │       ├── api/blogApi.ts
│   │   │       ├── pages/
│   │   │       │   ├── HomePage.tsx
│   │   │       │   ├── ArticleListPage.tsx
│   │   │       │   ├── ArticleDetailPage.tsx
│   │   │       │   ├── TagPage.tsx
│   │   │       │   ├── ArchivePage.tsx
│   │   │       │   ├── SearchPage.tsx
│   │   │       │   ├── AboutPage.tsx
│   │   │       │   ├── AdminDashboard.tsx
│   │   │       │   ├── ArticleManagePage.tsx
│   │   │       │   ├── ArticleEditPage.tsx
│   │   │       │   └── TagManagePage.tsx
│   │   │       └── components/
│   │   │           ├── ArticleCard.tsx
│   │   │           ├── TagBadge.tsx
│   │   │           ├── MarkdownEditor.tsx
│   │   │           └── MarkdownRenderer.tsx
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── utils/
│   │   │   │   ├── request.ts         # Axios 实例
│   │   │   │   └── date.ts            # 日期格式化
│   │   │   └── types/
│   │   │       ├── api.ts             # API 类型定义
│   │   │       └── models.ts          # 数据模型类型
│   ├── Dockerfile
│   └── Dockerfile.dev                 # 开发环境 Dockerfile
```

---

## Phase 1: 基础架构

### Task 1.1: Docker Compose 环境搭建

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: 创建 Docker Compose 配置**

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: vibeblog-mysql
    environment:
      MYSQL_ROOT_PASSWORD: vibeblog_root
      MYSQL_DATABASE: vibe_blog
      MYSQL_USER: vibeblog
      MYSQL_PASSWORD: vibeblog123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: vibeblog-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

- [ ] **Step 2: 启动服务验证**

```bash
docker-compose up -d
docker-compose ps
# Expected: mysql and redis containers running, status "healthy"
```

- [ ] **Step 3: 验证 MySQL 连接**

```bash
docker-compose exec mysql mysql -u vibeblog -pvibeblog123 -e "SELECT 1"
# Expected: output "1"
```

- [ ] **Step 4: 验证 Redis 连接**

```bash
docker-compose exec redis redis-cli ping
# Expected: "PONG"
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml
git commit -m "feat: add docker-compose for MySQL and Redis"
```

---

### Task 1.2: Go 后端项目初始化

**Files:**
- Create: `server/go.mod`
- Create: `server/cmd/main.go`
- Create: `server/.air.toml`

- [ ] **Step 1: 创建 Go 模块**

```bash
mkdir -p server/cmd server/internal
cd server && go mod init vibeblog/server
```

- [ ] **Step 2: 创建入口文件**

```go
// server/cmd/main.go
package main

import (
	"fmt"
)

func main() {
	fmt.Println("VibeBlog Server starting...")
}
```

- [ ] **Step 3: 验证编译运行**

```bash
cd server && go run cmd/main.go
# Expected: "VibeBlog Server starting..."
```

- [ ] **Step 4: 创建 Air 热重载配置**

```toml
# server/.air.toml
root = "."
tmp_dir = "tmp"

[build]
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/main.go"
  delay = 1000
  exclude_dir = ["tmp", "vendor"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  kill_delay = "0s"
  log = "build-errors.log"
  send_interrupt = false
  stop_on_error = true

[color]
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  time = false

[misc]
  clean_on_exit = true
```

- [ ] **Step 5: Commit**

```bash
git add server/
git commit -m "feat: initialize Go backend project with Air config"
```

---

### Task 1.3: 配置加载模块

**Files:**
- Create: `server/internal/shared/config/config.go`

- [ ] **Step 1: 创建配置结构体**

```go
// server/internal/shared/config/config.go
package config

import (
	"os"
	"strconv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
}

type ServerConfig struct {
	Port string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type RedisConfig struct {
	Host string
	Port string
}

type JWTConfig struct {
	Secret          string
	AccessTokenExp  int // minutes
	RefreshTokenExp int // days
}

func Load() *Config {
	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "3306"),
			User:     getEnv("DB_USER", "vibeblog"),
			Password: getEnv("DB_PASSWORD", "vibeblog123"),
			DBName:   getEnv("DB_NAME", "vibe_blog"),
		},
		Redis: RedisConfig{
			Host: getEnv("REDIS_HOST", "localhost"),
			Port: getEnv("REDIS_PORT", "6379"),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "vibeblog-secret-change-in-production"),
			AccessTokenExp:  getEnvInt("JWT_ACCESS_EXP", 15),
			RefreshTokenExp: getEnvInt("JWT_REFRESH_EXP", 7),
		},
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func getEnvInt(key string, defaultVal int) int {
	if val := os.Getenv(key); val != "" {
		i, err := strconv.Atoi(val)
		if err == nil {
			return i
		}
	}
	return defaultVal
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/shared/config/
git commit -m "feat: add configuration loading module"
```

---

### Task 1.4: MySQL 数据库连接

**Files:**
- Create: `server/internal/shared/database/mysql.go`

- [ ] **Step 1: 创建 MySQL 连接模块**

```go
// server/internal/shared/database/mysql.go
package database

import (
	"fmt"
	"log"
	"vibeblog/server/internal/shared/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitMySQL(cfg *config.DatabaseConfig) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	DB = db
	log.Println("MySQL connected successfully")
	return nil
}

func CloseMySQL() {
	sqlDB, err := DB.DB()
	if err != nil {
		log.Printf("Error getting SQL DB: %v", err)
		return
	}
	sqlDB.Close()
	log.Println("MySQL connection closed")
}
```

- [ ] **Step 2: 安装 GORM 依赖**

```bash
cd server && go get gorm.io/gorm gorm.io/driver/mysql
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/shared/database/mysql.go server/go.mod server/go.sum
git commit -m "feat: add MySQL database connection with GORM"
```

---

### Task 1.5: Redis 连接

**Files:**
- Create: `server/internal/shared/database/redis.go`

- [ ] **Step 1: 创建 Redis 连接模块**

```go
// server/internal/shared/database/redis.go
package database

import (
	"context"
	"fmt"
	"log"
	"vibeblog/server/internal/shared/config"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis(cfg *config.RedisConfig) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
	})

	ctx := context.Background()
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect redis: %w", err)
	}

	log.Println("Redis connected successfully")
	return nil
}

func CloseRedis() {
	if RedisClient != nil {
		RedisClient.Close()
		log.Println("Redis connection closed")
	}
}
```

- [ ] **Step 2: 安装 Redis 依赖**

```bash
cd server && go get github.com/redis/go-redis/v9
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/shared/database/redis.go server/go.mod server/go.sum
git commit -m "feat: add Redis connection module"
```

---

### Task 1.6: 统一响应格式

**Files:**
- Create: `server/internal/shared/utils/response.go`

- [ ] **Step 1: 创建统一响应工具**

```go
// server/internal/shared/utils/response.go
package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Data    any    `json:"data,omitempty"`
	Message string `json:"message,omitempty"`
	Error   *ErrorInfo `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type Pagination struct {
	Page   int `json:"page"`
	Limit  int `json:"limit"`
	Total  int64 `json:"total"`
	Pages  int `json:"pages"`
}

type PagedResponse struct {
	Data       any        `json:"data"`
	Pagination Pagination `json:"pagination"`
}

func Success(c *gin.Context, data any) {
	c.JSON(http.StatusOK, Response{Data: data})
}

func SuccessWithMessage(c *gin.Context, data any, message string) {
	c.JSON(http.StatusOK, Response{Data: data, Message: message})
}

func Created(c *gin.Context, data any) {
	c.JSON(http.StatusCreated, Response{Data: data})
}

func PagedSuccess(c *gin.Context, data any, pagination Pagination) {
	c.JSON(http.StatusOK, PagedResponse{Data: data, Pagination: pagination})
}

func BadRequest(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Error: &ErrorInfo{Code: "BAD_REQUEST", Message: message},
	})
}

func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, Response{
		Error: &ErrorInfo{Code: "UNAUTHORIZED", Message: message},
	})
}

func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, Response{
		Error: &ErrorInfo{Code: "FORBIDDEN", Message: message},
	})
}

func NotFound(c *gin.Context, message string) {
	c.JSON(http.StatusNotFound, Response{
		Error: &ErrorInfo{Code: "NOT_FOUND", Message: message},
	})
}

func InternalError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, Response{
		Error: &ErrorInfo{Code: "INTERNAL_ERROR", Message: message},
	})
}

func ValidationError(c *gin.Context, message string) {
	c.JSON(http.StatusBadRequest, Response{
		Error: &ErrorInfo{Code: "VALIDATION_ERROR", Message: message},
	})
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/shared/utils/response.go
git commit -m "feat: add unified API response format utilities"
```

---

### Task 1.7: 密码哈希工具

**Files:**
- Create: `server/internal/shared/utils/hash.go`

- [ ] **Step 1: 创建密码哈希工具**

```go
// server/internal/shared/utils/hash.go
package utils

import "golang.org/x/crypto/bcrypt"

const bcryptCost = 10

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcryptCost)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
```

- [ ] **Step 2: 安装 bcrypt 依赖**

```bash
cd server && go get golang.org/x/crypto/bcrypt
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/shared/utils/hash.go server/go.mod server/go.sum
git commit -m "feat: add password hashing utility with bcrypt"
```

---

### Task 1.8: JWT 工具函数

**Files:**
- Create: `server/internal/shared/utils/jwt.go`

- [ ] **Step 1: 创建 JWT 工具**

```go
// server/internal/shared/utils/jwt.go
package utils

import (
	"errors"
	"time"
	"vibeblog/server/internal/shared/config"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret []byte

func InitJWT(cfg *config.JWTConfig) {
	jwtSecret = []byte(cfg.Secret)
}

func GenerateAccessToken(userID uint, username, role string, cfg *config.JWTConfig) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(cfg.AccessTokenExp) * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func GenerateRefreshToken(userID uint, username, role string, cfg *config.JWTConfig) (string, error) {
	claims := Claims{
		UserID:   userID,
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(cfg.RefreshTokenExp) * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (any, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}
```

- [ ] **Step 2: 安装 JWT 依赖**

```bash
cd server && go get github.com/golang-jwt/jwt/v5
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/shared/utils/jwt.go server/go.mod server/go.sum
git commit -m "feat: add JWT token generation and parsing utilities"
```

---

### Task 1.9: Slug 生成工具

**Files:**
- Create: `server/internal/shared/utils/slug.go`

- [ ] **Step 1: 创建 Slug 工具**

```go
// server/internal/shared/utils/slug.go
package utils

import (
	"regexp"
	"strings"
	"unicode"
)

// 简单的拼音映射（常见字）
var pinyinMap = map[rune]string{
	'一': "yi", '二': "er", '三': "san", '四': "si", '五': "wu",
	'六': "liu", '七': "qi", '八': "ba", '九': "jiu", '十': "shi",
	'中': "zhong", '国': "guo", '人': "ren", '大': "da", '小': "xiao",
	'学': "xue", '习': "xi", '开': "kai", '发': "fa", '程': "cheng",
	'编': "bian", '码': "ma", '技': "ji", '术': "shu", '好': "hao",
	'新': "xin", '手': "shou", '入': "ru", '门': "men", '博': "bo",
	'客': "ke", '文': "wen", '章': "zhang", '日': "ri", '记': "ji",
}

func GenerateSlug(title string) string {
	var result strings.Builder

	for _, char := range title {
		if unicode.Is(unicode.Latin, char) {
			// 英文字母
			if unicode.IsLower(char) || unicode.IsDigit(char) {
				result.WriteRune(char)
			} else if unicode.IsUpper(char) {
				result.WriteRune(unicode.ToLower(char))
			}
		} else if unicode.IsDigit(char) {
			result.WriteRune(char)
		} else if char == ' ' || char == '-' || char == '_' {
			result.WriteRune('-')
		} else if pinyin, ok := pinyinMap[char]; ok {
			result.WriteString(pinyin)
		}
		// 其他中文字符暂时跳过
	}

	slug := result.String()

	// 清理连续的横线
	re := regexp.MustCompile(`-+`)
	slug = re.ReplaceAllString(slug, "-")

	// 去除首尾横线
	slug = strings.Trim(slug, "-")

	// 限制长度
	if len(slug) > 50 {
		slug = slug[:50]
		// 确保不在横线处截断
		slug = strings.TrimRight(slug, "-")
	}

	// 如果生成空slug，使用时间戳
	if slug == "" {
		slug = "article"
	}

	return slug
}

func MakeUniqueSlug(baseSlug string, exists bool, count int) string {
	if !exists {
		return baseSlug
	}
	return baseSlug + "-" + string(rune(count))
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/shared/utils/slug.go
git commit -m "feat: add slug generation utility with basic pinyin support"
```

---

### Task 1.10: Gin 框架集成与路由

**Files:**
- Create: `server/internal/shared/middleware/cors.go`
- Create: `server/internal/shared/middleware/logger.go`
- Create: `server/internal/router/router.go`
- Modify: `server/cmd/main.go`

- [ ] **Step 1: 创建 CORS 中间件**

```go
// server/internal/shared/middleware/cors.go
package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()

		c.Next()

		latency := time.Since(t)
		status := c.Writer.Status()

		println("[GIN]", status, c.Request.Method, c.Request.URL.Path, latency.String())
	}
}
```

- [ ] **Step 2: 创建路由模块**

```go
// server/internal/router/router.go
package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/shared/middleware"
)

func SetupRouter() *gin.Engine {
	r := gin.New()

	// 中间件
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API 路由组（后续添加）
	api := r.Group("/api")
	{
		// 后续注册各模块路由
	}

	return r
}
```

- [ ] **Step 3: 安装 Gin 依赖**

```bash
cd server && go get github.com/gin-gonic/gin
```

- [ ] **Step 4: 更新入口文件**

```go
// server/cmd/main.go
package main

import (
	"log"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/database"
	"vibeblog/server/internal/shared/utils"
	"vibeblog/server/internal/router"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	if err := database.InitMySQL(&cfg.Database); err != nil {
		log.Fatalf("MySQL init failed: %v", err)
	}

	// 初始化 Redis
	if err := database.InitRedis(&cfg.Redis); err != nil {
		log.Printf("Redis init failed: %v, continuing without cache", err)
	}

	// 初始化 JWT
	utils.InitJWT(&cfg.JWT)

	// 设置路由
	r := router.SetupRouter()

	// 启动服务
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}

	// 清理（实际不会执行到这里）
	database.CloseMySQL()
	database.CloseRedis()
}
```

- [ ] **Step 5: 验证编译**

```bash
cd server && go build -o /tmp/vibeblog-server ./cmd/main.go
# Expected: no errors
```

- [ ] **Step 6: Commit**

```bash
git add server/
git commit -m "feat: integrate Gin framework with CORS and logging middleware"
```

---

### Task 1.11: 后端 Dockerfile

**Files:**
- Create: `server/Dockerfile`

- [ ] **Step 1: 创建 Dockerfile**

```dockerfile
# server/Dockerfile
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o main ./cmd/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
```

- [ ] **Step 2: 更新 docker-compose 添加 server 服务**

```yaml
# 在 docker-compose.yml 中添加 server 服务
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: vibeblog-server
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=vibeblog
      - DB_PASSWORD=vibeblog123
      - DB_NAME=vibe_blog
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=vibeblog-dev-secret
      - SERVER_PORT=8080
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
```

- [ ] **Step 3: Commit**

```bash
git add server/Dockerfile docker-compose.yml
git commit -m "feat: add Dockerfile for Go backend and update compose"
```

---

### Task 1.12: 数据库表迁移

**Files:**
- Create: `server/internal/modules/auth/model/user.go`
- Create: `server/internal/modules/blog/model/article.go`
- Create: `server/internal/modules/blog/model/tag.go`
- Create: `server/internal/modules/blog/model/site_config.go`
- Modify: `server/cmd/main.go`

- [ ] **Step 1: 创建用户模型**

```go
// server/internal/modules/auth/model/user.go
package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"size:50;not null;unique" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Nickname  string    `gorm:"size:50" json:"nickname"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	Email     string    `gorm:"size:100" json:"email"`
	Role      string    `gorm:"size:20;default:author" json:"role"`
	Ext       any       `gorm:"type:json" json:"ext"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func AutoMigrate() error {
	return database.DB.AutoMigrate(&User{})
}
```

- [ ] **Step 2: 创建文章模型**

```go
// server/internal/modules/blog/model/article.go
package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type ArticleStatus string

const (
	StatusDraft     ArticleStatus = "draft"
	StatusPublished ArticleStatus = "published"
	StatusScheduled ArticleStatus = "scheduled"
)

type Article struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	Title       string        `gorm:"size:255;not null" json:"title"`
	Slug        string        `gorm:"size:50;unique" json:"slug"`
	Summary     string        `gorm:"type:text" json:"summary"`
	Content     string        `gorm:"type:longtext" json:"content"`
	CoverImage  string        `gorm:"size:255" json:"cover_image"`
	Status      ArticleStatus `gorm:"size:20;default:draft" json:"status"`
	PublishedAt *time.Time    `json:"published_at"`
	ScheduledAt *time.Time    `json:"scheduled_at"`
	ViewCount   int           `gorm:"default:0" json:"view_count"`
	AuthorID    uint          `gorm:"not null" json:"author_id"`
	Ext         any           `gorm:"type:json" json:"ext"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
	Tags        []Tag         `gorm:"many2many:article_tags;" json:"tags"`
}

func (Article) TableName() string {
	return "articles"
}

type ArticleTag struct {
	ArticleID uint
	TagID     uint
}

func AutoMigrateArticle() error {
	return database.DB.AutoMigrate(&Article{}, &Tag{}, &ArticleTag{})
}
```

- [ ] **Step 3: 创建标签模型**

```go
// server/internal/modules/blog/model/tag.go
package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type Tag struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:50;not null;unique" json:"name"`
	Slug        string    `gorm:"size:50;unique" json:"slug"`
	Description string    `gorm:"size:255" json:"description"`
	Ext         any       `gorm:"type:json" json:"ext"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Tag) TableName() string {
	return "tags"
}
```

- [ ] **Step 4: 创建站点配置模型**

```go
// server/internal/modules/blog/model/site_config.go
package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type SiteConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ConfigKey string    `gorm:"size:50;not null;unique" json:"config_key"`
	Value     string    `gorm:"type:text" json:"value"`
	Ext       any       `gorm:"type:json" json:"ext"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (SiteConfig) TableName() string {
	return "site_config"
}

func AutoMigrateSiteConfig() error {
	return database.DB.AutoMigrate(&SiteConfig{})
}
```

- [ ] **Step 5: 更新入口文件添加迁移**

在 `server/cmd/main.go` 的数据库初始化后添加：

```go
// 自动迁移数据库表
import (
	authModel "vibeblog/server/internal/modules/auth/model"
	blogModel "vibeblog/server/internal/modules/blog/model"
)

// 在 database.InitMySQL 后添加：
if err := authModel.AutoMigrate(); err != nil {
	log.Fatalf("Auth model migration failed: %v", err)
}
if err := blogModel.AutoMigrateArticle(); err != nil {
	log.Fatalf("Blog model migration failed: %v", err)
}
if err := blogModel.AutoMigrateSiteConfig(); err != nil {
	log.Fatalf("Site config migration failed: %v", err)
}
log.Println("Database migration completed")
```

- [ ] **Step 6: 验证表创建**

```bash
docker-compose exec mysql mysql -u vibeblog -pvibeblog123 vibe_blog -e "SHOW TABLES"
# Expected: users, articles, tags, article_tags, site_config
```

- [ ] **Step 7: Commit**

```bash
git add server/internal/modules/
git commit -m "feat: add database models with GORM auto-migrate"
```

---

### Task 1.13: 前端项目初始化

**Files:**
- Create: `web/package.json`
- Create: `web/vite.config.ts`
- Create: `web/tsconfig.json`
- Create: `web/tailwind.config.js`
- Create: `web/index.html`
- Create: `web/src/main.tsx`
- Create: `web/src/App.tsx`

- [ ] **Step 1: 创建 Vite + React + TS 项目**

```bash
npm create vite@latest web -- --template react-ts
cd web && npm install
```

- [ ] **Step 2: 安装核心依赖**

```bash
cd web && npm install \
  react-router-dom \
  @tanstack/react-query \
  zustand \
  axios \
  tailwindcss postcss autoprefixer \
  bytemd @bytemd/react @bytemd/plugin-gfm @bytemd/plugin-highlight
```

- [ ] **Step 3: 初始化 Tailwind**

```bash
cd web && npx tailwindcss init -p
```

- [ ] **Step 4: 配置 Tailwind**

```javascript
// web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* web/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 5: 创建基础 App 结构**

```tsx
// web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div className="p-8 text-2xl">VibeBlog 前端启动成功</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

- [ ] **Step 6: 验证前端运行**

```bash
cd web && npm run dev
# Expected: dev server running on http://localhost:5173
```

- [ ] **Step 7: Commit**

```bash
git add web/
git commit -m "feat: initialize React frontend with Vite, TypeScript, Tailwind"
```

---

### Task 1.14: 前端 Dockerfile

**Files:**
- Create: `web/Dockerfile.dev`

- [ ] **Step 1: 创建开发环境 Dockerfile**

```dockerfile
# web/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

- [ ] **Step 2: 更新 docker-compose 添加 web 服务**

```yaml
# 在 docker-compose.yml 中添加 web 服务
  web:
    build:
      context: ./web
      dockerfile: Dockerfile.dev
    container_name: vibeblog-web
    ports:
      - "5173:5173"
    volumes:
      - ./web/src:/app/src
      - ./web/public:/app/public
      - ./web/index.html:/app/index.html
      - ./web/vite.config.ts:/app/vite.config.ts
      - ./web/tailwind.config.js:/app/tailwind.config.js
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8080
```

- [ ] **Step 3: Commit**

```bash
git add web/Dockerfile.dev docker-compose.yml
git commit -m "feat: add Dockerfile for React frontend dev environment"
```

---

### Task 1.15: 前端类型定义

**Files:**
- Create: `web/src/shared/types/models.ts`
- Create: `web/src/shared/types/api.ts`

- [ ] **Step 1: 创建数据模型类型**

```typescript
// web/src/shared/types/models.ts
export interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  role: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  description: string
  article_count?: number
}

export type ArticleStatus = 'draft' | 'published' | 'scheduled'

export interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  cover_image: string
  status: ArticleStatus
  published_at: string | null
  scheduled_at: string | null
  view_count: number
  author_id: number
  tags: Tag[]
  author?: User
  created_at: string
  updated_at: string
}

export interface SiteConfig {
  about_content: string
  avatar: string
  social_links: Record<string, string>
}
```

- [ ] **Step 2: 创建 API 类型**

```typescript
// web/src/shared/types/api.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: {
    code: string
    message: string
  }
}

export interface PagedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/shared/types/
git commit -m "feat: add TypeScript type definitions for models and API"
```

---

### Task 1.16: Axios 请求实例

**Files:**
- Create: `web/src/shared/utils/request.ts`

- [ ] **Step 1: 创建 Axios 实例**

```typescript
// web/src/shared/utils/request.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const request = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：添加 token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：处理错误
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期，尝试刷新
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })
          const { access_token, refresh_token } = res.data.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          // 重试原请求
          error.config.headers.Authorization = `Bearer ${access_token}`
          return request(error.config)
        } catch {
          // 刷新失败，清除 token
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export default request
```

- [ ] **Step 2: Commit**

```bash
git add web/src/shared/utils/request.ts
git commit -m "feat: add Axios instance with auth interceptors"
```

---

## Phase 2: 认证模块

### Task 2.1: 用户 Repository

**Files:**
- Create: `server/internal/modules/auth/repository/user_repo.go`

- [ ] **Step 1: 创建用户 Repository**

```go
// server/internal/modules/auth/repository/user_repo.go
package repository

import (
	"vibeblog/server/internal/modules/auth/model"
	"vibeblog/server/internal/shared/database"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := database.DB.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Create(user *model.User) error {
	return database.DB.Create(user).Error
}

func (r *UserRepository) Update(user *model.User) error {
	return database.DB.Save(user).Error
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/modules/auth/repository/
git commit -m "feat: add user repository for database operations"
```

---

### Task 2.2: Auth Service

**Files:**
- Create: `server/internal/modules/auth/service/auth_service.go`

- [ ] **Step 1: 创建 Auth Service**

```go
// server/internal/modules/auth/service/auth_service.go
package service

import (
	"errors"
	"vibeblog/server/internal/modules/auth/model"
	"vibeblog/server/internal/modules/auth/repository"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/utils"
)

type AuthService struct {
	repo   *repository.UserRepository
	config *config.JWTConfig
}

func NewAuthService(cfg *config.JWTConfig) *AuthService {
	return &AuthService{
		repo:   repository.NewUserRepository(),
		config: cfg,
	}
}

type LoginInput struct {
	Username string
	Password string
}

type LoginOutput struct {
	AccessToken  string
	RefreshToken string
	User         *model.User
}

func (s *AuthService) Login(input LoginInput) (*LoginOutput, error) {
	user, err := s.repo.FindByUsername(input.Username)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	if !utils.CheckPassword(input.Password, user.Password) {
		return nil, errors.New("密码错误")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	return &LoginOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
}

type RefreshInput struct {
	RefreshToken string
}

type RefreshOutput struct {
	AccessToken  string
	RefreshToken string
}

func (s *AuthService) Refresh(input RefreshInput) (*RefreshOutput, error) {
	claims, err := utils.ParseToken(input.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	user, err := s.repo.FindByID(claims.UserID)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Username, user.Role, s.config)
	if err != nil {
		return nil, err
	}

	return &RefreshOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *AuthService) InitDefaultUser() error {
	// 检查是否已存在用户
	_, err := s.repo.FindByUsername("admin")
	if err == nil {
		return nil // 已存在
	}

	// 创建默认管理员
	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}

	user := &model.User{
		Username: "admin",
		Password: hashedPassword,
		Nickname: "博主",
		Role:     "author",
	}

	return s.repo.Create(user)
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/modules/auth/service/
git commit -m "feat: add auth service with login and refresh token logic"
```

---

### Task 2.3: Auth Handler

**Files:**
- Create: `server/internal/modules/auth/handler/auth_handler.go`

- [ ] **Step 1: 创建 Auth Handler**

```go
// server/internal/modules/auth/handler/auth_handler.go
package handler

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/auth/service"
	"vibeblog/server/internal/shared/utils"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{service: svc}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, "用户名和密码不能为空")
		return
	}

	result, err := h.service.Login(service.LoginInput{
		Username: req.Username,
		Password: req.Password,
	})
	if err != nil {
		utils.Unauthorized(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"access_token":  result.AccessToken,
		"refresh_token": result.RefreshToken,
		"user":          result.User,
	})
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationError(c, "refresh_token 不能为空")
		return
	}

	result, err := h.service.Refresh(service.RefreshInput{
		RefreshToken: req.RefreshToken,
	})
	if err != nil {
		utils.Unauthorized(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"access_token":  result.AccessToken,
		"refresh_token": result.RefreshToken,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	// 客户端清除 token 即可
	utils.SuccessWithMessage(c, nil, "登出成功")
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/modules/auth/handler/
git commit -m "feat: add auth HTTP handlers for login, refresh, logout"
```

---

### Task 2.4: JWT 认证中间件

**Files:**
- Create: `server/internal/shared/middleware/auth.go`

- [ ] **Step 1: 创建认证中间件**

```go
// server/internal/shared/middleware/auth.go
package middleware

import (
	"strings"
	"vibeblog/server/internal/shared/utils"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Unauthorized(c, "未提供认证信息")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if parts[0] != "Bearer" || len(parts) != 2 {
			utils.Unauthorized(c, "认证格式错误")
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			utils.Unauthorized(c, "token 无效或已过期")
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func GetUserID(c *gin.Context) uint {
	if id, exists := c.Get("user_id"); exists {
		return id.(uint)
	}
	return 0
}

func GetUsername(c *gin.Context) string {
	if name, exists := c.Get("username"); exists {
		return name.(string)
	}
	return ""
}
```

- [ ] **Step 2: Commit**

```bash
git add server/internal/shared/middleware/auth.go
git commit -m "feat: add JWT authentication middleware"
```

---

### Task 2.5: 注册认证路由

**Files:**
- Modify: `server/internal/router/router.go`
- Modify: `server/cmd/main.go`

- [ ] **Step 1: 更新路由注册**

```go
// server/internal/router/router.go
package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/auth/handler"
	"vibeblog/server/internal/modules/auth/service"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/middleware"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")

	// 认证路由
	authSvc := service.NewAuthService(&cfg.JWT)
	authHdl := handler.NewAuthHandler(authSvc)

	auth := api.Group("/auth")
	{
		auth.POST("/login", authHdl.Login)
		auth.POST("/refresh", authHdl.Refresh)
		auth.POST("/logout", authHdl.Logout)
	}

	return r
}
```

- [ ] **Step 2: 更新入口文件**

```go
// server/cmd/main.go
// 将 router.SetupRouter() 改为 router.SetupRouter(cfg)
r := router.SetupRouter(cfg)

// 初始化默认用户
authSvc := service.NewAuthService(&cfg.JWT)
if err := authSvc.InitDefaultUser(); err != nil {
	log.Printf("Init default user failed: %v", err)
}
```

- [ ] **Step 3: 验证认证 API**

```bash
# 启动服务
docker-compose up -d server

# 测试登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: 返回 access_token, refresh_token, user 信息
```

- [ ] **Step 4: Commit**

```bash
git add server/internal/router/router.go server/cmd/main.go
git commit -m "feat: register auth routes and init default admin user"
```

---

### Task 2.6: 前端 Auth Store

**Files:**
- Create: `web/src/modules/auth/stores/authStore.ts`

- [ ] **Step 1: 创建 Auth Store**

```typescript
// web/src/modules/auth/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/shared/types/models'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  setTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
)
```

- [ ] **Step 2: Commit**

```bash
git add web/src/modules/auth/stores/
git commit -m "feat: add auth store with Zustand"
```

---

### Task 2.7: 前端 Auth API

**Files:**
- Create: `web/src/modules/auth/api/authApi.ts`

- [ ] **Step 1: 创建 Auth API**

```typescript
// web/src/modules/auth/api/authApi.ts
import request from '@/shared/utils/request'
import type { ApiResponse } from '@/shared/types/api'
import type { User } from '@/shared/types/models'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

interface RefreshResponse {
  access_token: string
  refresh_token: string
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const res = await request.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return res.data.data
  },

  refresh: async (refreshToken: string) => {
    const res = await request.post<ApiResponse<RefreshResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data.data
  },

  logout: async () => {
    const res = await request.post<ApiResponse<null>>('/auth/logout')
    return res.data
  },
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/modules/auth/api/
git commit -m "feat: add auth API client functions"
```

---

### Task 2.8: 前端登录页面

**Files:**
- Create: `web/src/modules/auth/pages/LoginPage.tsx`
- Create: `web/src/shared/hooks/useAuth.ts`

- [ ] **Step 1: 创建 useAuth Hook**

```typescript
// web/src/shared/hooks/useAuth.ts
import { useAuthStore } from '@/modules/auth/stores/authStore'
import { authApi } from '@/modules/auth/api/authApi'

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth, setTokens } = useAuthStore()

  const login = async (username: string, password: string) => {
    const result = await authApi.login({ username, password })
    setAuth(result.user, result.access_token, result.refresh_token)
    return result
  }

  const logout = async () => {
    await authApi.logout()
    clearAuth()
  }

  const refresh = async () => {
    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) throw new Error('No refresh token')
    const result = await authApi.refresh(refreshToken)
    setTokens(result.access_token, result.refresh_token)
    return result
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    refresh,
  }
}
```

- [ ] **Step 2: 创建登录页面**

```tsx
// web/src/modules/auth/pages/LoginPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/shared/hooks/useAuth'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">VibeBlog 登录</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              placeholder="admin"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              placeholder="admin123"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 更新 App.tsx 注册路由**

```tsx
// web/src/App.tsx 添加登录路由
import LoginPage from '@/modules/auth/pages/LoginPage'

// 在 Routes 中添加
<Route path="/login" element={<LoginPage />} />
```

- [ ] **Step 4: 配置路径别名**

```typescript
// web/vite.config.ts 添加路径别名
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```json
// web/tsconfig.json 添加 paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 5: 验证登录**

```bash
# 访问 http://localhost:5173/login
# 使用 admin / admin123 登录
# Expected: 登录成功后跳转到 /admin
```

- [ ] **Step 6: Commit**

```bash
git add web/src/modules/auth/pages/ web/src/shared/hooks/ web/vite.config.ts web/tsconfig.json web/src/App.tsx
git commit -m "feat: add login page with auth hook and route alias"
```

---

## Phase 3-5 简要概述

由于篇幅限制，Phase 3-5 的详细任务在后续计划中补充。以下是主要任务概览：

### Phase 3: 博客前台
- Task 3.1: 文章 Repository/Service/Handler
- Task 3.2: 标签 Repository/Service/Handler
- Task 3.3: 站点配置 Repository/Service/Handler
- Task 3.4: 前端博客 API 模块
- Task 3.5: 前端布局组件 (MainLayout, Navbar)
- Task 3.6: 文章列表页面
- Task 3.7: 文章详情页面
- Task 3.8: 标签筛选页面
- Task 3.9: 归档页面
- Task 3.10: 搜索页面
- Task 3.11: 关于我页面

### Phase 4: 博客后台
- Task 4.1: Admin 路由保护
- Task 4.2: Admin 文章 Handler (CRUD + 发布 + 定时)
- Task 4.3: Admin 标签 Handler (CRUD)
- Task 4.4: Admin 站点配置 Handler
- Task 4.5: 定时发布调度器
- Task 4.6: 前端 Admin 布局
- Task 4.7: 文章管理页面
- Task 4.8: 文章编辑页面 (Markdown 编辑器)
- Task 4.9: 标签管理页面

### Phase 5: 优化与部署
- Task 5.1: Redis 缓存实现
- Task 5.2: 缓存清除策略
- Task 5.3: 前端 SEO 组件
- Task 5.4: 生产环境 Dockerfile
- Task 5.5: Nginx 配置
- Task 5.6: 后端单元测试
- Task 5.7: 前端组件测试
- Task 5.8: E2E 测试

---

## 快速启动命令汇总

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 后端开发（热重载）
cd server && air

# 前端开发
cd web && npm run dev

# 数据库迁移检查
docker-compose exec mysql mysql -u vibeblog -pvibeblog123 vibe_blog -e "SHOW TABLES"

# 测试登录 API
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 依赖清单

### Go 后端依赖
- github.com/gin-gonic/gin
- gorm.io/gorm
- gorm.io/driver/mysql
- github.com/redis/go-redis/v9
- github.com/golang-jwt/jwt/v5
- golang.org/x/crypto/bcrypt

### Node 前端依赖
- react
- react-dom
- react-router-dom
- @tanstack/react-query
- zustand
- axios
- tailwindcss
- postcss
- autoprefixer
- bytemd
- @bytemd/react
- @bytemd/plugin-gfm
- @bytemd/plugin-highlight