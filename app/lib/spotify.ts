import * as qs from "querystring"
import { ISpotifyTokens } from "../constants"

const REDIRECT_URI = `${window.location.origin}/auth.html`
const AUTHORIZE_ENDPOINT = `https://accounts.spotify.com/authorize?response_type=code&client_id=${
    process.env.REACT_APP_SPOTIFY_CLIENT_ID
}&scope=${encodeURIComponent(
    `streaming user-modify-playback-state user-read-birthdate user-read-email user-read-private`
)}&redirect_uri=${REDIRECT_URI}`

export enum PlayerEvents {
    ACCOUNT_ERROR = "account_error",
    AUTHENTICATION_ERROR = "authentication_error",
    INITIALIZATION_ERROR = "initialization_error",
    NOT_READY = "not_ready",
    PLAYBACK_ERROR = "playback_error",
    PLAYER_STATE_CHANGED = "player_state_changed",
    READY = "ready"
}

export enum RepeatMode {
    NO_REPEAT = 0,
    ONCE_REPEAT = 1,
    FULL_REPEAT = 2
}

export enum TrackType {
    TRACK = "track",
    EPISODE = "episode",
    AD = "ad"
}

async function getTokens(code: string): Promise<ISpotifyTokens> {
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
    const data = (await response.json()) as ISpotifyTokens
    data.redirect_uri = REDIRECT_URI

    return data
}

export async function authorize(): Promise<ISpotifyTokens> {
    return new Promise((resolve) => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) {
                return null
            }

            const message = qs.parse(event.data)
            const code = message.code as string

            const tokens = await getTokens(code)

            return resolve(tokens)
        }

        window.addEventListener("message", handleMessage)
        window.open(AUTHORIZE_ENDPOINT)
    })
}

export async function refresh(refreshToken: string): Promise<ISpotifyTokens> {
    return await getTokens(refreshToken)
}
