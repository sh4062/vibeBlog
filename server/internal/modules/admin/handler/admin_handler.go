// server/internal/modules/admin/handler/admin_handler.go
package handler

import (
	"strconv"
	"vibeblog/server/internal/modules/admin/service"
	"vibeblog/server/internal/shared/middleware"
	"vibeblog/server/internal/shared/utils"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	svc *service.AdminService
}

func NewAdminHandler(svc *service.AdminService) *AdminHandler {
	return &AdminHandler{svc: svc}
}

// ─── 统计 ────────────────────────────────────────────────────────────────────

// GetStats 获取统计数据
// GET /api/admin/stats
func (h *AdminHandler) GetStats(c *gin.Context) {
	stats, err := h.svc.GetStats()
	if err != nil {
		utils.InternalError(c, "获取统计数据失败")
		return
	}
	utils.Success(c, stats)
}

// ─── 文章管理 ─────────────────────────────────────────────────────────────────

// ListArticles 文章列表
// GET /api/admin/articles?page=1&limit=10&status=&keyword=
func (h *AdminHandler) ListArticles(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	result, err := h.svc.ListArticles(service.ArticleListQuery{
		Page:    page,
		Limit:   limit,
		Status:  status,
		Keyword: keyword,
	})
	if err != nil {
		utils.InternalError(c, "获取文章列表失败")
		return
	}

	utils.PagedSuccess(c, result.Articles, result.Pagination)
}

// GetArticle 文章详情
// GET /api/admin/articles/:id
func (h *AdminHandler) GetArticle(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的文章ID")
		return
	}

	article, err := h.svc.GetArticle(uint(id))
	if err != nil {
		utils.NotFound(c, "文章不存在")
		return
	}

	utils.Success(c, article)
}

// CreateArticle 创建文章
// POST /api/admin/articles
func (h *AdminHandler) CreateArticle(c *gin.Context) {
	var input service.ArticleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "请求格式错误")
		return
	}

	input.AuthorID = middleware.GetUserID(c)

	article, err := h.svc.CreateArticle(input)
	if err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	utils.Created(c, article)
}

// UpdateArticle 更新文章
// PUT /api/admin/articles/:id
func (h *AdminHandler) UpdateArticle(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的文章ID")
		return
	}

	var input service.ArticleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "请求格式错误")
		return
	}

	article, err := h.svc.UpdateArticle(uint(id), input)
	if err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	utils.Success(c, article)
}

// DeleteArticle 删除文章
// DELETE /api/admin/articles/:id
func (h *AdminHandler) DeleteArticle(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的文章ID")
		return
	}

	if err := h.svc.DeleteArticle(uint(id)); err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, nil, "删除成功")
}

// PublishArticle 发布文章
// POST /api/admin/articles/:id/publish
func (h *AdminHandler) PublishArticle(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的文章ID")
		return
	}

	article, err := h.svc.PublishArticle(uint(id))
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, article, "发布成功")
}

// ─── 标签管理 ─────────────────────────────────────────────────────────────────

// ListTags 标签列表
// GET /api/admin/tags
func (h *AdminHandler) ListTags(c *gin.Context) {
	tags, err := h.svc.ListTags()
	if err != nil {
		utils.InternalError(c, "获取标签列表失败")
		return
	}
	utils.Success(c, tags)
}

// CreateTag 创建标签
// POST /api/admin/tags
func (h *AdminHandler) CreateTag(c *gin.Context) {
	var input service.TagInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "请求格式错误")
		return
	}

	tag, err := h.svc.CreateTag(input)
	if err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	utils.Created(c, tag)
}

// UpdateTag 更新标签
// PUT /api/admin/tags/:id
func (h *AdminHandler) UpdateTag(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的标签ID")
		return
	}

	var input service.TagInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "请求格式错误")
		return
	}

	tag, err := h.svc.UpdateTag(uint(id), input)
	if err != nil {
		utils.ValidationError(c, err.Error())
		return
	}

	utils.Success(c, tag)
}

// DeleteTag 删除标签
// DELETE /api/admin/tags/:id
func (h *AdminHandler) DeleteTag(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的标签ID")
		return
	}

	if err := h.svc.DeleteTag(uint(id)); err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, nil, "删除成功")
}

// ─── 站点设置 ─────────────────────────────────────────────────────────────────

// GetSiteConfig 获取站点配置
// GET /api/admin/site/config
func (h *AdminHandler) GetSiteConfig(c *gin.Context) {
	config, err := h.svc.GetSiteConfig()
	if err != nil {
		utils.InternalError(c, "获取站点配置失败")
		return
	}
	utils.Success(c, config)
}

// UpdateSiteConfig 更新站点配置
// PUT /api/admin/site/config
func (h *AdminHandler) UpdateSiteConfig(c *gin.Context) {
	var updates map[string]string
	if err := c.ShouldBindJSON(&updates); err != nil {
		utils.BadRequest(c, "请求格式错误")
		return
	}

	if err := h.svc.UpdateSiteConfig(updates); err != nil {
		utils.InternalError(c, "更新站点配置失败")
		return
	}

	utils.SuccessWithMessage(c, nil, "更新成功")
}