import { Request, Response, Router } from "express"

import * as database from "./database"
import { getAuthorizeUrl, token, getTracksInformation } from "./spotify"
import { Key } from "./types"

const router = Router()

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
function getAuthUrl(req: Request, res: Response): Response {
    const redirectUri = req.query.redirect_uri
    if (!redirectUri) {
        return res.status(400).json({
            error: true,
            message: "Missing redirect_uri query parameter",
            status: 400
        })
    }

    try {
        return res.json({
            url: getAuthorizeUrl(redirectUri)
        })
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: err.message,
            status: 500
        })
    }
}

function getStations(req: Request, res: Response): Response {
    const stations = database.get(Key.STATIONS)
    return res.json(stations)
}

router.get("/api/spotify/url", getAuthUrl)
router.post("/api/spotify/token", getAccessToken)
router.get("/api/stations", getStations)
router.get("/api/spotify/playlist/:id", async (req, res) => {
    const info = await getTracksInformation(req.params.id)
    return res.json(info)
})

export default router
