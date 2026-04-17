// server/internal/router/router.go
package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/auth/handler"
	"vibeblog/server/internal/modules/auth/service"
	adminHandler "vibeblog/server/internal/modules/admin/handler"
	adminService "vibeblog/server/internal/modules/admin/service"
	blogHandler "vibeblog/server/internal/modules/blog/handler"
	blogRepo "vibeblog/server/internal/modules/blog/repository"
	blogService "vibeblog/server/internal/modules/blog/service"
	assistantHandler "vibeblog/server/internal/modules/assistant/handler"
	assistantRepo "vibeblog/server/internal/modules/assistant/repository"
	assistantService "vibeblog/server/internal/modules/assistant/service"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/database"
	"vibeblog/server/internal/shared/middleware"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")

	// 认证路由
	authSvc := service.NewAuthService(&cfg.JWT)
	authHdl := handler.NewAuthHandler(authSvc)

	auth := api.Group("/auth")
	{
		auth.POST("/login", authHdl.Login)
		auth.POST("/refresh", authHdl.Refresh)
		auth.POST("/logout", authHdl.Logout)
	}

	// 博客路由
	articleRepo := blogRepo.NewArticleRepository(database.DB)
	tagRepo := blogRepo.NewTagRepository(database.DB)
	siteConfigRepo := blogRepo.NewSiteConfigRepository(database.DB)

	articleSvc := blogService.NewArticleService(articleRepo)
	tagSvc := blogService.NewTagService(tagRepo)
	siteSvc := blogService.NewSiteService(siteConfigRepo)

	blogHdl := blogHandler.NewBlogHandler(articleSvc, tagSvc, siteSvc)

	blog := api.Group("/blog")
	{
		blog.GET("/articles", blogHdl.GetArticles)
		blog.GET("/articles/:id", blogHdl.GetArticle)
		blog.GET("/tags", blogHdl.GetTags)
		blog.GET("/archive", blogHdl.GetArchive)
		blog.GET("/archive/:year/:month", blogHdl.GetArchiveByMonth)
		blog.GET("/search", blogHdl.Search)
	}

	// 站点配置路由
	site := api.Group("/site")
	{
		site.GET("/config", blogHdl.GetSiteConfig)
	}

	// 管理后台路由（需要认证）
	adminSvc := adminService.NewAdminService(database.DB)
	adminHdl := adminHandler.NewAdminHandler(adminSvc)

	admin := api.Group("/admin").Use(middleware.AuthRequired())
	{
		// 统计
		admin.GET("/stats", adminHdl.GetStats)

		// 文章管理
		admin.GET("/articles", adminHdl.ListArticles)
		admin.GET("/articles/:id", adminHdl.GetArticle)
		admin.POST("/articles", adminHdl.CreateArticle)
		admin.PUT("/articles/:id", adminHdl.UpdateArticle)
		admin.DELETE("/articles/:id", adminHdl.DeleteArticle)
		admin.POST("/articles/:id/publish", adminHdl.PublishArticle)

		// 标签管理
		admin.GET("/tags", adminHdl.ListTags)
		admin.POST("/tags", adminHdl.CreateTag)
		admin.PUT("/tags/:id", adminHdl.UpdateTag)
		admin.DELETE("/tags/:id", adminHdl.DeleteTag)

		// 站点设置
		admin.GET("/site/config", adminHdl.GetSiteConfig)
		admin.PUT("/site/config", adminHdl.UpdateSiteConfig)
	}

	// AI 助手路由
	assistantRepository := assistantRepo.NewAssistantRepository(database.DB)
	assistantSvc := assistantService.NewAssistantService(assistantRepository)
	chatSvc := assistantService.NewChatService(assistantRepository, cfg)
	assistantHdl := assistantHandler.NewAssistantHandler(assistantSvc, chatSvc)

	// 公开助手接口
	blog.GET("/assistant", assistantHdl.GetPublicConfig)
	blog.POST("/assistant/chat", assistantHdl.Chat)

	// 管理端助手配置（需要认证）
	assistantAdmin := r.Group("/api/admin/assistant")
	assistantAdmin.Use(middleware.AuthRequired())
	{
		assistantAdmin.GET("", assistantHdl.GetConfig)
		assistantAdmin.PUT("", assistantHdl.UpdateConfig)
		assistantAdmin.POST("/upload-model", assistantHdl.UploadModel)
		assistantAdmin.POST("/test", assistantHdl.TestConnection)
	}

	// 静态文件服务（模型上传等）
	r.Static("/uploads", "./uploads")

	return r
}