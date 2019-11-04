export enum Key {
    STATIONS = "STATIONS",
    TOKENS = "TOKENS"
}

export enum RadioBand {
    AM,
    FM
}

export interface IStation {
    band: RadioBand
    frequency: number
    lastUpdate: number
    tracks: ITrack[]
    uri: string | null
}

export interface ITrack {
    track: {
        duration_ms: number
        id: string
    }
}

export interface ISpotifyTokens {
    access_token: string | null
    created_at: number
    expires_in: number
    redirect_uri: string | null
    refresh_token: string | null
    scope: string | null
    token_type: string | null
    username: string | null
}

export interface IUserProfile {
    country: string
    display_name: string
    email: string
    external_urls: any
    followers: any
    href: string
    id: string
    images: any
    product: string
    type: string
    uri: string
}
