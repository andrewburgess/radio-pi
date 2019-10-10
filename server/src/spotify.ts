import fetch from "node-fetch"
import { stringify } from "querystring"

import tokens from "./tokens"

const btoa = require("btoa")

const SPOTIFY_ACCOUNTS = "https://accounts.spotify.com"
const SPOTIFY_API = "https://api.spotify.com/v1"

function getAuthorization() {
    return `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`
}

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
    const t = tokens.getTokens()
    if (!t) {
        throw new Error("no tokens")
    }

    const response = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${t.access_token}`
        }
    })

    const data = await response.json()

    if (data.context) {
        const contextResponse = await fetch(data.context.href, {
            method: "GET",
            headers: {
                authorization: `Bearer ${t.access_token}`
            }
        })

        const contextData = await contextResponse.json()
        data.context.metadata = {
            name: contextData.name
        }
    }

    return data
}

export async function setPlayer(deviceId: string) {
    const t = tokens.getTokens()
    if (!t) {
        throw new Error("no tokens")
    }

    const response = await fetch(`${SPOTIFY_API}/me/player`, {
        method: "PUT",
        body: JSON.stringify({
            device_ids: [deviceId]
        }),
        headers: {
            authorization: `Bearer ${t.access_token}`
        }
    })

    const text = await response.text()
    return text
}

export async function startPlayback() {
    const t = tokens.getTokens()
    if (!t) {
        throw new Error("no tokens")
    }

    const response = await fetch(`${SPOTIFY_API}/me/player/play`, {
        method: "PUT",
        headers: {
            authorization: `Bearer ${t.access_token}`
        }
    })

    const text = await response.text()
    return text
}
