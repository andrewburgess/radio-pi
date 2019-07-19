import * as React from "react"
import { createContext, useEffect, useReducer } from "react"

import { authorize, PlayerEvents, ISpotifyTokens } from "../lib/spotify"
import { Player, IWebPlaybackState } from "../types/spotify"

export interface IPlayerState {
    playbackState: IWebPlaybackState | null
    player: Player | null
    tokens: ISpotifyTokens | null
}

const DEFAULT_STATE: IPlayerState = {
    playbackState: null,
    player: null,
    tokens: null
}

export interface IPlayerProviderProps {}

const SET_PLAYER = "player:set"
const UPDATE_PLAYER_STATE = "player:update-state"

export const setPlayer = (player: Player) => ({
    payload: player,
    type: SET_PLAYER
})

export const setPlaybackState = (state: IWebPlaybackState) => ({
    payload: state,
    type: UPDATE_PLAYER_STATE
})

const PlayerContext = createContext<[IPlayerState, React.Dispatch<any>]>([DEFAULT_STATE, () => {}])

function reducer(state: IPlayerState, action: any): IPlayerState {
    switch (action.type) {
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
    const [state, dispatch] = useReducer(reducer, DEFAULT_STATE)

    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: "REVOLT Radio",
                getOAuthToken: async (cb) => {
                    const tokens = await authorize()
                    cb(tokens.access_token)
                }
            })

            player.addListener(PlayerEvents.READY, ({ device_id }: any) => {
                console.debug(`Spotify Web Player ready with device id ${device_id}`)
                dispatch(setPlayer(player))
            })

            player.addListener(PlayerEvents.INITIALIZATION_ERROR, ({ message }: any) => {
                console.error(message)
            })

            player.addListener(PlayerEvents.AUTHENTICATION_ERROR, ({ message }: any) => {
                console.log(message)
            })

            player.addListener(PlayerEvents.ACCOUNT_ERROR, ({ message }: any) => {
                console.log(message)
            })

            player.addListener(PlayerEvents.PLAYBACK_ERROR, ({ message }: any) => {
                console.log(message)
            })

            player.addListener(PlayerEvents.PLAYER_STATE_CHANGED, (state: any) => {
                dispatch(setPlaybackState(state))
            })

            player.connect()
        }

        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        document.getElementsByTagName("head")[0].append(script)
    }, [])

    return <PlayerContext.Provider value={[state, dispatch]}>{props.children}</PlayerContext.Provider>
}

export { PlayerContext, PlayerProvider }
