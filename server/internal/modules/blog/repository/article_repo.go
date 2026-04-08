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