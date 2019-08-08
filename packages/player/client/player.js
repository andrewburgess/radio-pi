const {
    CLIENT_TYPE,
    MESSAGE_CLIENT_TYPE,
    MESSAGE_PLAYER_CONNECTED,
    MESSAGE_REQUEST_TOKEN,
    MESSAGE_TOKEN,
    SPOTIFY_PLAYER_EVENTS
} = require("@revolt-radio/common")

let player
const ws = new WebSocket(`ws://${window.location.hostname}:3001/ws`)

const notifyConnection = () => {
    ws.send(
        JSON.stringify({
            payload: CLIENT_TYPE.PLAYER,
            type: MESSAGE_CLIENT_TYPE
        })
    )
}

if (ws.readyState === WebSocket.OPEN) {
    notifyConnection()
} else {
    ws.addEventListener("open", () => notifyConnection())
}

window.onSpotifyWebPlaybackSDKReady = () => {
    player = new window.Spotify.Player({
        name: "REVOLT Radio",
        getOAuthToken: async (cb) => {
            ws.addEventListener("message", (event) => {
                const message = JSON.parse(event.data)

                if (message.type === MESSAGE_TOKEN) {
                    event.preventDefault()
                    event.stopPropagation()

                    cb(message.payload.access_token)
                }
            })

            ws.send(
                JSON.stringify({
                    type: MESSAGE_REQUEST_TOKEN
                })
            )
        }
    })

    player.addListener(SPOTIFY_PLAYER_EVENTS.READY, ({ device_id }) => {
        ws.send(
            JSON.stringify({
                type: MESSAGE_PLAYER_CONNECTED,
                payload: device_id
            })
        )
    })

    player.connect()
}
