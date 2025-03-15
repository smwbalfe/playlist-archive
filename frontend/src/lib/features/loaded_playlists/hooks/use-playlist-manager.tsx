"use client";
import { useState, useCallback } from "react";
import { api } from "@/src/lib/services/api";
import { parseSpotifyId } from "@/src/lib//utils/utils";
import { useApp } from "@/src/lib/context/app-state";
import { Playlist } from "@/src/lib/context/types";


const usePlaylistManagement = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [activePlaylistIndex, setActivePlaylistIndex] = useState<number | null>(
    null,
  );

  const { setApp } = useApp();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [],
  );

  const addPlaylist = useCallback( async () => {
    if (!inputValue.trim()) return;

    const playlistName = await api.get(`/spotify/playlist_meta?id=${inputValue.trim()}`)

    const newPlaylist: Playlist = {
      id: inputValue.trim(),
      name: playlistName.playlist_name
    }

    setPlaylists((prev) => {
      const newPlaylists = [...prev, newPlaylist];
      if (newPlaylists.length === 1 && activePlaylistIndex === null) {
        setActivePlaylistIndex(0);
      }
      return newPlaylists;
    });

    setApp((prevApp) => ({
      ...prevApp,
      playlists: [...(prevApp.playlists || []), newPlaylist],
    }));
    setInputValue("");
  }, [inputValue, activePlaylistIndex]);

  const handleRemovePlaylist = useCallback(
    (index: number) => {
      setPlaylists((prev) => {
        const newPlaylists = prev.filter((_, i) => i !== index);
        if (activePlaylistIndex === index) {
          if (newPlaylists.length > 0) {
            setActivePlaylistIndex(0);
          } else {
            setActivePlaylistIndex(null);
          }
        } else if (
          activePlaylistIndex !== null &&
          index < activePlaylistIndex
        ) {
          setActivePlaylistIndex(activePlaylistIndex - 1);
        }
        return newPlaylists;
      });
    },
    [activePlaylistIndex],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        addPlaylist();
      }
    },
    [addPlaylist],
  );

  const setActivePlaylist = useCallback((index: number) => {
    setActivePlaylistIndex(index);
  }, []);

  return {
    playlists,
    inputValue,
    activePlaylistIndex,
    handleInputChange,
    addPlaylist,
    handleRemovePlaylist,
    handleKeyPress,
    setActivePlaylist,
  };
};

const useGenreManagement = (
  playlists: Playlist[],
  activePlaylistIndex: number | null,
) => {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const { setApp } = useApp();

  const getGenres = useCallback(async (): Promise<void> => {
    try {
      if (!playlists.length) return;
      const genreData: string[] = await api.get(
        `/spotify/playlists/genres?id=${parseSpotifyId(
          playlists[activePlaylistIndex !== null ? activePlaylistIndex : 0].id,
        )}`,
      );
      setGenres(genreData);
      setSelectedGenres([]);
    } catch (error) {
      console.error("Error:", error);
    }
  }, [playlists, activePlaylistIndex]);

  const toggleGenre = useCallback((genre: string) => {
    console.log(toggleGenre)
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );

    setApp(prevState => ({
      ...prevState,
      selectedGenres: [...prevState.selectedGenres, genre]
    }));

  }, []);

  return {
    genres,
    selectedGenres,
    getGenres,
    toggleGenre,
  };
};

export const usePlaylistManager = () => {
  const {
    playlists,
    inputValue,
    activePlaylistIndex,
    handleInputChange,
    addPlaylist,
    handleRemovePlaylist,
    handleKeyPress,
    setActivePlaylist,
  } = usePlaylistManagement();

  const { genres, selectedGenres, getGenres, toggleGenre } = useGenreManagement(
    playlists,
    activePlaylistIndex,
  );

  return {
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
  };
};
