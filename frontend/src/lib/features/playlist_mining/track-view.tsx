import { ListMusic } from "lucide-react";
import { FC, useState } from "react";
import { SimpleTrack } from "./types/types";
import { createPlaylist, openSpotify } from "./utils/utils";

// Custom hook for track popup functionality
const useTrackPopup = () => {
    const [activeTrackPopup, setActiveTrackPopup] = useState<string | null>(null);

    const toggleTrackPopup = (trackId: string) => {
        setActiveTrackPopup(activeTrackPopup === trackId ? null : trackId);
    };

    return { activeTrackPopup, toggleTrackPopup };
};

const TrackPopup: FC<{ track: SimpleTrack; onClose: () => void }> = ({ track, onClose }) => {
    return (
        <div className="absolute z-10 top-full left-0 mt-2 w-full bg-white rounded-lg border border-gray-300 shadow-lg p-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
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
                    <span className="font-medium">{track.playcount} Streams</span>
                </div>
                <button
                    className="text-gray-500 hover:text-black ml-auto"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            {track.genres && track.genres.length > 0 && (
                <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Genres:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                        {track.genres.map((genre, index) => (
                            <span
                                key={index}
                                className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-gray-200 text-gray-800"
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <button
                className="w-full text-center py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white font-medium transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    openSpotify(track.id);
                }}
            >
                Open in Spotify
            </button>
        </div>
    );
};

const ArtistTrackCard: FC<{
    track: SimpleTrack;
    isActive: boolean;
    onClick: () => void;
    onDetailsClick: (e: React.MouseEvent) => void;
}> = ({ track, isActive, onClick, onDetailsClick }) => {
    return (
        <div className="relative w-full">
            <div
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                onClick={onClick}
            >
                <div className="flex flex-col">
                    {/* Album Art - Larger and not grayscale */}
                    <img
                        src={track?.coverArt?.sources?.[0]?.url ?? "/api/placeholder/120/120"}
                        alt={track?.name ?? "Track artwork"}
                        className="w-full h-40 object-cover rounded-md mb-3"
                    />

                    {/* Track Information */}
                    <div className="flex-1">
                        {/* Track Name - Larger and bolder */}
                        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
                            {track.name}
                        </h3>

                        {/* Artists - Clearer text */}
                        <p className="text-base text-gray-700 mb-2 line-clamp-2">
                            {track.artists?.map((artist) => artist.name).join(", ")}
                        </p>

                        {/* Play Count */}
                        <div className="flex items-center text-gray-600 mb-3">
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
                            <span>{track.playcount} streams</span>
                        </div>

                        {/* Details Button */}
                        <button
                            className="w-full text-center py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm font-medium transition-colors"
                            onClick={onDetailsClick}
                        >
                            Show details
                        </button>
                    </div>
                </div>
            </div>

            {/* Popup Component */}
            {isActive && (
                <TrackPopup track={track} onClose={onClick} />
            )}
        </div>
    );
};

export const TrackView: FC<{ tracks: SimpleTrack[] }> = ({ tracks }) => {
    const { activeTrackPopup, toggleTrackPopup } = useTrackPopup();
    const filteredTracks = tracks.filter(track => track.playcount);

    return filteredTracks.length === 0 ? (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
            <ListMusic className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-lg text-gray-500">No tracks match your filter</p>
        </div>
    ) : (
        <div className="space-y-6">
            {/* Header with Create Playlist button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Tracks</h2>

                <button
                    onClick={() => createPlaylist(filteredTracks)}
                    className="px-6 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors font-medium flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Create Playlist
                </button>
            </div>

            {/* Track Grid with better spacing and responsive design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTracks.map((track) => (
                    <ArtistTrackCard
                        key={`track-${track.id}`}
                        track={track}
                        isActive={activeTrackPopup === track.id}
                        onClick={() => toggleTrackPopup(track.id)}
                        onDetailsClick={(e) => {
                            e.stopPropagation();
                            toggleTrackPopup(track.id);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default TrackView;