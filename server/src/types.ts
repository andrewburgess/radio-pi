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
    uri: string | null
}

export interface ISpotifyTokens {
    access_token: string | null
    created_at: number
    expires_in: number
    redirect_uri: string | null
    refresh_token: string | null
    scope: string | null
    token_type: string | null
}
