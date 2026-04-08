# Phase 3: 博客前台功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现博客前台功能，包括文章列表、文章详情、标签筛选、归档、搜索和关于我页面。

**Architecture:** 后端实现 Blog Repository/Service/Handler 三层架构，前端使用 TanStack Query 管理数据状态，Tailwind CSS + shadcn/ui 构建响应式页面。

**Tech Stack:** Go + Gin + GORM, React + TypeScript + TanStack Query + Tailwind CSS

---

## 文件结构规划

```
server/internal/modules/blog/
├── model/
│   ├── article.go          # 已存在
│   ├── tag.go              # 已存在
│   └── site_config.go      # 已存在
├── repository/
│   ├── article_repo.go     # 新建 - 文章数据访问
│   ├── tag_repo.go         # 新建 - 标签数据访问
│   └── site_config_repo.go # 新建 - 站点配置数据访问
├── service/
│   ├── article_service.go  # 新建 - 文章业务逻辑
│   ├── tag_service.go      # 新建 - 标签业务逻辑
│   └── site_service.go     # 新建 - 站点配置业务逻辑
└── handler/
    └── blog_handler.go     # 新建 - 公开API处理器

web/src/modules/blog/
├── api/
│   └── blogApi.ts          # 新建 - 博客API调用
├── pages/
│   ├── HomePage.tsx        # 新建 - 首页
│   ├── ArticleListPage.tsx # 新建 - 文章列表
│   ├── ArticleDetailPage.tsx # 新建 - 文章详情
│   ├── TagPage.tsx         # 新建 - 标签筛选页
│   ├── ArchivePage.tsx     # 新建 - 归档页
│   ├── SearchPage.tsx      # 新建 - 搜索页
│   └── AboutPage.tsx       # 新建 - 关于我
└── components/
    ├── ArticleCard.tsx     # 新建 - 文章卡片
    ├── TagBadge.tsx        # 新建 - 标签徽章
    ├── Pagination.tsx      # 新建 - 分页组件
    └── MarkdownRenderer.tsx # 新建 - Markdown渲染

web/src/layouts/
└── MainLayout.tsx          # 新建 - 前台布局

web/src/shared/components/
├── Navbar.tsx              # 新建 - 导航栏
└── Loading.tsx             # 新建 - 加载组件
```

---

## Task 3.1: 文章 Repository

**Files:**
- Create: `server/internal/modules/blog/repository/article_repo.go`

- [ ] **Step 1: 创建 Article Repository**

```go
// server/internal/modules/blog/repository/article_repo.go
package repository

import (
	"time"
	"vibeblog/server/internal/modules/blog/model"

	"gorm.io/gorm"
)

type ArticleRepository struct {
	db *gorm.DB
}

func NewArticleRepository(db *gorm.DB) *ArticleRepository {
	return &ArticleRepository{db: db}
}

// ArticleListQuery 文章列表查询参数
type ArticleListQuery struct {
	Page    int
	Limit   int
	TagSlug string
	Status  model.ArticleStatus
	Keyword string
}

// FindList 分页查询文章列表
func (r *ArticleRepository) FindList(query ArticleListQuery) ([]model.Article, int64, error) {
	var articles []model.Article
	var total int64

	db := r.db.Model(&model.Article{}).Preload("Tags")

	if query.TagSlug != "" {
		db = db.Joins("JOIN article_tags ON article_tags.article_id = articles.id").
			Joins("JOIN tags ON tags.id = article_tags.tag_id").
			Where("tags.slug = ?", query.TagSlug)
	}

	if query.Status != "" {
		db = db.Where("articles.status = ?", query.Status)
	}

	if query.Keyword != "" {
		keyword := "%" + query.Keyword + "%"
		db = db.Where("articles.title LIKE ? OR articles.summary LIKE ?", keyword, keyword)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (query.Page - 1) * query.Limit
	if err := db.Order("articles.published_at DESC").
		Offset(offset).Limit(query.Limit).
		Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	return articles, total, nil
}

// FindByID 根据ID查询文章详情
func (r *ArticleRepository) FindByID(id uint) (*model.Article, error) {
	var article model.Article
	if err := r.db.Preload("Tags").First(&article, id).Error; err != nil {
		return nil, err
	}
	return &article, nil
}

// IncrementViewCount 增加阅读量
func (r *ArticleRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.Article{}).Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// FindArchive 获取归档数据
func (r *ArticleRepository) FindArchive() (map[int]map[int]int64, error) {
	type ArchiveRow struct {
		Year  int
		Month int
		Count int64
	}

	var rows []ArchiveRow
	err := r.db.Model(&model.Article{}).
		Select("YEAR(published_at) as year, MONTH(published_at) as month, COUNT(*) as count").
		Where("status = ? AND published_at <= ?", model.StatusPublished, time.Now()).
		Group("YEAR(published_at), MONTH(published_at)").
		Order("year DESC, month DESC").
		Scan(&rows).Error

	if err != nil {
		return nil, err
	}

	archive := make(map[int]map[int]int64)
	for _, row := range rows {
		if archive[row.Year] == nil {
			archive[row.Year] = make(map[int]int64)
		}
		archive[row.Year][row.Month] = row.Count
	}

	return archive, nil
}

// FindByYearMonth 根据年月查询文章
func (r *ArticleRepository) FindByYearMonth(year, month int) ([]model.Article, error) {
	var articles []model.Article

	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0)

	err := r.db.Preload("Tags").
		Where("status = ? AND published_at >= ? AND published_at < ?",
			model.StatusPublished, startDate, endDate).
		Order("published_at DESC").
		Find(&articles).Error

	return articles, err
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/server && go build ./...
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/modules/blog/repository/article_repo.go
git commit -m "feat: add article repository for blog module"
```

---

## Task 3.2: 标签 Repository

**Files:**
- Create: `server/internal/modules/blog/repository/tag_repo.go`

- [ ] **Step 1: 创建 Tag Repository**

```go
// server/internal/modules/blog/repository/tag_repo.go
package repository

import (
	"vibeblog/server/internal/modules/blog/model"

	"gorm.io/gorm"
)

type TagRepository struct {
	db *gorm.DB
}

func NewTagRepository(db *gorm.DB) *TagRepository {
	return &TagRepository{db: db}
}

// FindAll 获取所有标签（含文章数量）
func (r *TagRepository) FindAll() ([]model.Tag, error) {
	var tags []model.Tag

	type TagWithCount struct {
		model.Tag
		ArticleCount int64 `json:"article_count"`
	}

	var results []TagWithCount
	err := r.db.Model(&model.Tag{}).
		Select("tags.*, COUNT(article_tags.article_id) as article_count").
		Joins("LEFT JOIN article_tags ON article_tags.tag_id = tags.id").
		Joins("LEFT JOIN articles ON articles.id = article_tags.article_id AND articles.status = ?", model.StatusPublished).
		Group("tags.id").
		Order("article_count DESC, tags.name ASC").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	tags = make([]model.Tag, len(results))
	for i, r := range results {
		tags[i] = r.Tag
		tags[i].Ext = map[string]any{"article_count": r.ArticleCount}
	}

	return tags, nil
}

// FindBySlug 根据Slug查询标签
func (r *TagRepository) FindBySlug(slug string) (*model.Tag, error) {
	var tag model.Tag
	if err := r.db.Where("slug = ?", slug).First(&tag).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/server && go build ./...
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/modules/blog/repository/tag_repo.go
git commit -m "feat: add tag repository for blog module"
```

---

## Task 3.3: 站点配置 Repository

**Files:**
- Create: `server/internal/modules/blog/repository/site_config_repo.go`

- [ ] **Step 1: 创建 SiteConfig Repository**

```go
// server/internal/modules/blog/repository/site_config_repo.go
package repository

import (
	"vibeblog/server/internal/modules/blog/model"

	"gorm.io/gorm"
)

type SiteConfigRepository struct {
	db *gorm.DB
}

func NewSiteConfigRepository(db *gorm.DB) *SiteConfigRepository {
	return &SiteConfigRepository{db: db}
}

// GetAll 获取所有配置（返回map）
func (r *SiteConfigRepository) GetAll() (map[string]string, error) {
	var configs []model.SiteConfig
	if err := r.db.Find(&configs).Error; err != nil {
		return nil, err
	}

	result := make(map[string]string)
	for _, c := range configs {
		result[c.ConfigKey] = c.Value
	}
	return result, nil
}

// GetByKey 根据key获取配置值
func (r *SiteConfigRepository) GetByKey(key string) (string, error) {
	var config model.SiteConfig
	if err := r.db.Where("config_key = ?", key).First(&config).Error; err != nil {
		return "", err
	}
	return config.Value, nil
}

// Upsert 创建或更新配置
func (r *SiteConfigRepository) Upsert(key, value string) error {
	var config model.SiteConfig
	result := r.db.Where("config_key = ?", key).First(&config)

	if result.Error == gorm.ErrRecordNotFound {
		config = model.SiteConfig{
			ConfigKey: key,
			Value:     value,
		}
		return r.db.Create(&config).Error
	}

	return r.db.Model(&config).Update("value", value).Error
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/server && go build ./...
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/modules/blog/repository/site_config_repo.go
git commit -m "feat: add site config repository for blog module"
```

---

## Task 3.4: 博客 Service

**Files:**
- Create: `server/internal/modules/blog/service/article_service.go`
- Create: `server/internal/modules/blog/service/tag_service.go`
- Create: `server/internal/modules/blog/service/site_service.go`

- [ ] **Step 1: 创建 Article Service**

```go
// server/internal/modules/blog/service/article_service.go
package service

import (
	"vibeblog/server/internal/modules/blog/model"
	"vibeblog/server/internal/modules/blog/repository"
)

type ArticleService struct {
	repo *repository.ArticleRepository
}

func NewArticleService(repo *repository.ArticleRepository) *ArticleService {
	return &ArticleService{repo: repo}
}

type ArticleListResult struct {
	Articles   []model.Article `json:"articles"`
	Pagination struct {
		Page  int   `json:"page"`
		Limit int   `json:"limit"`
		Total int64 `json:"total"`
		Pages int   `json:"pages"`
	} `json:"pagination"`
}

// GetPublishedList 获取已发布文章列表
func (s *ArticleService) GetPublishedList(page, limit int, tagSlug string) (*ArticleListResult, error) {
	query := repository.ArticleListQuery{
		Page:   page,
		Limit:  limit,
		Status: model.StatusPublished,
	}

	if tagSlug != "" {
		query.TagSlug = tagSlug
	}

	articles, total, err := s.repo.FindList(query)
	if err != nil {
		return nil, err
	}

	pages := int(total) / limit
	if int(total)%limit > 0 {
		pages++
	}

	result := &ArticleListResult{
		Articles: articles,
	}
	result.Pagination.Page = page
	result.Pagination.Limit = limit
	result.Pagination.Total = total
	result.Pagination.Pages = pages

	return result, nil
}

// GetDetail 获取文章详情
func (s *ArticleService) GetDetail(id uint) (*model.Article, error) {
	article, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// 增加阅读量
	_ = s.repo.IncrementViewCount(id)

	return article, nil
}

// Search 搜索文章
func (s *ArticleService) Search(keyword string, limit int) ([]model.Article, error) {
	query := repository.ArticleListQuery{
		Page:    1,
		Limit:   limit,
		Status:  model.StatusPublished,
		Keyword: keyword,
	}

	articles, _, err := s.repo.FindList(query)
	return articles, err
}

// GetArchive 获取归档数据
func (s *ArticleService) GetArchive() (map[int]map[int]int64, error) {
	return s.repo.FindArchive()
}

// GetArticlesByMonth 获取指定年月的文章
func (s *ArticleService) GetArticlesByMonth(year, month int) ([]model.Article, error) {
	return s.repo.FindByYearMonth(year, month)
}
```

- [ ] **Step 2: 创建 Tag Service**

```go
// server/internal/modules/blog/service/tag_service.go
package service

import (
	"vibeblog/server/internal/modules/blog/model"
	"vibeblog/server/internal/modules/blog/repository"
)

type TagService struct {
	repo *repository.TagRepository
}

func NewTagService(repo *repository.TagRepository) *TagService {
	return &TagService{repo: repo}
}

// GetAll 获取所有标签
func (s *TagService) GetAll() ([]model.Tag, error) {
	return s.repo.FindAll()
}

// GetBySlug 根据Slug获取标签
func (s *TagService) GetBySlug(slug string) (*model.Tag, error) {
	return s.repo.FindBySlug(slug)
}
```

- [ ] **Step 3: 创建 Site Service**

```go
// server/internal/modules/blog/service/site_service.go
package service

import (
	"vibeblog/server/internal/modules/blog/repository"
)

type SiteService struct {
	repo *repository.SiteConfigRepository
}

func NewSiteService(repo *repository.SiteConfigRepository) *SiteService {
	return &SiteService{repo: repo}
}

// GetConfig 获取站点配置
func (s *SiteService) GetConfig() (map[string]string, error) {
	return s.repo.GetAll()
}
```

- [ ] **Step 4: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/server && go build ./...
# Expected: no errors
```

- [ ] **Step 5: Commit**

```bash
git add server/internal/modules/blog/service/
git commit -m "feat: add blog services (article, tag, site)"
```

---

## Task 3.5: 博客 Handler

**Files:**
- Create: `server/internal/modules/blog/handler/blog_handler.go`

- [ ] **Step 1: 创建 Blog Handler**

```go
// server/internal/modules/blog/handler/blog_handler.go
package handler

import (
	"net/http"
	"strconv"
	"vibeblog/server/internal/modules/blog/service"
	"vibeblog/server/internal/shared/utils"

	"github.com/gin-gonic/gin"
)

type BlogHandler struct {
	articleSvc *service.ArticleService
	tagSvc     *service.TagService
	siteSvc    *service.SiteService
}

func NewBlogHandler(articleSvc *service.ArticleService, tagSvc *service.TagService, siteSvc *service.SiteService) *BlogHandler {
	return &BlogHandler{
		articleSvc: articleSvc,
		tagSvc:     tagSvc,
		siteSvc:    siteSvc,
	}
}

// GetArticles 获取文章列表
// GET /api/blog/articles?page=1&limit=10&tag=go
func (h *BlogHandler) GetArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	tagSlug := c.Query("tag")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	result, err := h.articleSvc.GetPublishedList(page, limit, tagSlug)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "DATABASE_ERROR", "获取文章列表失败")
		return
	}

	utils.SuccessResponse(c, result)
}

// GetArticle 获取文章详情
// GET /api/blog/articles/:id
func (h *BlogHandler) GetArticle(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "INVALID_ID", "无效的文章ID")
		return
	}

	article, err := h.articleSvc.GetDetail(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "ARTICLE_NOT_FOUND", "文章不存在")
		return
	}

	utils.SuccessResponse(c, article)
}

// GetTags 获取标签列表
// GET /api/blog/tags
func (h *BlogHandler) GetTags(c *gin.Context) {
	tags, err := h.tagSvc.GetAll()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "DATABASE_ERROR", "获取标签列表失败")
		return
	}

	utils.SuccessResponse(c, tags)
}

// GetArchive 获取归档数据
// GET /api/blog/archive
func (h *BlogHandler) GetArchive(c *gin.Context) {
	archive, err := h.articleSvc.GetArchive()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "DATABASE_ERROR", "获取归档数据失败")
		return
	}

	utils.SuccessResponse(c, archive)
}

// Search 搜索文章
// GET /api/blog/search?q=keyword&limit=10
func (h *BlogHandler) Search(c *gin.Context) {
	keyword := c.Query("q")
	if keyword == "" {
		utils.SuccessResponse(c, []interface{}{})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if limit > 50 {
		limit = 50
	}

	articles, err := h.articleSvc.Search(keyword, limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "DATABASE_ERROR", "搜索失败")
		return
	}

	utils.SuccessResponse(c, articles)
}

// GetSiteConfig 获取站点配置
// GET /api/site/config
func (h *BlogHandler) GetSiteConfig(c *gin.Context) {
	config, err := h.siteSvc.GetConfig()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "DATABASE_ERROR", "获取站点配置失败")
		return
	}

	utils.SuccessResponse(c, config)
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/server && go build ./...
# Expected: no errors
```

- [ ] **Step 3: Commit**

```bash
git add server/internal/modules/blog/handler/
git commit -m "feat: add blog handler for public API"
```

---

## Task 3.6: 更新路由注册

**Files:**
- Modify: `server/internal/router/router.go`

- [ ] **Step 1: 更新路由配置**

```go
// server/internal/router/router.go
package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/auth/handler"
	"vibeblog/server/internal/modules/auth/service"
	blogHandler "vibeblog/server/internal/modules/blog/handler"
	blogRepo "vibeblog/server/internal/modules/blog/repository"
	blogService "vibeblog/server/internal/modules/blog/service"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/database"
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

	// 博客路由
	articleRepo := blogRepo.NewArticleRepository(database.DB)
	tagRepo := blogRepo.NewTagRepository(database.DB)
	siteConfigRepo := blogRepo.NewSiteConfigRepository(database.DB)

	articleSvc := blogService.NewArticleService(articleRepo)
	tagSvc := blogService.NewTagService(tagRepo)
	siteSvc := blogService.NewSiteService(siteConfigRepo)

	blogHdl := blogHandler.NewBlogHandler(articleSvc, tagSvc, siteSvc)

	blog := api.Group("/blog")
	{
		blog.GET("/articles", blogHdl.GetArticles)
		blog.GET("/articles/:id", blogHdl.GetArticle)
		blog.GET("/tags", blogHdl.GetTags)
		blog.GET("/archive", blogHdl.GetArchive)
		blog.GET("/search", blogHdl.Search)
	}

	// 站点配置路由
	site := api.Group("/site")
	{
		site.GET("/config", blogHdl.GetSiteConfig)
	}

	return r
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/max/Documents/code/vibeBlog/server && go build ./...
# Expected: no errors
```

- [ ] **Step 3: 重启服务验证API**

```bash
docker-compose restart server
curl -s http://localhost:8080/api/blog/articles | head -20
# Expected: {"data":{"articles":[],"pagination":...}}
```

- [ ] **Step 4: Commit**

```bash
git add server/internal/router/router.go
git commit -m "feat: add blog public routes to router"
```

---

## Task 3.7: 前端博客 API

**Files:**
- Create: `web/src/modules/blog/api/blogApi.ts`

- [ ] **Step 1: 创建博客 API 模块**

```typescript
// web/src/modules/blog/api/blogApi.ts
import request from '@/shared/utils/request'
import type { Article, Tag } from '@/shared/types/models'
import type { ApiResponse } from '@/shared/types/api'

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ArticleListResponse {
  articles: Article[]
  pagination: Pagination
}

interface ArchiveData {
  [year: string]: { [month: string]: number }
}

interface SiteConfigResponse {
  about_content: string
  avatar: string
  social_links: string
}

export const blogApi = {
  // 获取文章列表
  getArticles: (params: { page?: number; limit?: number; tag?: string }) =>
    request.get<ApiResponse<ArticleListResponse>>('/blog/articles', { params }),

  // 获取文章详情
  getArticle: (id: number) =>
    request.get<ApiResponse<Article>>(`/blog/articles/${id}`),

  // 获取标签列表
  getTags: () =>
    request.get<ApiResponse<Tag[]>>('/blog/tags'),

  // 获取归档数据
  getArchive: () =>
    request.get<ApiResponse<ArchiveData>>('/blog/archive'),

  // 搜索文章
  search: (params: { q: string; limit?: number }) =>
    request.get<ApiResponse<Article[]>>('/blog/search', { params }),

  // 获取站点配置
  getSiteConfig: () =>
    request.get<ApiResponse<SiteConfigResponse>>('/site/config'),
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/modules/blog/api/blogApi.ts
git commit -m "feat: add blog API module for frontend"
```

---

## Task 3.8: 共享组件

**Files:**
- Create: `web/src/shared/components/Loading.tsx`
- Create: `web/src/shared/components/Navbar.tsx`

- [ ] **Step 1: 创建 Loading 组件**

```tsx
// web/src/shared/components/Loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
```

- [ ] **Step 2: 创建 Navbar 组件**

```tsx
// web/src/shared/components/Navbar.tsx
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-gray-900">
              VibeBlog
            </Link>
            <div className="hidden sm:flex space-x-4">
              <Link to="/blog" className="text-gray-600 hover:text-gray-900">
                博客
              </Link>
              <Link to="/blog/tag" className="text-gray-600 hover:text-gray-900">
                标签
              </Link>
              <Link to="/blog/archive" className="text-gray-600 hover:text-gray-900">
                归档
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-gray-900">
                关于
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              登录
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/shared/components/
git commit -m "feat: add shared components (Loading, Navbar)"
```

---

## Task 3.9: 博客组件

**Files:**
- Create: `web/src/modules/blog/components/ArticleCard.tsx`
- Create: `web/src/modules/blog/components/TagBadge.tsx`
- Create: `web/src/modules/blog/components/Pagination.tsx`
- Create: `web/src/modules/blog/components/MarkdownRenderer.tsx`

- [ ] **Step 1: 创建 ArticleCard 组件**

```tsx
// web/src/modules/blog/components/ArticleCard.tsx
import { Link } from 'react-router-dom'
import type { Article } from '@/shared/types/models'
import TagBadge from './TagBadge'

interface Props {
  article: Article
}

export default function ArticleCard({ article }: Props) {
  return (
    <article className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <Link to={`/blog/article/${article.id}`}>
        <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 mb-2">
          {article.title}
        </h2>
      </Link>

      <div className="flex flex-wrap gap-2 mb-3">
        {article.tags?.map((tag) => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">
        {article.summary}
      </p>

      <div className="flex items-center text-sm text-gray-500">
        <span>
          {article.published_at
            ? new Date(article.published_at).toLocaleDateString('zh-CN')
            : '未发布'}
        </span>
        <span className="mx-2">·</span>
        <span>{article.view_count} 阅读</span>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: 创建 TagBadge 组件**

```tsx
// web/src/modules/blog/components/TagBadge.tsx
import { Link } from 'react-router-dom'
import type { Tag } from '@/shared/types/models'

interface Props {
  tag: Tag
  showCount?: boolean
}

export default function TagBadge({ tag, showCount = false }: Props) {
  return (
    <Link
      to={`/blog/tag/${tag.slug}`}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
    >
      {tag.name}
      {showCount && tag.article_count !== undefined && (
        <span className="ml-1 text-blue-600">({tag.article_count})</span>
      )}
    </Link>
  )
}
```

- [ ] **Step 3: 创建 Pagination 组件**

```tsx
// web/src/modules/blog/components/Pagination.tsx
import { Link } from 'react-router-dom'

interface Props {
  current: number
  total: number
  baseUrl: string
}

export default function Pagination({ current, total, baseUrl }: Props) {
  if (total <= 1) return null

  const pages = []
  for (let i = 1; i <= total; i++) {
    pages.push(i)
  }

  return (
    <nav className="flex justify-center space-x-1 mt-8">
      {current > 1 && (
        <Link
          to={`${baseUrl}?page=${current - 1}`}
          className="px-3 py-2 rounded border text-gray-600 hover:bg-gray-50"
        >
          上一页
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          to={`${baseUrl}?page=${p}`}
          className={`px-3 py-2 rounded ${
            p === current
              ? 'bg-blue-600 text-white'
              : 'border text-gray-600 hover:bg-gray-50'
          }`}
        >
          {p}
        </Link>
      ))}

      {current < total && (
        <Link
          to={`${baseUrl}?page=${current + 1}`}
          className="px-3 py-2 rounded border text-gray-600 hover:bg-gray-50"
        >
          下一页
        </Link>
      )}
    </nav>
  )
}
```

- [ ] **Step 4: 创建 MarkdownRenderer 组件**

```tsx
// web/src/modules/blog/components/MarkdownRenderer.tsx
import { Viewer } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import 'bytemd/dist/index.css'
import 'highlight.js/styles/github.css'

interface Props {
  content: string
}

const plugins = [gfm(), highlight()]

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-slate max-w-none">
      <Viewer value={content} plugins={plugins} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/blog/components/
git commit -m "feat: add blog components (ArticleCard, TagBadge, Pagination, MarkdownRenderer)"
```

---

## Task 3.10: 主布局

**Files:**
- Create: `web/src/layouts/MainLayout.tsx`

- [ ] **Step 1: 创建 MainLayout**

```tsx
// web/src/layouts/MainLayout.tsx
import { Outlet } from 'react-router-dom'
import Navbar from '@/shared/components/Navbar'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} VibeBlog. Powered by React & Go.
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/layouts/MainLayout.tsx
git commit -m "feat: add MainLayout for frontend"
```

---

## Task 3.11: 首页和文章列表页

**Files:**
- Create: `web/src/modules/blog/pages/HomePage.tsx`
- Create: `web/src/modules/blog/pages/ArticleListPage.tsx`

- [ ] **Step 1: 创建 HomePage**

```tsx
// web/src/modules/blog/pages/HomePage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Loading from '@/shared/components/Loading'

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page: 1, limit: 5 }],
    queryFn: () => blogApi.getArticles({ page: 1, limit: 5 }),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const articles = data?.data?.data?.articles || []

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          欢迎来到 VibeBlog
        </h1>
        <p className="text-gray-600">
          一个简洁的个人博客，记录技术、生活与思考。
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">最新文章</h2>
          <Link to="/blog" className="text-blue-600 hover:text-blue-700">
            查看全部 →
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            暂无文章
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
```

- [ ] **Step 2: 创建 ArticleListPage**

```tsx
// web/src/modules/blog/pages/ArticleListPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Pagination from '@/modules/blog/components/Pagination'
import Loading from '@/shared/components/Loading'

export default function ArticleListPage() {
  const [searchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const tag = searchParams.get('tag') || undefined

  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', { page, limit: 10, tag }],
    queryFn: () => blogApi.getArticles({ page, limit: 10, tag }),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const result = data?.data?.data
  const articles = result?.articles || []
  const pagination = result?.pagination

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {tag ? `标签: ${tag}` : '全部文章'}
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无文章
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {pagination && (
            <Pagination
              current={pagination.page}
              total={pagination.pages}
              baseUrl={tag ? `/blog?tag=${tag}` : '/blog'}
            />
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/modules/blog/pages/HomePage.tsx web/src/modules/blog/pages/ArticleListPage.tsx
git commit -m "feat: add HomePage and ArticleListPage"
```

---

## Task 3.12: 文章详情页

**Files:**
- Create: `web/src/modules/blog/pages/ArticleDetailPage.tsx`

- [ ] **Step 1: 创建 ArticleDetailPage**

```tsx
// web/src/modules/blog/pages/ArticleDetailPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import MarkdownRenderer from '@/modules/blog/components/MarkdownRenderer'
import TagBadge from '@/modules/blog/components/TagBadge'
import Loading from '@/shared/components/Loading'

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => blogApi.getArticle(parseInt(id!, 10)),
    enabled: !!id,
  })

  if (isLoading) return <Loading />
  if (error || !data?.data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">文章不存在</p>
        <Link to="/blog" className="text-blue-600 hover:text-blue-700">
          返回列表
        </Link>
      </div>
    )
  }

  const article = data.data.data

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <span>
            {article.published_at
              ? new Date(article.published_at).toLocaleDateString('zh-CN')
              : '未发布'}
          </span>
          <span>·</span>
          <span>{article.view_count} 阅读</span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {article.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </header>

      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <MarkdownRenderer content={article.content} />
    </article>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/modules/blog/pages/ArticleDetailPage.tsx
git commit -m "feat: add ArticleDetailPage with Markdown rendering"
```

---

## Task 3.13: 标签页、归档页、搜索页、关于页

**Files:**
- Create: `web/src/modules/blog/pages/TagPage.tsx`
- Create: `web/src/modules/blog/pages/ArchivePage.tsx`
- Create: `web/src/modules/blog/pages/SearchPage.tsx`
- Create: `web/src/modules/blog/pages/AboutPage.tsx`

- [ ] **Step 1: 创建 TagPage**

```tsx
// web/src/modules/blog/pages/TagPage.tsx
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'
import TagBadge from '@/modules/blog/components/TagBadge'
import Loading from '@/shared/components/Loading'

export default function TagPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: () => blogApi.getTags(),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const tags = data?.data?.data || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">标签</h1>

      {tags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无标签</div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} showCount />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 创建 ArchivePage**

```tsx
// web/src/modules/blog/pages/ArchivePage.tsx
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import Loading from '@/shared/components/Loading'

export default function ArchivePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['archive'],
    queryFn: () => blogApi.getArchive(),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const archive = data?.data?.data || {}
  const years = Object.keys(archive).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">归档</h1>

      {years.length === 0 ? (
        <div className="text-center py-12 text-gray-500">暂无文章</div>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{year} 年</h2>
              <div className="space-y-2 pl-4">
                {Object.entries(archive[year])
                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                  .map(([month, count]) => (
                    <Link
                      key={month}
                      to={`/blog/archive/${year}/${month}`}
                      className="flex justify-between items-center p-3 bg-white rounded border hover:bg-gray-50"
                    >
                      <span>{parseInt(month)} 月</span>
                      <span className="text-gray-500">{count} 篇</span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: 创建 SearchPage**

```tsx
// web/src/modules/blog/pages/SearchPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Loading from '@/shared/components/Loading'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const keyword = searchParams.get('q') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', keyword],
    queryFn: () => blogApi.search({ q: keyword, limit: 20 }),
    enabled: keyword.length > 0,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        搜索: {keyword || '(请输入关键词)'}
      </h1>

      {!keyword && (
        <div className="text-center py-12 text-gray-500">
          请输入搜索关键词
        </div>
      )}

      {keyword && isLoading && <Loading />}

      {keyword && error && (
        <div className="text-red-500">搜索失败</div>
      )}

      {keyword && data?.data?.data && (
        <>
          {data.data.data.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              未找到相关文章
            </div>
          ) : (
            <div className="space-y-4">
              {data.data.data.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 创建 AboutPage**

```tsx
// web/src/modules/blog/pages/AboutPage.tsx
import { useQuery } from '@tanstack/react-query'
import { blogApi } from '@/modules/blog/api/blogApi'
import MarkdownRenderer from '@/modules/blog/components/MarkdownRenderer'
import Loading from '@/shared/components/Loading'

export default function AboutPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['siteConfig'],
    queryFn: () => blogApi.getSiteConfig(),
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const config = data?.data?.data

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">关于我</h1>

      {config?.avatar && (
        <img
          src={config.avatar}
          alt="Avatar"
          className="w-32 h-32 rounded-full mb-6"
        />
      )}

      {config?.about_content ? (
        <MarkdownRenderer content={config.about_content} />
      ) : (
        <p className="text-gray-500">暂无介绍</p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add web/src/modules/blog/pages/
git commit -m "feat: add TagPage, ArchivePage, SearchPage, AboutPage"
```

---

## Task 3.14: 更新路由和导航

**Files:**
- Modify: `web/src/App.tsx`

- [ ] **Step 1: 更新 App.tsx 路由配置**

```tsx
// web/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from '@/layouts/MainLayout'
import LoginPage from '@/modules/auth/pages/LoginPage'
import HomePage from '@/modules/blog/pages/HomePage'
import ArticleListPage from '@/modules/blog/pages/ArticleListPage'
import ArticleDetailPage from '@/modules/blog/pages/ArticleDetailPage'
import TagPage from '@/modules/blog/pages/TagPage'
import ArchivePage from '@/modules/blog/pages/ArchivePage'
import SearchPage from '@/modules/blog/pages/SearchPage'
import AboutPage from '@/modules/blog/pages/AboutPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<ArticleListPage />} />
            <Route path="/blog/article/:id" element={<ArticleDetailPage />} />
            <Route path="/blog/tag" element={<TagPage />} />
            <Route path="/blog/tag/:slug" element={<ArticleListPage />} />
            <Route path="/blog/archive" element={<ArchivePage />} />
            <Route path="/blog/search" element={<SearchPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<div className="p-8 text-2xl">管理后台（待开发）</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

- [ ] **Step 2: 验证前端编译**

```bash
docker-compose exec web npm run build
# Expected: build successful
```

- [ ] **Step 3: Commit**

```bash
git add web/src/App.tsx
git commit -m "feat: add all blog routes to App"
```

---

## Task 3.15: 月度归档功能（补充）

**Note:** 此任务补充月度归档页面的缺失功能。

**Files:**
- Modify: `server/internal/modules/blog/handler/blog_handler.go` - 添加 GetArchiveByMonth 方法
- Modify: `server/internal/router/router.go` - 添加 `/archive/:year/:month` 路由
- Modify: `web/src/modules/blog/api/blogApi.ts` - 添加 getArchiveByMonth 函数
- Create: `web/src/modules/blog/pages/ArchiveMonthPage.tsx` - 月度归档页面
- Modify: `web/src/App.tsx` - 添加路由

- [ ] **Step 1: 后端添加 Handler 方法**

在 `blog_handler.go` 的 `GetArchive` 方法后添加:

```go
// GetArchiveByMonth 获取指定年月的文章
// GET /api/blog/archive/:year/:month
func (h *BlogHandler) GetArchiveByMonth(c *gin.Context) {
	year, err := strconv.Atoi(c.Param("year"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "INVALID_YEAR", "无效的年份")
		return
	}

	month, err := strconv.Atoi(c.Param("month"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "INVALID_MONTH", "无效的月份")
		return
	}

	articles, err := h.articleSvc.GetArticlesByMonth(year, month)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "DATABASE_ERROR", "获取文章失败")
		return
	}

	utils.SuccessResponse(c, articles)
}
```

- [ ] **Step 2: 添加后端路由**

在 `router.go` 的 blog 路由组中添加:

```go
blog.GET("/archive/:year/:month", blogHdl.GetArchiveByMonth)
```

- [ ] **Step 3: 添加前端 API 函数**

在 `blogApi.ts` 中添加:

```typescript
// 获取指定年月的文章
getArchiveByMonth: (year: number, month: number) =>
  request.get<ApiResponse<Article[]>>(`/blog/archive/${year}/${month}`),
```

- [ ] **Step 4: 创建 ArchiveMonthPage**

```tsx
// web/src/modules/blog/pages/ArchiveMonthPage.tsx
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { blogApi } from '@/modules/blog/api/blogApi'
import ArticleCard from '@/modules/blog/components/ArticleCard'
import Loading from '@/shared/components/Loading'

export default function ArchiveMonthPage() {
  const { year, month } = useParams<{ year: string; month: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['archive', year, month],
    queryFn: () => blogApi.getArchiveByMonth(parseInt(year!, 10), parseInt(month!, 10)),
    enabled: !!year && !!month,
  })

  if (isLoading) return <Loading />
  if (error) return <div className="text-red-500">加载失败</div>

  const articles = data?.data?.data || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {year} 年 {parseInt(month!)} 月的文章
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">该月份暂无文章</div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: 添加前端路由**

在 `App.tsx` 的 MainLayout 子路由中添加:

```tsx
<Route path="/blog/archive/:year/:month" element={<ArchiveMonthPage />} />
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add month-level archive functionality"
```
## Task 3.16: 最终验证

- [ ] **Step 1: 检查所有服务状态**

```bash
docker-compose ps
# Expected: all services running
```

- [ ] **Step 2: 测试后端 API**

```bash
# 测试文章列表
curl -s http://localhost:8080/api/blog/articles | jq .

# 测试标签列表
curl -s http://localhost:8080/api/blog/tags | jq .

# 测试归档
curl -s http://localhost:8080/api/blog/archive | jq .

# 测试站点配置
curl -s http://localhost:8080/api/site/config | jq .
```

- [ ] **Step 3: 访问前端页面**

- 首页: http://localhost:5173/
- 博客列表: http://localhost:5173/blog
- 标签页: http://localhost:5173/blog/tag
- 归档页: http://localhost:5173/blog/archive
- 关于页: http://localhost:5173/about

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "feat: complete Phase 3 - blog frontend functionality"
```
---

