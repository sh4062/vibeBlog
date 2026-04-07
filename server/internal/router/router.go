package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/modules/auth/handler"
	"vibeblog/server/internal/modules/auth/service"
	"vibeblog/server/internal/shared/config"
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

	return r
}