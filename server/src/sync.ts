import { each, random } from "lodash"
import * as debug from "debug"

import * as database from "./database"
import { getTracksInformation } from "./spotify"
import { Key, IStation } from "./types"

const log = debug("radio-pi:sync")

const jobs: {
    [key: string]: NodeJS.Timer
} = {}

function clearSyncJobs() {
    each(jobs, (timer, key) => {
        clearTimeout(timer)

        delete jobs[key]
    })
}

function getNextRun(last: number) {
    return Math.max(0, 12 * 60 * 60 * 1000 - (Date.now() - last) + random(1000 * 60, 1000 * 60 * 60 * 4))
}

async function syncStation(station: IStation) {
    if (!station.uri) {
        return
    }

    log(`syncing ${station.uri}`)
    const info = await getTracksInformation(station.uri)
    station.tracks = info
    station.lastUpdate = Date.now()

    database.set(Key.STATIONS, database.get(Key.STATIONS))

    setJob(station)
}

function setJob(station: IStation) {
    if (!station.uri) {
        log(`station didn't have URI ${station.band} : ${station.frequency}`)
        return
    }

    clearTimeout(jobs[station.uri])
    delete jobs[station.uri]

    const nextRun = getNextRun(station.lastUpdate)
    log(`setting next sync for ${station.uri} for ${nextRun / 1000.0} seconds`)
    jobs[station.uri] = setTimeout(() => syncStation(station), nextRun)
}

export function startSyncJobs() {
    log("starting sync jobs")
    const stations = database.get(Key.STATIONS)

    clearSyncJobs()

    each(stations, (station) => setJob(station))
}
