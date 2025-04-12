"use client";
import { useState } from "react";
import { useAuth } from "@/src/lib/features/login/hooks/use-auth";
import { AppProvider } from "@/src/lib/context/app-state";
import { Welcome } from "@/src/lib/features/login/login";
import { Header } from "@/src/lib/features/home/components/header";
import { ArtistScraper } from "../artist_scraping/artist-grid";
import { WebSocketListener } from "../artist_scraping/websocket";
import { PlaylistGridContainer } from "@/src/lib/features/playlist_mining/playlist-grid";
import { LoadedPlaylists } from "../loaded_playlists/loaded-playlists";
import { Button } from "../../components/ui/button";

export const Index = (): JSX.Element => {
  const { isLoading, hasSession, registerAnomUser } = useAuth();
  const [showSeed, setShowSeed] = useState(true);

  const content = hasSession ? (
    <main className="min-h-screen">
      <AppProvider>
        <Header />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-[350px,1fr] gap-6">
            <aside className="space-y-6">
              <LoadedPlaylists />
              <div>
                <WebSocketListener />
              </div>
            </aside>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {showSeed ? "Artists" : "Playlists"}
                </h2>
                <Button
                  onClick={() => setShowSeed((prev) => !prev)}
                  className="bg-gray-200 hover:border-gray-100 text-black rounded px-3 py-1 text-sm transition-colors"
                >
                  Switch to {showSeed ? "Playlist Mining" : "Seeding Pools"}
                </Button>
              </div>
              {showSeed ? <ArtistScraper /> : <PlaylistGridContainer />}
            </section>
          </div>
        </div>

      </AppProvider>
    </main>
  ) : (
    <Welcome isLoading={isLoading} registerAnomUser={registerAnomUser} />
  );
  return content;
};