"use client";

import { useScrapeArtists } from "@/src/lib/features/artist_scraping/hooks/use-scrape-artist";
import { Label } from "@/src/lib/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/src/lib/components/ui/radio-group";
import { ArtistPoolGrid } from "@/src/lib/features/artist_scraping/artist-pool"
  
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
    handleRadioChange,
    getScrapePool,
    artistPool
  } = useScrapeArtists();

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <RadioGroup
          defaultValue={usePlaylistSeed ? "playlist" : "artist"}
          value={usePlaylistSeed ? "playlist" : "artist"}
          onValueChange={handleRadioChange}
          className="flex flex-row"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="artist" id="artist-option" />
            <Label htmlFor="artist-option">Single Artist Seed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="playlist" id="playlist-option" />
            <Label htmlFor="playlist-option">Playlist Seed</Label>
          </div>
        </RadioGroup>
      </div>

      <button onClick={() => { getScrapePool()}}>
        get pool
      </button>

    
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
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
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
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
          >
            {isScraping ? "Collecting..." : "Collect artist pool from playlists"}
          </button>
        </div>
      )}
    
      {artistPool && <ArtistPoolGrid pool={artistPool} />}
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
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 transition-colors"
        >
          {isScraping ? "Collecting..." : "Collect artist pool from playlists"}
        </button>
      </div>
    </div>
  );
};