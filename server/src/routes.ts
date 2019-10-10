import { Request, Response, Router } from "express"
import { stringify } from "querystring"

import * as database from "./database"
import { token } from "./spotify"

const router = Router()

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

/**
 * Exchanges an authorization code for Spotify access/refresh tokens
 * @param req Incoming HTTP Requst
 * @param res Outgoing HTTP Response
 */
async function getAccessToken(req: Request, res: Response): Promise<Response> {
    const { code, redirect_uri } = req.body

    if (!code) {
        return res.status(400).json({
            error: true,
            message: "Missing code",
            status: 400
        })
    }

    if (!redirect_uri) {
        return res.status(400).json({
            error: true,
            message: "Missing redirect_uri",
            status: 400
        })
    }

    const tokens = await token(code, redirect_uri)

    return res.json(tokens)
}

/**
 * Generates the URL for authorizing a Spotify session
 * @param req Incoming HTTP Request
 * @param res Outgoing HTTP Response
 */
function getAuthorizeUrl(req: Request, res: Response): Response {
    const redirectUri = req.query.redirect_uri
    if (!redirectUri) {
        return res.status(400).json({
            error: true,
            message: "Missing redirect_uri query parameter",
            status: 400
        })
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    if (!clientId) {
        return res.status(500).json({
            error: true,
            message: "SPOTIFY_CLIENT_ID is not defined",
            status: 500
        })
    }

    const parameters = {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: SPOTIFY_SCOPES.join(" ")
    }

    return res.json({
        url: `${SPOTIFY_AUTHORIZE_ENDPOINT}?${stringify(parameters)}`
    })
}

function getStations(req: Request, res: Response): Response {
    const stations = database.get(database.Key.STATIONS)
    return res.json(stations)
}

router.get("/api/spotify/url", getAuthorizeUrl)
router.post("/api/spotify/token", getAccessToken)
router.get("/api/stations", getStations)

export default router
