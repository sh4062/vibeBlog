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