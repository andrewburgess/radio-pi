import * as bodyParser from "body-parser"
import * as cors from "cors"
import * as express from "express"

const server = express()
server.use(cors())
server.use(bodyParser.json())

server.post("/api/spotify/token", (req, res) => {
    res.json({
        message: "token"
    })
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
