import { EventEmitter } from "events"
import { clamp, debounce, find, isNaN, mean, omit, range, reverse, round } from "lodash"
import { Gpio } from "onoff"
import * as SerialPort from "serialport"

import * as database from "./database"
import { RadioBand, IStation, Key } from "./types"

const FREQ_START = 992
const FREQ_END = 648

const AM_STATIONS = reverse(range(530, 1700, 10))
const FM_STATIONS = reverse(range(87.9, 108.1, 0.2))

const MAX_READINGS = 120

class Tuner extends EventEmitter {
    private amPin: Gpio | null
    private band: RadioBand
    private frequency: number
    private fmPin: Gpio | null
    private port: SerialPort | null
    private readings: number[]

    constructor() {
        super()

        this.onAmFmChange = debounce(this.onAmFmChange.bind(this), 100)
        this.onTunerUpdate = this.onTunerUpdate.bind(this)
        this.band = RadioBand.FM
        this.frequency = 92.5
        this.readings = []

        if (Gpio.accessible) {
            this.amPin = new Gpio(26, "in", "both")
            this.fmPin = new Gpio(20, "in", "both")

            this.amPin.watch(this.onAmFmChange)
            this.fmPin.watch(this.onAmFmChange)

            this.onAmFmChange(null)

            this.port = new SerialPort("/dev/ttyACM0", {
                baudRate: 115200
            })

            this.port.on("data", this.onTunerUpdate)
        } else {
            this.amPin = null
            this.fmPin = null
            this.port = null
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

    onTunerUpdate(data: Buffer) {
        const rawValue = parseInt(data.toString("utf8").trim())

        if (isNaN(rawValue)) {
            return
        }

        this.readings.push(rawValue)

        if (this.readings.length < MAX_READINGS) {
            return
        }

        this.readings.shift()
        const value = mean(this.readings)

        const freqs = this.band === RadioBand.AM ? AM_STATIONS : FM_STATIONS
        const percent = clamp((value - FREQ_END) / (FREQ_START - FREQ_END), 0, 1)
        const bin = round(freqs.length - 1 * percent)

        // console.log(`guessing freq: ${freqs[bin]}`)
        freqs[bin] = percent
    }

    update(band: RadioBand, frequency: number) {
        this.band = band
        this.frequency = frequency

        this.emit("update", omit(this.get(), "tracks"))
    }
}

export default new Tuner()
