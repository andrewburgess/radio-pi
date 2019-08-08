module.exports.DOCUMENT_STATIONS = "STATIONS"
module.exports.DOCUMENT_TOKENS = "TOKENS"

module.exports.MESSAGE_CLIENT_TYPE = "client:type"
module.exports.MESSAGE_PLAYER_CONNECTED = "player:connected"
module.exports.MESSAGE_PLAYER_DISCONNECTED = "player:disconnected"
module.exports.MESSAGE_REQUEST_TOKEN = "player:request-token"
module.exports.MESSAGE_TOKEN = "player:token"
module.exports.MESSAGE_UNAUTHORIZED = "player:unauthorized"

module.exports.AUTHORIZED_STATE = {
    UNKNOWN: 0,
    AUTHORIZED: 1,
    UNAUTHORIZED: 2
}

module.exports.CLIENT_TYPE = {
    PLAYER: "player",
    REMOTE: "remote"
}

module.exports.RADIO_BAND = {
    AM: 0,
    FM: 1
}

module.exports.SPOTIFY_STATION_TYPE = {
    PLAYLIST: 0,
    RECOMMENDATIONS: 1
}

module.exports.SPOTIFY_PLAYER_EVENTS = {
    ACCOUNT_ERROR: "account_error",
    AUTHENTICATION_ERROR: "authentication_error",
    INITIALIZATION_ERROR: "initialization_error",
    NOT_READY: "not_ready",
    PLAYBACK_ERROR: "playback_error",
    PLAYER_STATE_CHANGED: "player_state_changed",
    READY: "ready"
}
