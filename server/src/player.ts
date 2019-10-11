import * as debug from "debug"
import { EventEmitter } from "events"
import * as execa from "execa"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { parse } from "querystring"

import * as spotify from "./spotify"
import tuner from "./tuner"
import { IStation, RadioBand } from "./types"

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
        this.onTunerUpdate = this.onTunerUpdate.bind(this)

        process.on("SIGINT", () => {
            if (this.player) {
                this.player.kill("SIGINT")
            }

            process.exit(0)
        })
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
        tuner.off("update", this.onTunerUpdate)

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
        log("player ready")
        this.deviceId = params.device_id

        tuner.on("update", this.onTunerUpdate)

        await spotify.setPlayer(this.deviceId!)
        await spotify.startPlayback()
        //await this.playStation(tuner.get())
    }

    async onTunerUpdate(station: IStation) {}

    async onTrackStarted() {
        const data = await spotify.getCurrentState()

        this.lastState = data

        this.emit("state", data)
    }

    async onTrackStopped() {
        this.emit("state", null)
    }

    async playStation(station: IStation) {
        if (!station.uri) {
            log(`no station defined for ${station.band === RadioBand.AM ? "AM" : "FM"} ${station.frequency}`)
            return
        }

        //const total = await spotify.getTrackCount(station.uri)
    }
}

export default new Player()
