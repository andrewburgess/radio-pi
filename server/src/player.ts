import * as debug from "debug"
import { EventEmitter } from "events"
import * as execa from "execa"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { parse } from "querystring"

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
    private player: execa.ExecaChildProcess | null

    constructor() {
        super()

        this.bin = getBinaryPath()
        this.deviceId = null
        this.player = null
        this.onChildEvent = this.onChildEvent.bind(this)

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

        this.player.all!.on("data", this.onChildEvent)
    }

    stop() {
        if (this.player) {
            this.player.cancel()
            this.deviceId = null
            this.player = null

            this.emit("exit")
        }
    }

    getDeviceId() {
        return this.deviceId
    }

    onChildEvent(data: string) {
        const event = data.toString().trim()

        const type = event.split(" ")[0].split(":")[1]
        const params = parse(event.split(" ")[1])

        log(`${type} - %o`, params)

        switch (type) {
            case "ready":
                this.onReady(params)
                break
        }

        this.emit(type, params)
    }

    onReady(params: any) {
        this.deviceId = params.device_id
    }
}

export default new Player()
