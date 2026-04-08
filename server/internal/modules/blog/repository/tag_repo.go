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