import * as fs from "fs"
import * as path from "path"
import { promisify } from "util"

const exists = promisify(fs.exists)
const mkdir = promisify(fs.mkdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const dataDirectory = path.join(process.cwd(), "data")
const dataFile = path.join(dataDirectory, "database.json")

export enum Key {
    STATIONS = "STATIONS",
    TOKENS = "TOKENS"
}

export enum RadioBand {
    AM,
    FM
}

export interface IStation {
    band: RadioBand
    frequency: number
    uri: string
}

export interface ISpotifyTokens {
    access_token: string | null
    created_at: number
    expires_in: number
    redirect_uri: string | null
    refresh_token: string | null
    scope: string | null
    token_type: string | null
}

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
        token_type: null
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
