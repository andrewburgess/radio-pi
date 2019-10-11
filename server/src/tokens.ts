import * as debug from "debug"
import { EventEmitter } from "events"

import * as database from "./database"
import { Key, ISpotifyTokens } from "./types"
import { refresh } from "./spotify"

const log = debug("radio-pi:tokens")

class Tokens extends EventEmitter {
    private refreshTimeout: NodeJS.Timeout | null
    private tokens: ISpotifyTokens | null

    constructor() {
        super()

        this.tokens = null
        this.refreshTimeout = null
    }

    async initialize() {
        this.tokens = database.get(Key.TOKENS)

        if (this.tokensAreExpired()) {
            await this.refreshTokens()
        } else {
            this.scheduleRefresh()
        }
    }

    getTokens() {
        if (!this.tokens) {
            throw new Error("don't have no tokens")
        }

        if (this.tokensAreExpired()) {
            return null
        }

        return this.tokens
    }

    async refreshTokens() {
        if (!this.tokens) {
            throw new Error("don't have no tokens")
        }

        log("refreshing tokens")

        if (!this.tokens.refresh_token) {
            this.emit("expired")
            return
        }

        const refreshed = await refresh(this.tokens.refresh_token)

        if (refreshed.error) {
            console.error(`failed to refresh tokens: ${refreshed.error_message}`)
            this.emit("expired")
            return
        }

        let newTokens = {
            ...this.tokens,
            ...refreshed,
            created_at: Date.now()
        }

        database.set(Key.TOKENS, newTokens)
        this.tokens = newTokens

        this.emit("tokens", this.tokens)

        this.scheduleRefresh()
    }

    scheduleRefresh() {
        if (!this.tokens) {
            throw new Error("ain't got no tokens")
        }

        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout)
        }

        const refreshIn = this.tokens.created_at + this.tokens.expires_in * 1000 - 5 * 60 * 1000 - Date.now()
        log(`refreshing in ${Math.round(refreshIn / 1000)} seconds`)
        this.refreshTimeout = setTimeout(() => this.refreshTokens(), refreshIn)
    }

    setTokens(tokens: ISpotifyTokens) {
        this.tokens = {
            ...tokens,
            created_at: Date.now()
        }
        database.set(Key.TOKENS, this.tokens)

        this.emit("tokens", this.tokens)
    }

    tokensAreExpired() {
        if (!this.tokens) {
            throw new Error("don't have no tokens")
        }

        const now = Date.now()
        const expired = now - (this.tokens.created_at + this.tokens.expires_in * 1000) >= 5 * 60 * 1000 * -1
        expired ? log("tokens are expired") : log("tokens are not expired")
        return expired
    }
}

export default new Tokens()
