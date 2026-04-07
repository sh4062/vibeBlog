package middleware

import (
	"strings"
	"vibeblog/server/internal/shared/utils"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			utils.Unauthorized(c, "未提供认证信息")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if parts[0] != "Bearer" || len(parts) != 2 {
			utils.Unauthorized(c, "认证格式错误")
			c.Abort()
			return
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			utils.Unauthorized(c, "token 无效或已过期")
			c.Abort()
			return
		}

		// 将用户信息存入上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)

		c.Next()
	}
}

func GetUserID(c *gin.Context) uint {
	if id, exists := c.Get("user_id"); exists {
		return id.(uint)
	}
	return 0
}

func GetUsername(c *gin.Context) string {
	if name, exists := c.Get("username"); exists {
		return name.(string)
	}
	return ""
}