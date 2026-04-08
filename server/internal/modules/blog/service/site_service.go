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