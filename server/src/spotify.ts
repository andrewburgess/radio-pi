import { last } from "lodash"
import * as debug from "debug"
import fetch from "node-fetch"
import { stringify } from "querystring"

import tokens from "./tokens"
import { ITrack } from "./types"

const btoa = require("btoa")
const log = debug("radio-pi:spotify")

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com"
const SPOTIFY_API = "https://api.spotify.com/v1"
const SPOTIFY_AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize"
const SPOTIFY_SCOPES = [
    "streaming",
    "playlist-read-collaborative",
    "playlist-read-private",
    "user-library-read",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-private",
    "user-read-playback-state",
    "user-read-recently-played",
    "user-top-read"
]

function getAuthorization() {
    return `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`
}

async function get(path: string, query?: any) {
    const t = tokens.getTokens()
    if (!t) {
        throw new Error("no tokens")
    }

    const url = `${path.indexOf(SPOTIFY_API) === -1 ? SPOTIFY_API : ""}${path}?${stringify(query || {})}`
    log(`GET ${url}`)
    const response = await fetch(url, {
        method: "GET",
        headers: {
            authorization: `Bearer ${t.access_token}`
        }
    })

    if ((response.headers.get("content-type") || "").indexOf("application/json") >= 0) {
        return await response.json()
    }

    return response.text()
}

async function req(method: string, path: string, body?: any, query?: any) {
    const t = tokens.getTokens()
    if (!t) {
        throw new Error("no tokens")
    }

    const url = `${SPOTIFY_API}${path}${query ? "?" + stringify(query) : ""}`
    log(`${method} ${url} :: ${body}`)
    const response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
            authorization: `Bearer ${t.access_token}`
        }
    })

    if ((response.headers.get("content-type") || "").indexOf("application/json") >= 0) {
        return await response.json()
    }

    return await response.text()
}

async function put(path: string, body?: any, query?: any) {
    return req("PUT", path, body, query)
}

/*async function post(path: string, body?: any, query?: any) {
    return req("POST", path, body)
}*/

async function requestToken(params: string) {
    const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
        body: params,
        headers: {
            authorization: getAuthorization(),
            "content-type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    })

    return await response.json()
}

export async function refresh(refreshToken: string) {
    const params = stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    })

    return await requestToken(params)
}

export async function token(code: string, redirectUri: string) {
    const params = stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
    })

    return await requestToken(params)
}

export function getAuthorizeUrl(redirectUri: string) {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    if (!clientId) {
        throw new Error("SPOTIFY_CLIENT_ID is not defined")
    }

    const parameters = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SPOTIFY_SCOPES.join(" ")
    }

    return `${SPOTIFY_AUTHORIZE_ENDPOINT}?${stringify(parameters)}`
}

export async function getCurrentState() {
    const state = await get("/me/player/currently-playing")

    if (state.context) {
        const context = await get(state.context.href, { fields: "name" })
        state.context.metadata = {
            name: context.name
        }
    }

    return state
}

export async function getTracksInformation(uri: string): Promise<ITrack[]> {
    const getPage = async (offset: number = 0) => {
        return get(`/playlists/${last(parts)}/tracks`, {
            fields: "total,items(track(id,duration_ms))",
            limit: 100,
            offset
        })
    }

    const parts = uri.split(":")
    const playlist = await getPage()

    if (playlist.total > 100) {
        let total = playlist.total - 100

        while (total > 0) {
            const next = await getPage(playlist.total - total)
            playlist.items.push(...next.items)
            total = total - next.items.length
        }
    }

    return playlist.items
}

export async function setPlayer(deviceId: string) {
    return await put("/me/player", { device_ids: [deviceId] })
}

export async function setRepeat(deviceId: string) {
    return await put("/me/player/repeat", {}, { device_id: deviceId, state: "context" })
}

export async function setVolume(deviceId: string, volume: number) {
    return await put("/me/player/volume", {}, { device_id: deviceId, volume_percent: volume })
}

export async function startPlayback(deviceId: string, contextUri: string, offset: number = 0, position: number = 0) {
    log(`starting playback on ${deviceId} with uri :: ${contextUri} (offset: ${offset}, position: ${position})`)
    return await put(
        "/me/player/play",
        {
            context_uri: contextUri,
            offset: {
                position: offset
            },
            position_ms: position
        },
        { device_id: deviceId }
    )
}

export async function stopPlayback() {
    return await put("/me/player/pause")
}
