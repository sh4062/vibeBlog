package model

import (
	"time"
)

type Tag struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:50;not null;unique" json:"name"`
	Slug        string    `gorm:"size:50;unique" json:"slug"`
	Description string    `gorm:"size:255" json:"description"`
	Ext         any       `gorm:"type:json" json:"ext"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Tag) TableName() string {
	return "tags"
}