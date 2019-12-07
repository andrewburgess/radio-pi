import * as debug from "debug"
import { EventEmitter } from "events"
import * as execa from "execa"
import * as fs from "fs"
import { clamp, reduce } from "lodash"
import * as path from "path"
import * as os from "os"
import { parse } from "querystring"
import { Gpio } from "onoff"

let mcpadc: any
try {
    mcpadc = require("mcp-spi-adc")
} catch (err) {
    console.error(`error loading mcpadc`, err)
}

import * as database from "./database"
import * as spotify from "./spotify"
import tuner from "./tuner"
import { IStation, RadioBand, Key } from "./types"

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
    private onoffPin: Gpio | null
    private player: execa.ExecaChildProcess | null
    private volume: number
    private volumePin: any

    constructor() {
        super()

        this.bin = getBinaryPath()
        this.deviceId = null
        this.player = null

        this.onOnOffChange = this.onOnOffChange.bind(this)
        this.onPlayerEvent = this.onPlayerEvent.bind(this)
        this.onTunerUpdate = this.onTunerUpdate.bind(this)
        this.readVolume = this.readVolume.bind(this)

        this.volume = 0

        if (Gpio.accessible) {
            this.onoffPin = new Gpio(19, "in", "both")
            this.onoffPin.watch(this.onOnOffChange)
            this.volumePin = mcpadc.open(1, (err: Error) => {
                if (err) {
                    log(`error opening volume pin ${err.message}`)
                    return
                }

                setInterval(this.readVolume, 200)
            })
        } else {
            this.onoffPin = null
        }

        process.on("SIGINT", () => {
            if (this.player) {
                this.player.kill("SIGINT")
            }

            tuner.exit()

            this.onoffPin && this.onoffPin.unexport()

            process.exit(0)
        })
    }

    initialize() {
        this.onoffPin && this.onoffPin.read(this.onOnOffChange)
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

    onOnOffChange(err: Error | null | undefined, value: number) {
        if (err) {
            log(`error reading OnOff pin ${err.message}`)
            return
        }

        log(`detected onoff change ${value}`)

        if (value) {
            const tokens = database.get(Key.TOKENS)
            if (tokens.username && tokens.access_token) {
                this.start(tokens.username, tokens.access_token)
            } else [log(`can't start: ${tokens.username} :: ${tokens.access_token}`)]
        } else {
            this.stop()
        }
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

        await this.playStation(tuner.get())
    }

    async onTunerUpdate() {
        this.emit("state", null)
        await this.playStation(tuner.get())
    }

    async onTrackStarted() {
        const data = await spotify.getCurrentState()
        this.lastState = data

        this.emit("state", data)
    }

    async onTrackStopped() {
        await this.playStation(tuner.get())

        this.emit("state", null)
    }

    async playStation(station: IStation) {
        if (!this.player) {
            return
        }

        const id = this.getDeviceId()

        if (!id) {
            log(`no device id?`)
            return
        }

        if (!station.uri) {
            log(`no station defined for ${station.band === RadioBand.AM ? "AM" : "FM"} ${station.frequency}`)
            await spotify.stopPlayback(id)
            return
        }

        const totalDuration = reduce(station.tracks, (acc, item) => acc + item.track.duration_ms, 0)
        let remaining = Date.now() % totalDuration

        for (let i = 0; i < station.tracks.length; i++) {
            if (station.tracks[i].track.duration_ms > remaining) {
                await spotify.startPlayback(id, station.uri, i, remaining)

                break
            }

            remaining -= station.tracks[i].track.duration_ms
        }

        await spotify.setVolume(id, this.volume)
        await spotify.setRepeat(id)
    }

    readVolume() {
        this.volumePin.read((err: Error, reading: { value: number }) => {
            if (err) {
                log(`error reading volume: ${err.message}`)
                return
            }

            this.setVolume(reading.value)
        })
    }

    async setVolume(volume: number) {
        const newVolume = clamp(1 + Math.log10(volume + 0.1), 0, 1)
        if (this.deviceId && Math.abs(this.volume - newVolume) > 0.01) {
            this.volume = clamp(this.volume + clamp(newVolume - this.volume, -0.01, 0.01), 0, 1)
            log(`Set new volume: ${newVolume}`)
            await spotify.setVolume(this.deviceId, Math.floor(newVolume * 100))
        }
    }
}

export default new Player()
