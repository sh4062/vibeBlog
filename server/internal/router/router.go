// internal/router/router.go
package router

import (
	"github.com/gin-gonic/gin"
	"vibeblog/server/internal/shared/config"
	"vibeblog/server/internal/shared/middleware"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.New()

	// 中间件
	r.Use(gin.Recovery())
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API 路由组（后续添加）
	_ = r.Group("/api") // 后续注册各模块路由

	return r
}