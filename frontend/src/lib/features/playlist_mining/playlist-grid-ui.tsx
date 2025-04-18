import { FC } from "react";
import { Music2, Loader2, ListMusic } from "lucide-react";
import {
  Playlist,
  SimpleTrack,
  ViewState,
} from "@/src/lib/features/playlist_mining/types/types";

interface PlaylistGridProps {
  isScraping: boolean;
  isLoadingTracks: boolean;
  playlistData: Playlist[];
  tracks: SimpleTrack[];
  limit: number;
  activeView: ViewState;
  activeTrackPopup: string | null;
  handleLimitChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scrapePlaylists: () => void;
  fetchTracks: () => void;
  createPlaylist: () => void;
  openSpotify: (trackId: string) => void;
  toggleTrackPopup: (trackId: string) => void;
  closeAllPopups: () => void;
  setActiveView: (view: ViewState) => void;
}

export const PlaylistGrid: FC<PlaylistGridProps> = ({
  isScraping,
  isLoadingTracks,
  playlistData,
  tracks,
  limit,
  activeView,
  activeTrackPopup,
  handleLimitChange,
  scrapePlaylists,
  fetchTracks,
  createPlaylist,
  openSpotify,
  toggleTrackPopup,
  setActiveView,
}) => {
  return (
    <div className="p-4 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded shadow-sm border border-gray-200">
          <h2 className="text-xl mb-4 text-gray-800 font-medium">Music Discovery</h2>
          <div className="flex gap-4 items-center flex-wrap mb-6">
            <div className="flex items-center gap-2">
              <label htmlFor="limit" className="text-sm text-gray-600">
                Number of playlists:
              </label>
              <input
                id="limit"
                type="number"
                min="1"
                value={limit}
                onChange={handleLimitChange}
                className="w-20 border border-gray-300 rounded px-2 py-1 text-gray-700"
              />
            </div>
            <button
              onClick={scrapePlaylists}
              disabled={isScraping}
              className="bg-gray-800 text-white p-2 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Music2 className="w-4 h-4 inline mr-2" />
                  Find Playlists
                </>
              )}
            </button>
            <button
              onClick={fetchTracks}
              disabled={isLoadingTracks}
              className="bg-gray-600 text-white p-2 rounded disabled:opacity-50 hover:bg-gray-500 transition-colors"
            >
              {isLoadingTracks ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Loading Tracks...
                </>
              ) : (
                <>
                  <ListMusic className="w-4 h-4 inline mr-2" />
                  Load Tracks
                </>
              )}
            </button>
          </div>
          <div className="border-b border-gray-200 mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveView("playlists")}
                className={`pb-2 px-1 ${activeView === "playlists"
                    ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Music2 className="w-4 h-4 inline mr-2" />
                Playlists {playlistData.length > 0 && `(${playlistData.length})`}
              </button>
              <button
                onClick={() => setActiveView("tracks")}
                className={`pb-2 px-1 ${activeView === "tracks"
                    ? "border-b-2 border-gray-800 text-gray-800 font-medium"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <ListMusic className="w-4 h-4 inline mr-2" />
                Tracks {tracks.length > 0 && `(${tracks.length})`}
              </button>
            </div>
          </div>
          {activeView === "playlists" &&
            (playlistData.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <Music2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Start your search to discover playlists</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlistData.map((playlist) => (
                  <div key={playlist.uri} className="bg-white rounded border border-gray-200 hover:shadow-md transition-shadow">
                    <img
                      src={playlist.cover_art || "/api/placeholder/400/400"}
                      alt={playlist.name}
                      className="w-full aspect-square object-cover grayscale"
                    />
                    <div className="p-3">
                      <h3 className="font-medium truncate text-gray-800">{playlist.name}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{playlist.saves} saves</span>
                        <a
                          href={playlist.uri}
                          className="text-xs text-gray-600 hover:text-gray-900 underline"
                        >
                          Open in Spotify
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          {activeView === "tracks" &&
            (tracks.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <ListMusic className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No tracks match your filter</p>
              </div>
            ) : (
              <div>
                <button
                  onClick={createPlaylist}
                  className="mb-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Create Playlist
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tracks.map((track) => (
                    <div className="relative" key={track.id}>
                      <div
                        className="bg-gray-200 p-4 rounded border border-gray-300 hover:bg-gray-100 transition-all duration-200 flex items-center gap-4 cursor-pointer"
                        onClick={() => toggleTrackPopup(track.id)}
                      >
                        <img
                          src={
                            track?.coverArt?.sources?.[0]?.url ??
                            "/api/placeholder/64/64"
                          }
                          alt={track?.name ?? "Track artwork"}
                          className="w-16 h-16 object-cover rounded grayscale"
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{track.name}</h4>
                          <p className="text-sm text-gray-600">
                            {track.artists
                              ?.map((artist) => artist.name)
                              .join(", ")}
                          </p>
                          <button
                            className="mt-2 text-xs text-gray-500 hover:text-gray-800 underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTrackPopup(track.id);
                            }}
                          >
                            Show details
                          </button>
                        </div>
                      </div>

                      {activeTrackPopup === track.id && (
                        <div className="absolute z-10 top-full left-0 mt-2 w-full bg-white rounded border border-gray-300 shadow-md p-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                />
                              </svg>
                              <span>{track.playcount} Streams</span>
                            </div>
                            <button
                              className="text-gray-500 hover:text-black ml-auto"
                              onClick={() => toggleTrackPopup(track.id)}
                            >
                              ✕
                            </button>
                          </div>

                          <div className="mb-3">
                            <h5 className="text-sm text-gray-700 mb-1">
                              Genres:
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {track.genres &&
                                track.genres.map((genre, index) => (
                                  <span
                                    key={index}
                                    className="inline-block rounded-full px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-800"
                                  >
                                    {genre}
                                  </span>
                                ))}
                            </div>
                          </div>

                          <button
                            className="w-full text-center py-2 bg-gray-700 hover:bg-gray-800 rounded text-white text-sm transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openSpotify(track.id);
                            }}
                          >
                            Open in Spotify
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};