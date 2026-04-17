package service

import (
	"vibeblog/server/internal/modules/assistant/model"
	"vibeblog/server/internal/modules/assistant/repository"
)

type AssistantService struct {
	repo *repository.AssistantRepository
}

func NewAssistantService(repo *repository.AssistantRepository) *AssistantService {
	return &AssistantService{repo: repo}
}

// GetConfig 获取完整配置（管理端）
func (s *AssistantService) GetConfig() (*model.AssistantConfig, error) {
	return s.repo.Get()
}

// UpdateConfig 更新配置
func (s *AssistantService) UpdateConfig(cfg *model.AssistantConfig) (*model.AssistantConfig, error) {
	if err := s.repo.Upsert(cfg); err != nil {
		return nil, err
	}
	return s.repo.Get()
}

// GetPublicConfig 获取公开配置
func (s *AssistantService) GetPublicConfig() (*model.AssistantConfigPublic, error) {
	return s.repo.GetPublic()
}

// IsEnabled 检查助手是否启用
func (s *AssistantService) IsEnabled() (bool, error) {
	cfg, err := s.repo.Get()
	if err != nil {
		return false, err
	}
	return cfg.Enabled && cfg.OpenAIKey != "", nil
}
