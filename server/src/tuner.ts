import { EventEmitter } from "events"
import { debounce, find, omit } from "lodash"
import { Gpio } from "onoff"

import * as database from "./database"
import { RadioBand, IStation, Key } from "./types"

class Tuner extends EventEmitter {
    private amPin: Gpio | null
    private band: RadioBand
    private frequency: number
    private fmPin: Gpio | null

    constructor() {
        super()

        this.onAmFmChange = debounce(this.onAmFmChange.bind(this), 100)
        this.band = RadioBand.FM
        this.frequency = 92.5

        if (Gpio.accessible) {
            this.amPin = new Gpio(26, "in", "both")
            this.fmPin = new Gpio(20, "in", "both")

            this.amPin.watch(this.onAmFmChange)
            this.fmPin.watch(this.onAmFmChange)

            this.onAmFmChange(null)
        } else {
            this.amPin = null
            this.fmPin = null
        }
    }

    exit(): void {
        this.amPin && this.amPin.unexport()
        this.fmPin && this.fmPin.unexport()
    }

    get(): IStation {
        const stations = database.get(Key.STATIONS)

        const station = find(stations, (station) => station.band === this.band && station.frequency === this.frequency)

        if (!station) {
            return {
                band: this.band,
                frequency: this.frequency,
                lastUpdate: 0,
                tracks: [],
                uri: null
            }
        } else {
            return station
        }
    }

    onAmFmChange(err: Error | null | undefined) {
        if (!this.amPin) {
            return
        }

        if (!this.fmPin) {
            return
        }

        if (err) {
            console.error(err)
            return
        }

        const am = this.amPin.readSync()
        const fm = this.fmPin.readSync()

        console.log(`AM: ${am}, FM: ${fm}`)
    }

    update(band: RadioBand, frequency: number) {
        this.band = band
        this.frequency = frequency

        this.emit("update", omit(this.get(), "tracks"))
    }
}

export default new Tuner()
