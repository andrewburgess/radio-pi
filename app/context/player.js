import qs from "querystring"
import React, { createContext, useEffect, useState } from "react"

const PlayerContext = createContext([null])

const PlayerProvider = (props) => {
    const [player, setPlayer] = useState(null)

    useEffect(() => {
        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: "REVOLT Radio",
                getOAuthToken: (cb) => {
                    window.addEventListener("message", (event) => {
                        if (event.origin !== window.location.origin) {
                            return
                        }

                        // TODO: Needs to be moved to a server side process
                        /*const message = qs.parse(event.data)

                        fetch("https://accounts.spotify.com/api/token", {
                            body: JSON.stringify({
                                grant_type: "authorization_code",
                                code: message.code,
                                redirect_uri: `${window.location.origin}/auth.html`
                            }),
                            headers: {
                                authorization: `Basic ${btoa(
                                    `${process.env.REACT_APP_SPOTIFY_CLIENT_ID}:${
                                        process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
                                    }`
                                )}`
                            },
                            method: "POST"
                        })
                            .then((response) => response.json())
                            .then((data) => {
                                cb(data.access_token)
                            })
                            */
                    })

                    window.open(
                        `https://accounts.spotify.com/authorize?response_type=code&client_id=${
                            process.env.REACT_APP_SPOTIFY_CLIENT_ID
                        }&scope=${encodeURIComponent(
                            `streaming user-modify-playback-state user-read-birthdate user-read-email user-read-private`
                        )}&redirect_uri=${window.location.origin}/auth.html`
                    )
                }
            })

            player.addListener("ready", ({ device_id }) => {
                console.debug(`Spotify Web Player ready with device id ${device_id}`)
                setPlayer(player)
            })

            player.connect()
        }

        const script = document.createElement("script")
        script.src = "https://sdk.scdn.co/spotify-player.js"
        document.getElementsByTagName("head")[0].append(script)
    }, [])

    return <PlayerContext.Provider value={player}>{props.children}</PlayerContext.Provider>
}

export { PlayerContext, PlayerProvider }
