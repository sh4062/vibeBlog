// server/internal/modules/admin/service/admin_service.go
package service

import (
	"errors"
	"strings"
	"time"
	"vibeblog/server/internal/modules/blog/model"
	"vibeblog/server/internal/shared/utils"

	"gorm.io/gorm"
)

type AdminService struct {
	db *gorm.DB
}

func NewAdminService(db *gorm.DB) *AdminService {
	return &AdminService{db: db}
}

// ─── 统计 ────────────────────────────────────────────────────────────────────

type Stats struct {
	TotalArticles int64 `json:"total_articles"`
	Published     int64 `json:"published"`
	Drafts        int64 `json:"drafts"`
	TotalViews    int64 `json:"total_views"`
}

func (s *AdminService) GetStats() (*Stats, error) {
	var stats Stats

	s.db.Model(&model.Article{}).Count(&stats.TotalArticles)
	s.db.Model(&model.Article{}).Where("status = ?", model.StatusPublished).Count(&stats.Published)
	s.db.Model(&model.Article{}).Where("status = ?", model.StatusDraft).Count(&stats.Drafts)

	type ViewSum struct {
		Total int64
	}
	var viewSum ViewSum
	s.db.Model(&model.Article{}).Select("COALESCE(SUM(view_count), 0) as total").Scan(&viewSum)
	stats.TotalViews = viewSum.Total

	return &stats, nil
}

// ─── 文章管理 ─────────────────────────────────────────────────────────────────

type ArticleListQuery struct {
	Page    int
	Limit   int
	Status  string
	Keyword string
}

type ArticleListResult struct {
	Articles   []model.Article    `json:"articles"`
	Pagination utils.Pagination   `json:"pagination"`
}

func (s *AdminService) ListArticles(q ArticleListQuery) (*ArticleListResult, error) {
	var articles []model.Article
	var total int64

	db := s.db.Model(&model.Article{}).Preload("Tags")

	if q.Status != "" {
		db = db.Where("status = ?", q.Status)
	}
	if q.Keyword != "" {
		kw := "%" + q.Keyword + "%"
		db = db.Where("title LIKE ? OR summary LIKE ?", kw, kw)
	}

	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	offset := (q.Page - 1) * q.Limit
	if err := db.Order("created_at DESC").Offset(offset).Limit(q.Limit).Find(&articles).Error; err != nil {
		return nil, err
	}

	pages := int(total) / q.Limit
	if int(total)%q.Limit > 0 {
		pages++
	}

	return &ArticleListResult{
		Articles: articles,
		Pagination: utils.Pagination{
			Page:  q.Page,
			Limit: q.Limit,
			Total: total,
			Pages: pages,
		},
	}, nil
}

func (s *AdminService) GetArticle(id uint) (*model.Article, error) {
	var article model.Article
	if err := s.db.Preload("Tags").First(&article, id).Error; err != nil {
		return nil, err
	}
	return &article, nil
}

type ArticleInput struct {
	Title      string   `json:"title"`
	Slug       string   `json:"slug"`
	Summary    string   `json:"summary"`
	Content    string   `json:"content"`
	CoverImage string   `json:"cover_image"`
	Status     string   `json:"status"`
	TagIDs     []uint   `json:"tag_ids"`
	AuthorID   uint
}

func (s *AdminService) CreateArticle(input ArticleInput) (*model.Article, error) {
	if strings.TrimSpace(input.Title) == "" {
		return nil, errors.New("标题不能为空")
	}

	slug := input.Slug
	if slug == "" {
		slug = utils.GenerateSlug(input.Title)
	}

	// 检查 slug 唯一性
	var count int64
	s.db.Model(&model.Article{}).Where("slug = ?", slug).Count(&count)
	if count > 0 {
		slug = slug + "-" + time.Now().Format("0102150405")
	}

	status := model.ArticleStatus(input.Status)
	if status == "" {
		status = model.StatusDraft
	}

	article := &model.Article{
		Title:      input.Title,
		Slug:       slug,
		Summary:    input.Summary,
		Content:    input.Content,
		CoverImage: input.CoverImage,
		Status:     status,
		AuthorID:   input.AuthorID,
	}

	if status == model.StatusPublished {
		now := time.Now()
		article.PublishedAt = &now
	}

	if err := s.db.Create(article).Error; err != nil {
		return nil, err
	}

	// 关联标签
	if len(input.TagIDs) > 0 {
		var tags []model.Tag
		s.db.Find(&tags, input.TagIDs)
		s.db.Model(article).Association("Tags").Replace(tags)
	}

	return s.GetArticle(article.ID)
}

func (s *AdminService) UpdateArticle(id uint, input ArticleInput) (*model.Article, error) {
	article, err := s.GetArticle(id)
	if err != nil {
		return nil, errors.New("文章不存在")
	}

	if strings.TrimSpace(input.Title) == "" {
		return nil, errors.New("标题不能为空")
	}

	// 更新字段
	article.Title = input.Title
	article.Summary = input.Summary
	article.Content = input.Content
	article.CoverImage = input.CoverImage

	newStatus := model.ArticleStatus(input.Status)
	// 如果从非published变为published，设置发布时间
	if newStatus == model.StatusPublished && article.Status != model.StatusPublished {
		now := time.Now()
		article.PublishedAt = &now
	}
	article.Status = newStatus

	if input.Slug != "" && input.Slug != article.Slug {
		var count int64
		s.db.Model(&model.Article{}).Where("slug = ? AND id != ?", input.Slug, id).Count(&count)
		if count > 0 {
			return nil, errors.New("slug 已存在")
		}
		article.Slug = input.Slug
	}

	if err := s.db.Save(article).Error; err != nil {
		return nil, err
	}

	// 更新标签关联
	var tags []model.Tag
	if len(input.TagIDs) > 0 {
		s.db.Find(&tags, input.TagIDs)
	}
	s.db.Model(article).Association("Tags").Replace(tags)

	return s.GetArticle(id)
}

func (s *AdminService) DeleteArticle(id uint) error {
	result := s.db.Delete(&model.Article{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("文章不存在")
	}
	return nil
}

func (s *AdminService) PublishArticle(id uint) (*model.Article, error) {
	article, err := s.GetArticle(id)
	if err != nil {
		return nil, errors.New("文章不存在")
	}

	now := time.Now()
	article.Status = model.StatusPublished
	article.PublishedAt = &now

	if err := s.db.Save(article).Error; err != nil {
		return nil, err
	}

	return article, nil
}

// ─── 标签管理 ─────────────────────────────────────────────────────────────────

type TagInput struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

func (s *AdminService) ListTags() ([]model.Tag, error) {
	var tags []model.Tag
	if err := s.db.Order("created_at DESC").Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (s *AdminService) CreateTag(input TagInput) (*model.Tag, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("标签名不能为空")
	}

	slug := input.Slug
	if slug == "" {
		slug = utils.GenerateSlug(input.Name)
	}

	tag := &model.Tag{
		Name:        input.Name,
		Slug:        slug,
		Description: input.Description,
	}

	if err := s.db.Create(tag).Error; err != nil {
		if strings.Contains(err.Error(), "Duplicate") || strings.Contains(err.Error(), "UNIQUE") {
			return nil, errors.New("标签名或 slug 已存在")
		}
		return nil, err
	}

	return tag, nil
}

func (s *AdminService) UpdateTag(id uint, input TagInput) (*model.Tag, error) {
	var tag model.Tag
	if err := s.db.First(&tag, id).Error; err != nil {
		return nil, errors.New("标签不存在")
	}

	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("标签名不能为空")
	}

	tag.Name = input.Name
	tag.Description = input.Description
	if input.Slug != "" {
		tag.Slug = input.Slug
	}

	if err := s.db.Save(&tag).Error; err != nil {
		return nil, err
	}

	return &tag, nil
}

func (s *AdminService) DeleteTag(id uint) error {
	result := s.db.Delete(&model.Tag{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("标签不存在")
	}
	return nil
}

// ─── 站点设置 ─────────────────────────────────────────────────────────────────

func (s *AdminService) GetSiteConfig() (map[string]string, error) {
	var configs []model.SiteConfig
	if err := s.db.Find(&configs).Error; err != nil {
		return nil, err
	}
	result := make(map[string]string)
	for _, c := range configs {
		result[c.ConfigKey] = c.Value
	}
	return result, nil
}

func (s *AdminService) UpdateSiteConfig(updates map[string]string) error {
	for key, value := range updates {
		var cfg model.SiteConfig
		result := s.db.Where("config_key = ?", key).First(&cfg)
		if result.Error == gorm.ErrRecordNotFound {
			cfg = model.SiteConfig{ConfigKey: key, Value: value}
			s.db.Create(&cfg)
		} else {
			s.db.Model(&cfg).Update("value", value)
		}
	}
	return nil
}
