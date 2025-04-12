package api

import (
	"fmt"
	"net/http"

	"github.com/gofrs/uuid/v5"
	"github.com/jackc/pgx/v5/pgtype"
	service "github.com/smwbalfe/playlist-archive/backend/internal/services"
	"github.com/smwbalfe/playlist-archive/backend/internal/transport"
	"github.com/smwbalfe/playlist-archive/backend/internal/utils"
	models "github.com/smwbalfe/playlist-archive/backend/pkg/client/endpoints/playlist/models"
)

func (a *api) ArtistScrape(w http.ResponseWriter, r *http.Request) {
	var scraperRequest transport.ScrapeRequest
	if err := utils.ParseBody(r, &scraperRequest); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	artistBase62, err := utils.ParseSpotifyId(scraperRequest.Artist)
	if err != nil {
		http.Error(w, "invalid artist format requested", http.StatusInternalServerError)
		return
	}

	scraperRequest.Artist = artistBase62

	userID, ok := r.Context().Value("user").(uuid.UUID)

	if !ok {
		http.Error(w, "JWT not found in context", http.StatusInternalServerError)
		return
	}

	scrape, err := a.scrapeRepo.CreateScrape(r.Context(), pgtype.UUID{Bytes: userID, Valid: true})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println(scraperRequest)

	job := &service.ScrapeJob{
		ID:     scrape,
		Artist: scraperRequest.Artist,
		Depth:  scraperRequest.Depth,
		Status: "pending",
	}

	if err := a.queue.PushRequest(r.Context(), job); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.Json(w, r, transport.ScrapeTriggerResponse{ScrapeID: "yes"})
}

func collectUniqueArtists(tracks []models.Track, limit int) []string {
	artistSet := make(map[string]struct{})
	uniqueArtists := []string{}
	for _, track := range tracks {
		for _, artist := range track.Artists.Items {
			artistID := utils.ExtractSpotifyIDColon(artist.URI)
			if _, exists := artistSet[artistID]; !exists {
				artistSet[artistID] = struct{}{}
				uniqueArtists = append(uniqueArtists, artistID)
				if len(uniqueArtists) >= limit {
					return uniqueArtists
				}
			}
		}
	}
	return uniqueArtists
}

func (a *api) GetArtistPool(w http.ResponseWriter, r *http.Request) {
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
	artistExpanded, err := a.spotifyService.BatchGetArtists(artists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.Json(w, r, artistExpanded)
}

func (a *api) PlaylistSeededScrape(w http.ResponseWriter, r *http.Request) {
	playlistID := r.URL.Query()["id"]

	fmt.Printf("playlist lists :%v", playlistID)

	userID, ok := r.Context().Value("user").(uuid.UUID)

	if !ok {
		http.Error(w, "JWT not found in context", http.StatusInternalServerError)
		return
	}

	var artists []string
	for _, playlistID := range playlistID {
		parsedID, err := utils.ParseSpotifyId(playlistID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		tracks, err := a.spotifyService.GetTracksExpanded(parsedID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if len(tracks) == 0 {
			http.Error(w, "no tracks", http.StatusInternalServerError)
			return
		}
		playlistArtists := collectUniqueArtists(tracks, 5)
		artists = append(artists, playlistArtists...)
	}

	for _, artist := range artists {

		scrape, err := a.scrapeRepo.CreateScrape(r.Context(), pgtype.UUID{Bytes: userID, Valid: true})
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		job := &service.ScrapeJob{
			ID:     scrape,
			Artist: artist,
			Depth:  1,
			Status: "pending",
		}

		if err := a.queue.PushRequest(r.Context(), job); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	utils.Json(w, r, transport.ScrapeTriggerResponse{ScrapeID: "yes"})
}
