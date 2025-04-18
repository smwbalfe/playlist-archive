package api

import (
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gofrs/uuid/v5"
	"github.com/smwbalfe/playlist-archive/backend/internal/domain"
	"github.com/smwbalfe/playlist-archive/backend/internal/transport"
	"github.com/smwbalfe/playlist-archive/backend/internal/utils"
)

func (a *api) PlaylistHandler(w http.ResponseWriter, r *http.Request) {
	playlistID := r.URL.Query().Get("id")
	playlistTracks, err := a.spotifyService.GetTracksExpanded(playlistID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	sortedTracks := utils.SortTracksByPlaycount(playlistTracks)
	utils.Json(w, r, transport.PlaylistResponse{Playlists: sortedTracks})
}

func (a *api) GetRandomArtist(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("user").(uuid.UUID)
	if !ok {
		http.Error(w, "no uuid provided, have you registered...", http.StatusInternalServerError)
		return
	}
	pool, err := utils.ParseQueryInt(r.URL.Query().Get("pool"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	artists, err := a.userRepo.GetUserArtistsByUserAndScrapeID(r.Context(), userID, int64(pool))
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if len(artists) == 0 {
		http.Error(w, "no artists found for this user and pool", http.StatusNotFound)
		return
	}
	rand.Seed(time.Now().UnixNano())
	randomIndex := rand.Intn(len(artists))
	utils.Json(w, r, transport.RandomArtist{Artist: artists[randomIndex]})
}

func (a *api) GetArtistGenres(w http.ResponseWriter, r *http.Request) {
	artist := r.URL.Query().Get("artist")
	genres, err := a.spotifyService.GetArtistGenres([]string{artist})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	fmt.Println(genres)
}

func (a *api) Debug(w http.ResponseWriter, r *http.Request) {
	_, err := a.spotify.Artists.GetRelated("0XGJ3GUPwslwFJ66yNbHeh")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	utils.Json(w, r, nil)
}

func (a *api) PlaylistMeta(w http.ResponseWriter, r *http.Request) {
	playlistID := r.URL.Query().Get("id")
	parsedId, err := utils.ParseSpotifyId(playlistID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	playlistName, err := a.spotifyService.GetPlaylistMeta(parsedId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	utils.Json(w, r, transport.PlaylistMetaResponse{Name: playlistName})
}

func (a *api) AddToPlaylist(w http.ResponseWriter, r *http.Request) {
	var createPlaylist transport.CreatePlaylistRequest
	if err := utils.ParseBody(r, &createPlaylist); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	userID, err := a.spotify.Users.GetCurrentID()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	link, err := a.spotify.Playlists.Create(createPlaylist.Tracks, userID, "Track Collection")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	utils.Json(w, r, transport.CreatePlaylistResponse{Link: link})
}

func (a *api) ReadPlaylistGenres(w http.ResponseWriter, r *http.Request) {
	playlistID := r.URL.Query().Get("id")
	if playlistID == "" {
		http.Error(w, "no playlist ID provided", http.StatusInternalServerError)
		return
	}
	playlistGenres, err := a.spotifyService.GetPlaylistGenres(r.Context(), playlistID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	utils.Json(w, r, playlistGenres)
}

func FilterTracksByStreamCount(tracks []domain.SimpleTrack, maxStreamCount int) ([]domain.SimpleTrack, error) {
	var filteredTracks []domain.SimpleTrack
	for _, track := range tracks {
		playcount, err := strconv.Atoi(track.Playcount)
		if err != nil {
			continue
		}
		if playcount < maxStreamCount {
			filteredTracks = append(filteredTracks, track)
		}
	}

	return filteredTracks, nil
}

func (a *api) FilterPlaylists(w http.ResponseWriter, r *http.Request) {
	var filterRequest transport.FilterPlaylistsRequest
	if err := utils.ParseBody(r, &filterRequest); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var allSimpleTracks []domain.SimpleTrack

	for _, playlist := range filterRequest.PlaylistsToFilter {
		loadedTracks, err := a.spotifyService.GetTracksExpanded(playlist)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for _, lTrack := range loadedTracks {
			allSimpleTracks = append(allSimpleTracks, utils.GetSimpleTrack(lTrack))
		}
	}

	if len(filterRequest.Genres) > 0 {
		var simpleTracks []domain.SimpleTrack
		tracks, err := a.spotifyService.FilterPlaylistByGenres(filterRequest.PlaylistsToFilter, filterRequest.Genres)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		for _, track := range tracks {
			simpleTracks = append(simpleTracks, utils.GetSimpleTrack(track))
		}
		allSimpleTracks = simpleTracks
	}

	if filterRequest.ApplyUnique {
		var removeTracks []domain.SimpleTrack
		for _, uPlaylist := range filterRequest.PlaylistsToRemove {
			tracks, err := a.spotifyService.GetTracksExpanded(uPlaylist)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			for _, track := range tracks {
				removeTracks = append(removeTracks, utils.GetSimpleTrack(track))
			}
		}
		dedupedTracks, err := a.spotifyService.RemoveKnownTracks(allSimpleTracks, removeTracks)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		allSimpleTracks = dedupedTracks
	}

	allSimpleTracks = utils.RemoveArtists(allSimpleTracks, []string{"ILLENIUM"})

	utils.Json(w, r, transport.FilterPlaylistResponse{Tracks: allSimpleTracks})
}
