import * as React from "react"
import { createContext, useEffect /*useReducer*/ } from "react"

import { authorize, PlayerEvents } from "../lib/spotify"

const PlayerContext = createContext([{}, () => {}])

/*const DEFAULT_STATE = {
    authentication: null,
    player: null
}*/

export interface IPlayerProviderProps {}

const PlayerProvider: React.SFC<IPlayerProviderProps> = (props) => {
    //const [player, setPlayer] = useState(null)

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
                console.log(`Spotify Web Player ready with device id ${device_id}`)
                //setPlayer(player)
            })

            player.addListener(PlayerEvents.READY, ({ device_id }: any) => {
                console.debug(`Spotify Web Player ready with device id ${device_id}`)
                //setPlayer(player)
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
                console.log(state)
            })

            player.connect()
        }

        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        document.getElementsByTagName("head")[0].append(script)
    }, [])

    return <PlayerContext.Provider value={[{}, () => {}]}>{props.children}</PlayerContext.Provider>
}

export { PlayerContext, PlayerProvider }
