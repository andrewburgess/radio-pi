import * as React from "react"
import { createContext, useEffect, useReducer, useRef } from "react"

import { MESSAGE_CLIENT_TYPE, CLIENT_TYPE } from "../constants"
import { refresh, PlayerEvents, ISpotifyTokens } from "../lib/spotify"
import { Player, IWebPlaybackState } from "../types/spotify"

export interface IPlayerState {
    error: string
    playbackState: IWebPlaybackState | null
    player: Player | null
    tokens: ISpotifyTokens | null
}

const DEFAULT_STATE: IPlayerState = {
    error: "",
    playbackState: null,
    player: null,
    tokens: null
}

export interface IPlayerProviderProps {}

const SET_ERROR = "player:error"
const SET_PLAYER = "player:set"
const SET_TOKENS = "player:set-tokens"
const UPDATE_PLAYER_STATE = "player:update-state"

export const setError = (message: string) => ({
    payload: message,
    type: SET_ERROR
})

export const setPlayer = (player: Player) => ({
    payload: player,
    type: SET_PLAYER
})

export const setPlaybackState = (state: IWebPlaybackState) => ({
    payload: state,
    type: UPDATE_PLAYER_STATE
})

export const setTokens = (tokens: ISpotifyTokens) => ({
    payload: tokens,
    type: SET_TOKENS
})

const PlayerContext = createContext<[IPlayerState, React.Dispatch<any>]>([DEFAULT_STATE, () => {}])

function reducer(state: IPlayerState, action: any): IPlayerState {
    switch (action.type) {
        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            }
        case SET_PLAYER:
            return {
                ...state,
                player: action.player
            }
        case UPDATE_PLAYER_STATE:
            return {
                ...state,
                playbackState: action.payload
            }
        default:
            return state
    }
}

const PlayerProvider: React.SFC<IPlayerProviderProps> = (props) => {
    const playerRef = useRef<Player>()
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        if (playerRef.current) {
            return
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: "REVOLT Radio",
                getOAuthToken: async (cb) => {
                    if (state.tokens && state.tokens.refresh_token) {
                        const tokens = await refresh(state.tokens.refresh_token)
                        dispatch(setTokens(tokens))
                        cb(tokens.access_token)
                    } else {
                        window.addEventListener("message", (event: MessageEvent) => {
                            if (event.origin !== window.location.origin) {
                                return
                            }

                            try {
                                const message = JSON.parse(event.data)
                                if (message.type && message.type === "authorize") {
                                    const tokens = message.payload
                                    dispatch(setTokens(tokens))
                                    cb(tokens.access_token)
                                }
                            } catch (e) {
                                // Message was not JSON format most likely
                            }
                        })
                    }
                }
            })

            player.addListener(PlayerEvents.READY, ({ device_id }: any) => {
                console.debug(`Spotify Web Player ready with device id ${device_id}`)
                dispatch(setPlayer(player))
                dispatch(setError(""))
            })

            player.addListener(PlayerEvents.INITIALIZATION_ERROR, ({ message }: any) => {
                console.error(message)
                dispatch(setError(message))
                window.postMessage(
                    JSON.stringify({
                        type: SET_ERROR,
                        payload: message
                    }),
                    window.location.origin
                )
            })

            player.addListener(PlayerEvents.AUTHENTICATION_ERROR, ({ message }: any) => {
                console.log(message)
                dispatch(setError(message))
                window.postMessage(
                    JSON.stringify({
                        type: SET_ERROR,
                        payload: message
                    }),
                    window.location.origin
                )
            })

            player.addListener(PlayerEvents.ACCOUNT_ERROR, ({ message }: any) => {
                console.log(message)
                dispatch(setError(message))
                window.postMessage(
                    JSON.stringify({
                        type: SET_ERROR,
                        payload: message
                    }),
                    window.location.origin
                )
            })

            player.addListener(PlayerEvents.PLAYBACK_ERROR, ({ message }: any) => {
                console.log(message)
                dispatch(setError(message))
                window.postMessage(
                    JSON.stringify({
                        type: SET_ERROR,
                        payload: message
                    }),
                    window.location.origin
                )
            })

            player.addListener(PlayerEvents.PLAYER_STATE_CHANGED, (state: any) => {
                dispatch(setPlaybackState(state))
                window.postMessage(
                    JSON.stringify({
                        type: UPDATE_PLAYER_STATE,
                        payload: state
                    }),
                    window.location.origin
                )
            })

            player.connect()

            playerRef.current = player
        }

        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        document.getElementsByTagName("head")[0].append(script)
    }, [])

    useEffect(() => {
        const ws = new WebSocket(`ws://${window.location.hostname}:3001/ws`)

        const handleMessage = (data: MessageEvent) => {
            console.log(data)
        }

        ws.addEventListener("open", () => {
            ws.addEventListener("message", handleMessage)

            ws.send(
                JSON.stringify({
                    payload: CLIENT_TYPE.PLAYER,
                    type: MESSAGE_CLIENT_TYPE
                })
            )
        })

        return () => ws.close()
    }, [])

    return <PlayerContext.Provider value={[state, dispatch]}>{props.children}</PlayerContext.Provider>
}

export { PlayerContext, PlayerProvider }
