package config

import (
	service "scraper/internal/services"

	"github.com/redis/go-redis/v9"
	client "github.com/smwbalfe/playlist-archive/backend/pkg/client"
)

type DatabaseConnections struct {
	Redis *redis.Client
}

type AppServices struct {
	Queue   service.RedisQueue
	Spotify *client.SpotifyClient
}

type SharedConfig struct {
	Services *AppServices
	Dbs      *DatabaseConnections
}
