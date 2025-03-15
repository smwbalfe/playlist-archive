package transport

import (
	"github.com/smwbalfe/playlist-archive/backend/internal/domain"
)

type PlaylistResponse struct {
	Playlists []domain.SimplifiedTrack
}

type CreatePlaylistRequest struct {
	Tracks []string `json:"tracks"`
}

type CreatePlaylistResponse struct {
	Link string `json:"link"`
}

type PlaylistMetaResponse struct {
	Name string `json:"playlist_name"`
}
