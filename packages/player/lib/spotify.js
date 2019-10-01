const fetch = require("node-fetch")
const qs = require("querystring")
const btoa = require("btoa")

const API_ENDPOINT = "https://accounts.spotify.com"

function getAuthorization() {
    return `Basic ${btoa(`${process.env.REACT_APP_SPOTIFY_CLIENT_ID}:${process.env.REACT_APP_SPOTIFY_CLIENT_SECRET}`)}`
}

async function requestToken(params) {
    const response = await fetch(`${API_ENDPOINT}/api/token`, {
        body: params,
        headers: {
            authorization: getAuthorization(),
            "content-type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    })

    return await response.json()
}

module.exports.refresh = async (refreshToken) => {
    const params = qs.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken
    })

    return await requestToken(params)
}

module.exports.token = async (code, redirectUri) => {
    const params = qs.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
    })

    return await requestToken(params)
}
