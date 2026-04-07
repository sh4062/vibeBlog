// internal/shared/database/redis.go
package database

import (
	"context"
	"fmt"
	"log"
	"vibeblog/server/internal/shared/config"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func InitRedis(cfg *config.RedisConfig) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
	})

	ctx := context.Background()
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		return fmt.Errorf("failed to connect redis: %w", err)
	}

	log.Println("Redis connected successfully")
	return nil
}

func CloseRedis() {
	if RedisClient != nil {
		RedisClient.Close()
		log.Println("Redis connection closed")
	}
}