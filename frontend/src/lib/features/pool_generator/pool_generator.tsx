"use client";
import { useState, useCallback } from "react";
import { api } from "../../services/api";
import { Playlist } from "@/src/lib/context/types";
import { SimpleArtist } from "../loaded_playlists/types/types";
import { Input } from "@/src/lib/components/ui/input";
import { Button } from "@/src/lib/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/lib/components/ui/card";
import { ScrollArea } from "@/src/lib/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/lib/components/ui/select";

export const PoolGenerator: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([{ id: "37i9dQZF1DXcBWIGoYBM5M", name: "Today's Top Hits" }]);
    const [inputValue, setInputValue] = useState<string>("");
    const [artists, setArtists] = useState<SimpleArtist[]>([]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAddPlaylist();
        }
    }, []);

    const handleAddPlaylist = useCallback(async (): Promise<void> => {
        if (!inputValue.trim()) return;
        try {
            const { playlist_name, playlist_id } = await api.get(`/spotify/playlist_meta?id=${inputValue.trim()}`);
            if (!playlist_name) return;
            const newPlaylist: Playlist = {
                id: playlist_id,
                name: playlist_name
            };
            console.log(newPlaylist);
            setPlaylists(prev => [...prev, newPlaylist]);
            setInputValue("");
        } catch (error) {
            console.error("Error fetching playlist metadata:", error);
        }
    }, [inputValue]);

    const handlePlaylistClick = useCallback(async (index: number): Promise<void> => {
        try {
            if (playlists && playlists[index]) {
                const response = await api.get(`/playlists/artists?id=${encodeURIComponent(playlists[index].id)}`);
                setArtists(response.artists); 
            } else {
                console.error("Invalid playlist index or playlists not loaded");
            }
        } catch (error) {
            console.error("Error fetching playlist artists:", error);
        }
    }, [playlists]);

    const scrapeArtists = async (artistId: string) => {
        try {
            await api.post(`/scrape/artists`, {
                artist: artistId,
                depth: 1,
            });
        } catch (error) {
            console.error("Error scraping artists:", error);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Playlists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter playlist ID"
                    />
                    <Button onClick={handleAddPlaylist}>Add</Button>
                </div>
                <div className="space-y-2">
                    {playlists.map((playlist, index) => (
                        <Button
                            key={playlist.id}
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handlePlaylistClick(index)}
                        >
                            {playlist.name}
                        </Button>
                    ))}
                </div>
                {artists.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Artists</h3>
                        <Select onValueChange={(value) => scrapeArtists(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select an artist to scrape" />
                            </SelectTrigger>
                            <SelectContent>
                                <ScrollArea className="h-[200px]">
                                    {artists.map((artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                            {artist.name}
                                        </SelectItem>
                                    ))}
                                </ScrollArea>
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};