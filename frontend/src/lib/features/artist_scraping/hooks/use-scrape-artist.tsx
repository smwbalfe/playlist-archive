import { api } from "@/src/lib/services/api";
import { Artist } from "@/src/lib/features/artist_scraping/types/types";
import { useState } from "react";
import { useApp } from "@/src/lib/context/app-state";
import { ArtistPool } from "@/src/lib/context/types";

export const useScrapeArtists = () => {
  const [artist, setArtist] = useState<string>("");
  const [depth, setDepth] = useState("2");
  const [isScraping, setIsScraping] = useState(false);
  const [artistData, setArtistData] = useState<Artist[]>([]);
  const [artistPool, setArtistPool] = useState<ArtistPool>();
  const [usePlaylistSeed, setUsePlaylistSeed] = useState(false);
  const [randArt, setRandArt] = useState<string>("")
  const { app } = useApp();

  const toggleSeedMethod = () => {
    setUsePlaylistSeed(!usePlaylistSeed);
  };
  const handleRadioChange = (value: any) => {
    if ((value === "playlist") !== usePlaylistSeed) {
      toggleSeedMethod();
    }
  };

  const getRandomArtist = async () => {
    try { 
      const response = await api.get(`/spotify/artist/random?pool=${app.scrapes[0].id}`);
      await api.get(`/spotify/artist/genres?artist=${response.artist}`);
      setRandArt(response.artist);
    } catch (error) {
      console.error(error);
      setRandArt("");
    }
  };

  const scrapeArtists = async () => {
    console.log("something")
    try {
      setIsScraping(true);
      const response = await api.post(`/scrape/artists`, {
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

  const getScrapePool = async () => {
    try {
      setIsScraping(true);
      console.log(app)
      const response = await api.get<ArtistPool>(`/scrape/artist/pool?pool=${app.activeScrapes[0]}`);
      setArtistPool(response)
      console.log("Processed artist data:", response);
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
    toggleSeedMethod,
    getRandomArtist,
    randArt,
    handleRadioChange,
    getScrapePool,
    artistPool
  };
};