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