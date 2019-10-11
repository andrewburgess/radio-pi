import * as debug from "debug"
import { EventEmitter } from "events"
import * as execa from "execa"
import fetch from "node-fetch"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { parse } from "querystring"

import * as spotify from "./spotify"

const log = debug("radio-pi:player")

function getBinaryPath() {
    const platform = os.platform()
    let binPath

    switch (platform) {
        case "linux":
            binPath = path.join(__dirname, "..", "bin", "linux", `librespot_${os.arch()}`)
            break
        case "win32":
            binPath = path.join(__dirname, "..", "bin", "win32", "librespot.exe")
            break
        default:
            throw new Error(`unknown platform ${platform}`)
    }

    if (!fs.existsSync(binPath)) {
        throw new Error(`librespot binary does not exist at ${binPath}`)
    }

    return binPath
}

class Player extends EventEmitter {
    private bin: string
    private deviceId: string | null
    private lastState: any
    private player: execa.ExecaChildProcess | null

    constructor() {
        super()

        this.bin = getBinaryPath()
        this.deviceId = null
        this.player = null
        this.onPlayerEvent = this.onPlayerEvent.bind(this)

        process.on("SIGINT", () => {
            if (this.player) {
                this.player.kill("SIGINT")
            }

            process.exit(0)
        })
    }

    async api(method: string, endpoint: string, body: any) {
        const response = await fetch(`https://api.spotify.com${endpoint}`, {
            method,
            body: body ? JSON.stringify(body) : ""
        })

        try {
            return response.json()
        } catch (err) {
            log(`error ${err}`)
        }
    }

    start(username: string, token: string) {
        if (this.player) {
            return
        }

        log(`starting player with ${username}:${token}`)
        this.player = execa(this.bin, ["--name=Radio PI", `--username=${username}`, `--access_token=${token}`])

        this.player.all!.on("data", this.onPlayerEvent)
    }

    stop() {
        if (this.player) {
            this.emit("exit", this.deviceId)
            this.player.cancel()
            this.deviceId = null
            this.player = null
        }
    }

    getDeviceId() {
        return this.deviceId
    }

    getLastState() {
        return this.lastState
    }

    onPlayerEvent(data: string) {
        const event = data.toString().trim()

        const type = event.split(" ")[0].split(":")[1]
        const params = parse(event.split(" ")[1])

        log(`${type} - %o`, params)

        switch (type) {
            case "ready":
                this.onReady(params)
                break
            case "started":
            case "changed":
                this.onTrackStarted()
                break
            case "stopped":
                this.onTrackStopped()
                break
        }

        this.emit(type, params)
    }

    async onReady(params: any) {
        this.deviceId = params.device_id

        await spotify.setPlayer(this.deviceId!)
        await spotify.startPlayback()
    }

    async onTrackStarted() {
        const data = await spotify.getCurrentState()

        this.lastState = data

        this.emit("state", data)
    }

    async onTrackStopped() {
        this.emit("state", null)
    }
}

export default new Player()
