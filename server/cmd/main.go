// cmd/main.go
package main

import (
	"log"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/database"
	"vibeblog/server/internal/router"
)

func main() {
	// 加载配置
	cfg := config.Load()

	// 初始化数据库
	if err := database.InitMySQL(&cfg.Database); err != nil {
		log.Fatalf("MySQL init failed: %v", err)
	}

	// 初始化 Redis
	if err := database.InitRedis(&cfg.Redis); err != nil {
		log.Printf("Redis init failed: %v, continuing without cache", err)
	}

	// 设置路由
	r := router.SetupRouter(cfg)

	// 启动服务
	log.Printf("Server starting on port %s", cfg.Server.Port)
	if err := r.Run(":" + cfg.Server.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}

	// 清理（实际不会执行到这里）
	database.CloseMySQL()
	database.CloseRedis()
}