export const DOCUMENT_STATIONS = "STATIONS"

export const DOCUMENT_STATIONS = "STATIONS"
export const DOCUMENT_TOKENS = "TOKENS"

export const MESSAGE_CLIENT_TYPE = "client:type"
export const MESSAGE_PLAYER_CONNECTED = "player:connected"
export const MESSAGE_PLAYER_DISCONNECTED = "player:disconnected"
export const MESSAGE_PLAYER_STATE_CHANGED = "player:state-changed"
export const MESSAGE_REQUEST_TOKEN = "player:request-token"
export const MESSAGE_TOKEN = "player:token"
export const MESSAGE_UNAUTHORIZED = "player:unauthorized"

export const AUTHORIZED_STATE = {
    UNKNOWN: 0,
    AUTHORIZED: 1,
    UNAUTHORIZED: 2
}

export const CLIENT_TYPE = {
    PLAYER: "player",
    REMOTE: "remote"
}

export const RADIO_BAND = {
    AM: 0,
    FM: 1
}

export const SPOTIFY_STATION_TYPE = {
    PLAYLIST: 0,
    RECOMMENDATIONS: 1
}

export const SPOTIFY_PLAYER_EVENTS = {
    ACCOUNT_ERROR: "account_error",
    AUTHENTICATION_ERROR: "authentication_error",
    INITIALIZATION_ERROR: "initialization_error",
    NOT_READY: "not_ready",
    PLAYBACK_ERROR: "playback_error",
    PLAYER_STATE_CHANGED: "player_state_changed",
    READY: "ready"
}
