import { ArtistPool } from "../../context/types";

export const ArtistPoolGrid = ({ pool }: { pool: ArtistPool }) => {
    const createSpotifyLink = (artistId: string) => {
        return `spotify:artist:${artistId}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Artist Pool</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pool.artists.map((artist) => (
                    <a
                        href={createSpotifyLink(artist.id)}
                        key={artist.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    >
                        <div className="relative pb-[100%]">
                            {artist.images.length > 0 ? (
                                <img
                                    src={artist.images[0].url}
                                    alt={`${artist.name}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No Image</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <h2 className="font-semibold text-lg mb-1 truncate">{artist.name}</h2>
                            <p className="text-sm text-gray-500">ID: {artist.id}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {artist.images.length} {artist.images.length === 1 ? 'image' : 'images'}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};