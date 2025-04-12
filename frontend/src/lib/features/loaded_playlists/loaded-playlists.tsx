"use client";
import { usePlaylistManager } from "@/src/lib/features/loaded_playlists/hooks/use-playlist-manager";
import { Plus, X, ChevronDown, CheckCircle } from "lucide-react";
import { PlaylistList } from "./components/playlist-list";
import { PlaylistInput } from "./components/playlist-input";

export const LoadedPlaylists: React.FC = () => {
  const {
    playlists,
    inputValue,
    genres,
    selectedGenres,
    activePlaylistIndex,
    handleInputChange,
    addPlaylist,
    handleRemovePlaylist,
    handleKeyPress,
    getGenres,
    toggleGenre,
    setActivePlaylist,
  } = usePlaylistManager();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-black rounded-xl shadow-xl overflow-hidden border border-gray-300">
        <div className="p-6 border-b border-gray-300">
          <h2 className="text-xl font-medium">Playlists</h2>
        </div>
        <div className="p-6 space-y-6">
          <PlaylistInput
            inputValue={inputValue}
            handleInputChange={handleInputChange}
            handleKeyPress={handleKeyPress}
            handleAddPlaylist={addPlaylist}
          />
          <PlaylistList
            playlists={playlists}
            activePlaylistIndex={activePlaylistIndex}
            setActivePlaylist={setActivePlaylist}
            handleRemovePlaylist={handleRemovePlaylist}
          />
          <button
            onClick={getGenres}
            disabled={activePlaylistIndex === null}
            className={`w-full mt-4 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 rounded-lg transition-colors ${activePlaylistIndex === null
                ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                : "bg-gray-300 text-gray-700 hover:bg-gray-400 border border-gray-400"
              }`}
          >
            <span>
              Analyze Genres
              {activePlaylistIndex !== null ? ` for Selected Playlist` : ``}
            </span>
            <ChevronDown size={16} />
          </button>

          {genres.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Genres ({genres.length})
              </h3>
              <div className="relative w-full">
                <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  <div className="flex flex-wrap gap-2 w-full">
                    {genres.map((genre, index) => (
                      <button
                        key={index}
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${selectedGenres.includes(genre)
                            ? "bg-gray-500 text-white border border-gray-400"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                          }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};