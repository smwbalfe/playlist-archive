"use client";
import { useScrapeArtists } from "@/src/lib/features/artist_scraping/hooks/use-scrape-artist";
import { useApp } from "@/src/lib/context/app-state";

export const ArtistScraper = () => {
  const {
    artist,
    setArtist,
    depth,
    setDepth,
    isScraping,
    scrapeArtists,
    scrapePlaylistSeed,
    usePlaylistSeed,
    toggleSeedMethod
  } = useScrapeArtists();

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center mb-4">
        <button
          onClick={toggleSeedMethod}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Switch to {usePlaylistSeed ? "Artist ID" : "Playlist Seed"}
        </button>
      </div>
      {!usePlaylistSeed ? (
        <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Enter Artist ID"
            className="px-3 py-2 border rounded"
          />
          <input
            type="number"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            placeholder="Depth"
            min="1"
            max="3"
            className="px-3 py-2 border rounded"
          />
          <button
            onClick={scrapeArtists}
            disabled={isScraping || !artist}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
          >
            {isScraping ? "Collecting..." : "Collect artist pool"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
          <p>
            This uses your playlists you entered to seed the scrape using a subset
            of artists from it
          </p>
          <button
            onClick={scrapePlaylistSeed}
            disabled={isScraping}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
          >
            {isScraping ? "Collecting..." : "Collect artist pool from playlists"}
          </button>
        </div>
      )}
    </div>
  );
};

export const ArtistGrid = () => {
  const {
    artist,
    setArtist,
    depth,
    setDepth,
    isScraping,
    scrapeArtists,
  } = useScrapeArtists();

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Enter Artist ID"
          className="px-3 py-2 border rounded"
        />
        <input
          type="number"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          placeholder="Depth"
          min="1"
          max="3"
          className="px-3 py-2 border rounded"
        />
        <button
          onClick={scrapeArtists}
          disabled={isScraping || !artist}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
        >
          {isScraping ? "Collecting..." : "Collect artist pool"}
        </button>
      </div>
    </div>
  );
};

export const PlaylistSeed = () => {
  const { isScraping, scrapePlaylistSeed } = useScrapeArtists();

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col gap-3 w-full max-w-xs mb-8">
        <p>
          This uses your playlists you entered to seed the scrape using a subset
          of artists from it
        </p>
        <button
          onClick={scrapePlaylistSeed}
          disabled={isScraping}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300 transition-colors"
        >
          {isScraping ? "Collecting..." : "Collect artist pool from playlists"}
        </button>
      </div>
    </div>
  );
};