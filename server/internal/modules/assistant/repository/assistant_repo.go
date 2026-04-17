package repository

import (
	"vibeblog/server/internal/modules/assistant/model"

	"gorm.io/gorm"
)

type AssistantRepository struct {
	db *gorm.DB
}

func NewAssistantRepository(db *gorm.DB) *AssistantRepository {
	return &AssistantRepository{db: db}
}

// Get 获取完整的助手配置（管理端使用）
func (r *AssistantRepository) Get() (*model.AssistantConfig, error) {
	var cfg model.AssistantConfig
	result := r.db.First(&cfg)
	if result.Error == gorm.ErrRecordNotFound {
		cfg = model.AssistantConfig{
			Name:           "Aria",
			WelcomeMessage: "你好！有什么可以帮你的吗？",
			VoiceLanguage:  "zh-CN",
			VoiceRate:      1.0,
			Enabled:        false,
			PositionX:      20,
			PositionY:      80,
			WidgetSize:     "medium",
			OpenAIModel:    "gpt-4o-mini",
			Temperature:    0.7,
			MaxTokens:      500,
		}
		if err := r.db.Create(&cfg).Error; err != nil {
			return nil, err
		}
		return &cfg, nil
	}
	if result.Error != nil {
		return nil, result.Error
	}
	return &cfg, nil
}

// Upsert 创建或更新助手配置
func (r *AssistantRepository) Upsert(cfg *model.AssistantConfig) error {
	var existing model.AssistantConfig
	result := r.db.First(&existing)
	if result.Error == gorm.ErrRecordNotFound {
		return r.db.Create(cfg).Error
	}
	if result.Error != nil {
		return result.Error
	}
	cfg.ID = existing.ID
	cfg.CreatedAt = existing.CreatedAt
	return r.db.Save(cfg).Error
}

// GetPublic 获取公开配置（不含敏感字段）
func (r *AssistantRepository) GetPublic() (*model.AssistantConfigPublic, error) {
	cfg, err := r.Get()
	if err != nil {
		return nil, err
	}
	return &model.AssistantConfigPublic{
		Name:            cfg.Name,
		FallbackAvatar:  cfg.FallbackAvatar,
		Live2DModelPath: cfg.Live2DModelPath,
		Enabled:         cfg.Enabled,
		PositionX:       cfg.PositionX,
		PositionY:       cfg.PositionY,
		WidgetSize:      cfg.WidgetSize,
		WelcomeMessage:  cfg.WelcomeMessage,
		VoiceLanguage:   cfg.VoiceLanguage,
		VoiceRate:       cfg.VoiceRate,
	}, nil
}

// UpdateField 更新单个字段
func (r *AssistantRepository) UpdateField(field string, value any) error {
	var cfg model.AssistantConfig
	result := r.db.First(&cfg)
	if result.Error != nil {
		return result.Error
	}
	return r.db.Model(&cfg).Update(field, value).Error
}
