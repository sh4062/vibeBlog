// internal/shared/middleware/logger.go
package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()

		c.Next()

		latency := time.Since(t)
		status := c.Writer.Status()

		println("[GIN]", status, c.Request.Method, c.Request.URL.Path, latency.String())
	}
}