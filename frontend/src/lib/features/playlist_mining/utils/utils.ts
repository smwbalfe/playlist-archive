import { api } from "@/src/lib/services/api";
import { SimpleTrack } from "../types/types";
import { toast } from "sonner";

export const createPlaylist = async (tracks: SimpleTrack[]) => {
    try {
        const data = await api.post("/spotify/playlist/create", {
            tracks: tracks.map((track) => track.id),
        });
        const spotifyAppUri = data.link
            .replace("https://open.spotify.com/", "spotify:")
            .replace(/\//g, ":");
        toast("Playlist created", {
            description: "Your new playlist is ready",
            action: {
                label: "View on Spotify",
                onClick: () => window.open(spotifyAppUri, "_self"),
            },
        });
    } catch (error) {
        console.error("Error creating playlist:", error);
        toast.error("Failed to create playlist");
    }
};

export const openSpotify = (trackId: string) => {
    window.location.href = `spotify:track:${trackId}`;
};

