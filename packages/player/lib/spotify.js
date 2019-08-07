const fetch = require("node-fetch")
const qs = require("querystring")
const btoa = require("btoa")

const API_ENDPOINT = "https://accounts.spotify.com"

module.exports.token = async (code, redirectUri) => {
    const authorization = `Basic ${btoa(
        `${process.env.REACT_APP_SPOTIFY_CLIENT_ID}:${process.env.REACT_APP_SPOTIFY_CLIENT_SECRET}`
    )}`

    const params = qs.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri
    })
    const response = await fetch(`${API_ENDPOINT}/api/token`, {
        body: params,
        headers: {
            authorization,
            "content-type": "application/x-www-form-urlencoded"
        },
        method: "POST"
    })

    const data = await response.json()

    return data
}
