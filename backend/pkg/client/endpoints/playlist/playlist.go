package playlist

import (
	"encoding/json"
	"errors"
	"fmt"

	models "github.com/smwbalfe/playlist-archive/backend/pkg/client/endpoints/playlist/models"
	interfaces "github.com/smwbalfe/playlist-archive/backend/pkg/client/interface"
)

const (
	ApiURL                = "https://api.spotify.com/v1"
	ExtensionsGetPlaylist = `{"persistedQuery":{"version":1,"sha256Hash":"a5f3cc790d0a61f860c3c04ba1090cb2bd4cb38ae8bec44bc063124e796bf256"}}`
)

type PlaylistService struct {
	client interfaces.APIClient
}

func NewPlaylistService(client interfaces.APIClient) *PlaylistService {
	return &PlaylistService{
		client: client,
	}
}

func (s *PlaylistService) Get(playlistId string) (string, error) {
	reqURL := fmt.Sprintf("%s/playlists/%v", ApiURL, playlistId)
	resp, err := s.client.Get(reqURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to get playlist %v: %v", playlistId, err)
	}
	return string(resp.Data), nil
}

func (s *PlaylistService) GetFront(playlistId string) (models.PlaylistTracks, error) {
	variables := fmt.Sprintf(`{"uri":"spotify:playlist:%s", "offset":%v, "limit":%v, "enableWatchFeedEntrypoint":true}`,
		playlistId, 0, 4999)

	reqURL := s.client.BuildQueryURL("fetchPlaylist", variables, ExtensionsGetPlaylist)

	resp, err := s.client.Get(reqURL, nil)
	if resp.StatusCode != 200 {
		return models.PlaylistTracks{}, errors.New(fmt.Sprintf("response code != 200: %v", err.Error()))
	}
	if err != nil {
		return models.PlaylistTracks{}, fmt.Errorf("failed to get playlist data for %v: %v", playlistId, err)
	}

	var plTracks models.PlaylistTracks
	if err := json.Unmarshal(resp.Data, &plTracks); err != nil {
		return models.PlaylistTracks{}, fmt.Errorf("failed to unmarshal playlist data: %v", err)
	}
	return plTracks, nil
}

func (s *PlaylistService) GetPlaylistMeta(playlistId string) (models.PlaylistTracks, error) {
	variables := fmt.Sprintf(`{"uri":"spotify:playlist:%s", "offset":%v, "limit":%v, "enableWatchFeedEntrypoint": true}`,
		playlistId, 0, 4999)

	reqURL := s.client.BuildQueryURL("fetchPlaylist", variables, ExtensionsGetPlaylist)

	resp, err := s.client.Get(reqURL, nil)
	if resp.StatusCode != 200 {
		return models.PlaylistTracks{}, fmt.Errorf("response code != 200 %v", err.Error())
	}
	if err != nil {
		return models.PlaylistTracks{}, fmt.Errorf("failed to get playlist data for %v: %v", playlistId, err)
	}

	var plTracks models.PlaylistTracks
	if err := json.Unmarshal(resp.Data, &plTracks); err != nil {
		return models.PlaylistTracks{}, fmt.Errorf("failed to unmarshal playlist data: %v", err)
	}
	return plTracks, nil
}

func (s *PlaylistService) Create(trackURIs []string, user string, playlistName string) (string, error) {
	createURL := fmt.Sprintf("%s/users/%v/playlists", ApiURL, user)
	playlistData := map[string]any{
		"name":   playlistName,
		"public": true,
	}
	createResp, err := s.client.Post(createURL, playlistData, nil)
	if err != nil {
		return "", err
	}

	var playlist models.Playlist
	if err := json.Unmarshal(createResp.Data, &playlist); err != nil {
		return "", err
	}

	batchSize := 100
	addURL := fmt.Sprintf("%s/playlists/%s/tracks", ApiURL, playlist.ID)

	for i := 0; i < len(trackURIs); i += batchSize {
		end := i + batchSize
		if end > len(trackURIs) {
			end = len(trackURIs)
		}

		batch := trackURIs[i:end]
		addData := map[string]interface{}{
			"uris": batch,
		}

		_, err = s.client.Post(addURL, addData, nil)
		if err != nil {
			return "", err
		}
	}
	return fmt.Sprintf("https://open.spotify.com/playlist/%s", playlist.ID), nil
}
