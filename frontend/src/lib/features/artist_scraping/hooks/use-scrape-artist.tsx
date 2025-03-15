import { api } from "@/src/lib/services/api";
import { Artist } from "@/src/lib/features/artist_scraping/types/types";
import { useState } from "react";
import { useApp } from "@/src/lib/context/app-state";

export const useScrapeArtists = () => {
  const [artist, setArtist] = useState<string>("");
  const [depth, setDepth] = useState("2");
  const [isScraping, setIsScraping] = useState(false);
  const [artistData, setArtistData] = useState<Artist[]>([]);
  const [usePlaylistSeed, setUsePlaylistSeed] = useState(false);
  const { app } = useApp();

  const toggleSeedMethod = () => {
    setUsePlaylistSeed(!usePlaylistSeed);
  };

  const scrapeArtists = async () => {
    try {
      setIsScraping(true);
      const response = await api.post("/scrape/artists", {
        artist: artist,
        depth: parseInt(depth),
      });
      const artistsArray =
        response.artists?.filter(
          (artist: any) => artist.id && artist.profile?.name,
        ) || [];
      setArtistData(artistsArray);
      console.log("Processed artist data:", artistsArray);
    } catch (error) {
      console.error("Error scraping artists:", error);
      setArtistData([]);
    } finally {
      setIsScraping(false);
    }
  };

  const scrapePlaylistSeed = async () => {
    try {
      setIsScraping(true);
      let queryString = '/scrape/playlists_seed';
      app.playlists.forEach((playlist, index) => {
        const separator = index === 0 ? '?' : '&';
        queryString += `${separator}id=${playlist.id}`;
      });
      const response = await api.get(queryString);
      console.log(response);
    } catch (error) {
      console.error("Error scraping artists:", error);
      setArtistData([]);
    } finally {
      setIsScraping(false);
    }
  };

  return {
    artist,
    setArtist,
    depth,
    setDepth,
    isScraping,
    artistData,
    scrapeArtists,
    scrapePlaylistSeed,
    app,
    usePlaylistSeed,
    toggleSeedMethod
  };
};