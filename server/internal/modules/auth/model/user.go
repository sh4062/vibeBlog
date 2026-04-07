package model

import (
	"time"
	"vibeblog/server/internal/shared/database"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"size:50;not null;unique" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Nickname  string    `gorm:"size:50" json:"nickname"`
	Avatar    string    `gorm:"size:255" json:"avatar"`
	Email     string    `gorm:"size:100" json:"email"`
	Role      string    `gorm:"size:20;default:author" json:"role"`
	Ext       any       `gorm:"type:json" json:"ext"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func AutoMigrate() error {
	return database.DB.AutoMigrate(&User{})
}