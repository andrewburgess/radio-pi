import { lighten } from "polished"
import React, { useContext } from "react"
import styled from "styled-components"

import { PlayerContext } from "../context/player"
import { Colors } from "../style"

const Player = (props) => {
    const [{ deviceId, playback }] = useContext(PlayerContext)

    if (!deviceId) {
        return <div className={props.className}>not connected</div>
    }

    if (!playback || !playback.track_window.current_track) {
        return <div className={props.className}>no track playing</div>
    }

    const currentTrack = playback.track_window.current_track

    return (
        <div className={props.className}>
            <img src={currentTrack.album.images[0].url} />
        </div>
    )
}

export default styled(Player)`
    background: ${lighten(0.1, Colors.background)};
    flex: none;
    height: 15vh;
    max-height: 250px;
    min-height: 125px;
`
