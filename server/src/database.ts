import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

import { IStation, ISpotifyTokens, Key } from "./types"

const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const dataDirectory = path.join(process.cwd(), "data")
const dataFile = path.join(dataDirectory, "database.json")

export interface IDatabase {
    [Key.STATIONS]: IStation[]
    [Key.TOKENS]: ISpotifyTokens
}

let database: IDatabase = {
    [Key.STATIONS]: [],
    [Key.TOKENS]: {
        access_token: null,
        created_at: -1,
        expires_in: -1,
        redirect_uri: null,
        refresh_token: null,
        scope: null,
        token_type: null,
        username: null
    }
}

type DataType<T> = T extends Key.STATIONS ? IStation[] : T extends Key.TOKENS ? ISpotifyTokens : never

export function get<T extends Key>(key: T): DataType<T> {
    return database[key] as DataType<T>
}

export async function load() {
    const dirExists = await exists(dataDirectory)
    if (!dirExists) {
        await mkdir(dataDirectory)
        await writeFile(dataFile, JSON.stringify(database, null, 2))
    }

    const fileExists = await exists(dataFile)
    if (!fileExists) {
        await writeFile(dataFile, JSON.stringify(database, null, 2))
    }

    const data = await readFile(dataFile, "utf-8")
    database = JSON.parse(data) as IDatabase
}

export function set<T extends Key>(key: T, value: DataType<T>) {
    database[key] = value as any

    fs.writeFileSync(dataFile, JSON.stringify(database, null, 2))
}
