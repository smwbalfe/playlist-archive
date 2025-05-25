import { Music2 } from "lucide-react";
import { FC } from "react";
import { Playlist } from "./types/types";

export const PlaylistView: FC<{ playlistData: Playlist[] }> = ({ playlistData }) => {
    return (
        <>
            {playlistData.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                    <Music2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>Start your search to discover playlists</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {playlistData.map((playlist) => (
                        <div key={`playlist-${playlist.uri}`} className="bg-white rounded border border-gray-200 hover:shadow-md transition-shadow">
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
            )}
        </>
    );
};