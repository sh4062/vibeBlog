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