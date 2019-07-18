import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"

import { token } from "./spotify"
import console = require("console")

const server = express()
server.use(cors())
server.use(bodyParser.json())

server.post("/api/spotify/token", async (req, res) => {
    const { code, redirect_uri } = req.body

    const tokens = await token(code, redirect_uri)

    res.json(tokens)
})

server.post("/api/spotify/refresh", (req, res) => {
    res.json({
        message: "refresh"
    })
})

export default () => {
    return server.listen(3001, () => {
        console.log("server listening on 3001")
    })
}
