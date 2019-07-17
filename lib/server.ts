import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"

const server = express()
server.use(cors())
server.use(bodyParser.json())

server.post("/api/spotify/authorize", (req, res) => {
    res.json({
        message: "authorize"
    })
})

server.post("/api/spotify/refresh", (req, res) => {
    res.json({
        message: "refresh"
    })
})

export default () => {
    return server.listen(3002, () => {
        console.log("server listening on 3002")
    })
}
