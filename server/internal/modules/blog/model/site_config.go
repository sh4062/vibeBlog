package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type SiteConfig struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ConfigKey string    `gorm:"size:50;not null;unique" json:"config_key"`
	Value     string    `gorm:"type:text" json:"value"`
	Ext       any       `gorm:"type:json" json:"ext"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (SiteConfig) TableName() string {
	return "site_config"
}

func AutoMigrateSiteConfig() error {
	return database.DB.AutoMigrate(&SiteConfig{})
}