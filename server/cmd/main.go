package main

import (
	"log"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/database"
	"vibeblog/server/internal/shared/utils"
	"vibeblog/server/internal/router"
	authModel "vibeblog/server/internal/modules/auth/model"
	blogModel "vibeblog/server/internal/modules/blog/model"
	assistantModel "vibeblog/server/internal/modules/assistant/model"
	authService "vibeblog/server/internal/modules/auth/service"
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

	// 初始化 JWT
	utils.InitJWT(&cfg.JWT)

	// 自动迁移数据库表
	if err := authModel.AutoMigrate(); err != nil {
		log.Fatalf("Auth model migration failed: %v", err)
	}
	if err := blogModel.AutoMigrateArticle(); err != nil {
		log.Fatalf("Blog model migration failed: %v", err)
	}
	if err := blogModel.AutoMigrateSiteConfig(); err != nil {
		log.Fatalf("Site config migration failed: %v", err)
	}
	assistantModel.Init(database.DB)
	if err := assistantModel.AutoMigrateAssistantConfig(); err != nil {
		log.Fatalf("Assistant config migration failed: %v", err)
	}
	log.Println("Database migration completed")

	// 初始化默认用户
	authSvc := authService.NewAuthService(&cfg.JWT)
	if err := authSvc.InitDefaultUser(); err != nil {
		log.Printf("Init default user failed: %v", err)
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