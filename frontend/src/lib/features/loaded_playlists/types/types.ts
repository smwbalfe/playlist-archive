export type SimpleArtist = {
    id: string
    name: string
}

export type PlaylistSeededType = {
    genres: string[]
    artists: SimpleArtist[]
}
