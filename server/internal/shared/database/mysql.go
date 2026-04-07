// internal/shared/database/mysql.go
package database

import (
	"fmt"
	"log"
	"vibeblog/server/internal/shared/config"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitMySQL(cfg *config.DatabaseConfig) error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}

	DB = db
	log.Println("MySQL connected successfully")
	return nil
}

func CloseMySQL() {
	sqlDB, err := DB.DB()
	if err != nil {
		log.Printf("Error getting SQL DB: %v", err)
		return
	}
	sqlDB.Close()
	log.Println("MySQL connection closed")
}