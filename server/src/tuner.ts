import { EventEmitter } from "events"
import { find } from "lodash"

import * as database from "./database"
import { RadioBand, IStation, Key } from "./types"

class Tuner extends EventEmitter {
    private band: RadioBand
    private frequency: number

    constructor() {
        super()

        this.band = RadioBand.AM
        this.frequency = 590
    }

    get(): IStation {
        const stations = database.get(Key.STATIONS)

        const station = find(stations, (station) => station.band === this.band && station.frequency === this.frequency)

        if (!station) {
            return {
                band: this.band,
                frequency: this.frequency,
                uri: null
            }
        } else {
            return station
        }
    }

    update(band: RadioBand, frequency: number) {
        this.band = band
        this.frequency = frequency

        this.emit("update", this.get())
    }
}

export default new Tuner()
