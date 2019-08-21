import qs from "querystring"

const REDIRECT_URI = `${window.location.origin}/auth.html`
const AUTHORIZE_ENDPOINT = `https://accounts.spotify.com/authorize?response_type=code&client_id=${
    process.env.REACT_APP_SPOTIFY_CLIENT_ID
}&scope=${encodeURIComponent(
    `streaming user-modify-playback-state user-read-birthdate user-read-email user-read-private`
)}&redirect_uri=${REDIRECT_URI}`

export const RepeatMode = {
    NO_REPEAT: 0,
    ONCE_REPEAT: 1,
    FULL_REPEAT: 2
}

export const TrackType = {
    TRACK: "track",
    EPISODE: "episode",
    AD: "ad"
}

async function getTokens(code) {
    if (!code) {
        throw new Error("code not supplied")
    }
    const response = await fetch("/api/spotify/token", {
        body: JSON.stringify({
            code,
            redirect_uri: REDIRECT_URI
        }),
        headers: {
            "content-type": "application/json"
        },
        method: "POST"
    })
    const data = await response.json()
    data.redirect_uri = REDIRECT_URI

    return data
}

export async function authorize() {
    return new Promise((resolve) => {
        const handleMessage = async (event) => {
            if (event.origin !== window.location.origin) {
                return null
            }

            try {
                const message = JSON.parse(event.data)

                if (message.type !== "SPOTIFY_AUTH") {
                    return
                }

                const code = qs.parse(message.payload).code

                const tokens = await getTokens(code)

                return resolve(tokens)
            } catch (e) {}
        }

        window.addEventListener("message", handleMessage)
        window.open(AUTHORIZE_ENDPOINT)
    })
}

export async function refresh(refreshToken) {
    return await getTokens(refreshToken)
}
