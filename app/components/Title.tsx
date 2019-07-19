import * as React from "react"
import { useContext } from "react"

import { PlayerContext } from "../context/player"

const Title: React.SFC = (props) => {
    const [state] = useContext(PlayerContext)

    if (!state.playbackState) {
        return <div />
    }

    return (
        <div>
            <h2>{state.playbackState.track_window.current_track.name}</h2>
        </div>
    )
}

export default Title
