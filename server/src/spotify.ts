import fetch from "node-fetch"
import { stringify } from "querystring"

const btoa = require("btoa")

const SPOTIFY_ENDPOINT = "https://accounts.spotify.com"

function getAuthorization() {
    return `Basic ${btoa(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`)}`
}

async function requestToken(params: string) {
    const response = await fetch(`${SPOTIFY_ENDPOINT}/api/token`, {
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
