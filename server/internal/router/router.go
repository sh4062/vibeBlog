// server/internal/router/router.go
package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/auth/handler"
	"vibeblog/server/internal/modules/auth/service"
	blogHandler "vibeblog/server/internal/modules/blog/handler"
	blogRepo "vibeblog/server/internal/modules/blog/repository"
	blogService "vibeblog/server/internal/modules/blog/service"
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
		blog.GET("/search", blogHdl.Search)
	}

	// 站点配置路由
	site := api.Group("/site")
	{
		site.GET("/config", blogHdl.GetSiteConfig)
	}

	return r
}