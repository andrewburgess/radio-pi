export const DOCUMENT_TOKENS = "TOKENS"

export const MESSAGE_CLIENT_TYPE = "client:type"
export const MESSAGE_REQUEST_TOKEN = "player:request-token"
export const MESSAGE_TOKEN = "player:token"
export const MESSAGE_UNAUTHORIZED = "player:unauthorized"

export enum AUTHORIZED_STATE {
    UNKNOWN,
    AUTHORIZED,
    UNAUTHORIZED
}

export enum CLIENT_TYPE {
    PLAYER = "player",
    REMOTE = "remote"
}

export interface ISpotifyTokens {
    access_token: string
    expires_in: number
    redirect_uri: string
    refresh_token: string
    scope: string
    token_type: "Bearer"
}
