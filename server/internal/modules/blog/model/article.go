package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type ArticleStatus string

const (
	StatusDraft     ArticleStatus = "draft"
	StatusPublished ArticleStatus = "published"
	StatusScheduled ArticleStatus = "scheduled"
)

type Article struct {
	ID          uint          `gorm:"primaryKey" json:"id"`
	Title       string        `gorm:"size:255;not null" json:"title"`
	Slug        string        `gorm:"size:50;unique" json:"slug"`
	Summary     string        `gorm:"type:text" json:"summary"`
	Content     string        `gorm:"type:longtext" json:"content"`
	CoverImage  string        `gorm:"size:255" json:"cover_image"`
	Status      ArticleStatus `gorm:"size:20;default:draft" json:"status"`
	PublishedAt *time.Time    `json:"published_at"`
	ScheduledAt *time.Time    `json:"scheduled_at"`
	ViewCount   int           `gorm:"default:0" json:"view_count"`
	AuthorID    uint          `gorm:"not null" json:"author_id"`
	Ext         any           `gorm:"type:json" json:"ext"`
	CreatedAt   time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
	Tags        []Tag         `gorm:"many2many:article_tags;" json:"tags"`
}

func (Article) TableName() string {
	return "articles"
}

type ArticleTag struct {
	ArticleID uint
	TagID     uint
}

func AutoMigrateArticle() error {
	return database.DB.AutoMigrate(&Article{}, &Tag{}, &ArticleTag{})
}