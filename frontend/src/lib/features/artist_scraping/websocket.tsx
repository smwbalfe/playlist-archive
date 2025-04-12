import React, { useEffect, useState } from "react";
import { useApp } from "@/src/lib/context/app-state";
import { Card } from "@/src/lib/components/ui/card";
import { Checkbox } from "@/src/lib/components/ui/checkbox";
import { Music } from "lucide-react";
import env from "@/src/lib/config/env";

// Define types for our component
interface Scrape {
  id: string;
  seed_artist: string;
  total_artists: number;
  depth: number;
}

interface AppState {
  scrapes: Scrape[];
  activeScrapes: string[];
}

interface AppContext {
  app: AppState;
  setApp: React.Dispatch<React.SetStateAction<AppState>>;
}

export const WebSocketListener: React.FC = () => {
  const [status, setStatus] = useState<string>("Disconnected");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const { app, setApp } = useApp();

  useEffect(() => {
    if (!app.activeScrapes) setApp((prev) => ({ ...prev, activeScrapes: [] }));
    const socket = new WebSocket(env.NEXT_PUBLIC_WEBSOCKET_API);

    socket.addEventListener("open", () => setStatus("Connected"));
    socket.addEventListener("close", () => setStatus("Disconnected"));
    socket.addEventListener("error", () => setStatus("Error"));
    socket.addEventListener("message", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as Scrape;
        if (data.id) {
          setApp((prev: any) => {
            const exists = prev.scrapes.some(
              (response: any) => response.id === data.id
            );
            return exists
              ? prev
              : { ...prev, scrapes: [...prev.scrapes, data] };
          });
        }
      } catch (e) { }
    });
    return () => socket.close();
  }, [setApp, app.activeScrapes]);

  const toggleScrape = (id: string, checked: boolean): void => {
    setApp((prev) => ({
      ...prev,
      activeScrapes: checked
        ? [...(prev.activeScrapes || []), id]
        : prev.activeScrapes.filter((scrapeId) => scrapeId !== id),
    }));
  };

  const toggleExpand = (id: string): void => {
    setExpandedIds(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Artist Pools</h2>
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm">
          <div
            className={`h-3 w-3 rounded-full ${status === "Connected" ? "bg-green-500" : "bg-red-600"
              }`}
          />
          <span className="text-sm font-medium text-gray-600">{status}</span>
        </div>
      </div>
      {app.scrapes?.length ? (
        <div>
          {app.scrapes.map(({ id, seed_artist, total_artists, depth }) => (
            <div key={id} className="border mb-2 p-2 rounded bg-white">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => toggleExpand(id)}
              >
                <span className="mr-2 font-bold">{seed_artist}</span>
                <span className="ml-auto text-gray-500">
                  {expandedIds.includes(id) ? '▼' : '►'}
                </span>
              </div>

              {expandedIds.includes(id) && (
                <div className="mt-2 pl-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600">Select:</span>
                    <Checkbox
                      checked={app.activeScrapes?.includes(id)}
                      onCheckedChange={(checked) => toggleScrape(id, checked as boolean)}
                      className="ml-2"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p>pool_id: {id}</p>
                    <p>{total_artists} Artists</p>
                    <p>{depth} layers deep</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center bg-gray-100 border border-gray-200">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No artist pools available yet</p>
          <p className="text-sm text-gray-500 mt-2">Pools will appear here once connected</p>
        </Card>
      )}
    </div>
  );
};