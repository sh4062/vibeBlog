package model

import (
	"time"

	"gorm.io/gorm"
)

type AssistantConfig struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	Name            string    `gorm:"size:100;not null;default:Aria" json:"name"`
	SystemPrompt    string    `gorm:"type:text" json:"system_prompt"`
	Live2DModelPath string    `gorm:"size:500" json:"live2d_model_path"`
	FallbackAvatar  string    `gorm:"size:500" json:"fallback_avatar"`
	VoiceLanguage   string    `gorm:"size:20;default:zh-CN" json:"voice_language"`
	VoiceRate       float64   `gorm:"type:decimal(3,2);default:1.0" json:"voice_rate"`
	Enabled         bool      `gorm:"default:false" json:"enabled"`
	PositionX       int       `gorm:"default:20" json:"position_x"`
	PositionY       int       `gorm:"default:80" json:"position_y"`
	WidgetSize      string    `gorm:"size:20;default:medium" json:"widget_size"`
	OpenAIModel     string    `gorm:"size:100;default:gpt-4o-mini" json:"openai_model"`
	OpenAIBaseURL   string    `gorm:"size:500;default:https://api.openai.com/v1" json:"openai_base_url"`
	OpenAIKey       string    `gorm:"size:500" json:"openai_key"`
	Temperature     float64   `gorm:"type:decimal(3,2);default:0.7" json:"temperature"`
	MaxTokens       int       `gorm:"default:500" json:"max_tokens"`
	WelcomeMessage  string    `gorm:"type:text" json:"welcome_message"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (AssistantConfig) TableName() string {
	return "assistant_configs"
}

// AssistantConfigPublic 安全的公开配置，不含敏感字段
type AssistantConfigPublic struct {
	Name            string  `json:"name"`
	FallbackAvatar  string  `json:"fallback_avatar"`
	Live2DModelPath string  `json:"live2d_model_path"`
	Enabled         bool    `json:"enabled"`
	PositionX       int     `json:"position_x"`
	PositionY       int     `json:"position_y"`
	WidgetSize      string  `json:"widget_size"`
	WelcomeMessage  string  `json:"welcome_message"`
	VoiceLanguage   string  `json:"voice_language"`
	VoiceRate       float64 `json:"voice_rate"`
}

func AutoMigrateAssistantConfig() error {
	return database().AutoMigrate(&AssistantConfig{})
}

// database 是一个包级变量，由 Init 设置
var db *gorm.DB

func Init(d *gorm.DB) {
	db = d
}

func database() *gorm.DB {
	return db
}
