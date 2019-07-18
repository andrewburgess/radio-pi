import { PlayerEvents } from "../../lib/spotify"

interface ISpotifyPlayerConstructor {
    /**
     * This will be called every time you run Spotify.Player#connect or when a user's access token has expired (maximum of 60 minutes).
     *
     * You will be provided with a callback parameter. You will need to execute this with a valid access_token string for a Spotify Premium user.
     */
    getOAuthToken: (cb: (arg0: string) => void) => void

    /** The name of the Spotify Connect player. It will be visible in other Spotify apps. */
    name: string

    /** The default volume of the player. Represented as a decimal between 0 and 1. Default value is 1. */
    volume?: number
}

interface IWebPlaybackTrack {
    album: {
        images: [{ url: string }]
        name: string
        uri: string
    }
    artists: [
        {
            name: string
            uri: string
        }
    ]
    id: string
    is_playable: boolean
    media_type: string
    name: string
    type: TrackType
    uri: string
}

interface IWebPlaybackState {
    context: {
        metadata: any | null
        uri: string | null
    }
    disallows: {
        pausing: boolean
        peeking_next: boolean
        peeking_prev: boolean
        resuming: boolean
        seeking: boolean
        skipping_next: boolean
        skipping_prev: boolean
    }
    paused: boolean
    position: number
    repeat_mode: RepeatMode
    shuffle: boolean
    track_window: {
        current_track: IWebPlaybackTrack
        previous_tracks: [IWebPlaybackTrack]
        next_tracks: [IWebPlaybackTrack]
    }
}

export class Player {
    constructor(params: ISpotifyPlayerConstructor)

    /**
     * Create a new event listener in the Web Playback SDK. Alias for Spotify.Player#on.
     *
     * @param eventName A valid event name. See Web Playback SDK Events.
     * @param callback A callback function to be fired when the event has been executed.
     *
     * @returns Returns a Boolean. Returns true if the event listener for the event_name is unique. See #removeListener for removing existing listeners.
     */
    addListener(eventName: string, callback: Function): boolean

    /**
     * Connect our Web Playback SDK instance to Spotify with the credentials provided during initialization.
     *
     * @returns Returns a Promise containing a Boolean (either true or false) with the success of the connection.
     */
    connect(): Promise<boolean>

    /**
     * Closes the current session our Web Playback SDK has with Spotify.
     *
     * @returns void
     */
    disconnect(): void

    /**
     * Collect metadata on local playback.
     *
     * @returns Returns a Promise. It will return either a WebPlaybackState object or null depending on if the user is successfully connected.
     */
    getCurrentState(): Promise<IWebPlaybackState | null>

    /**
     * Get the local volume currently set in the Web Playback SDK (as a Float between 0 and 1)
     */
    getVolume(): Promise<number>

    /**
     * Skip to the next track in local playback.
     */
    nextTrack(): Promise<void>

    /**
     * Pause the local playback.
     */
    pause(): Promise<void>

    /**
     * Switch to the previous track in local playback.
     */
    previousTrack(): Promise<void>

    /**
     * Remove an event listener in the Web Playback SDK.
     *
     * @param eventName A valid event name. See Web Playback SDK Events.
     * @param callback The callback function you would like to remove from the listener. If not provided, it will remove all callbacks under the event_name.
     *
     * @returns Returns a Boolean. Returns true if the event name is valid with registered callbacks from #addListener.
     */
    removeListener(eventName: PlayerEvents, callback?: Function): boolean

    /**
     * Resume the local playback.
     */
    resume(): Promise<void>

    /**
     * Seek to a position in the current track in local playback.
     *
     * @param position_ms The position in milliseconds to seek to.
     */
    seek(position_ms: number): Promise<void>

    /**
     * Rename the Spotify Player device. This is visible across all Spotify Connect devices.
     *
     * @param name The new desired player name.
     */
    setName(name: string): Promise<void>

    /**
     * Set the local volume for the Web Playback SDK.
     *
     * @param volume The new desired volume for local playback. Between 0 and 1.
     */
    setVolume(volume: number): Promise<void>

    /**
     * Resume/pause the local playback.
     */
    togglePlay(): Promise<void>
}

declare global {
    type Spotify = {
        Player: typeof Player
    }

    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void
        Spotify: Spotify
    }
}
