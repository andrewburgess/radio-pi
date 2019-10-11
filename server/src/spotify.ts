import { last } from "lodash"
import * as debug from "debug"
import fetch from "node-fetch"
import { stringify } from "querystring"

import tokens from "./tokens"

const btoa = require("btoa")
const log = debug("radio-pi:spotify")

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com"
const SPOTIFY_API = "https://api.spotify.com/v1"

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

async function req(method: string, path: string, body?: any) {
    const t = tokens.getTokens()
    if (!t) {
        throw new Error("no tokens")
    }

    const url = `${SPOTIFY_API}${path}`
    log(`GET ${url}`)
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

async function put(path: string, body?: any) {
    return req("PUT", path, body)
}

/*async function post(path: string, body?: any) {
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

export async function getTracksInformation(uri: string) {
    const parts = uri.split(":")
    const playlist = await get(`/playlists/${last(parts)}`)

    return playlist
}

export async function setPlayer(deviceId: string) {
    return await put("/me/player", { device_ids: [deviceId] })
}

export async function setVolume(deviceId: string, volume: number) {
    return await put("/me/player/volume", { device_id: deviceId, volume_percent: volume })
}

export async function startPlayback() {
    return await put("/me/player/play")
}

export async function stopPlayback() {
    return await put("/me/player/pause")
}
