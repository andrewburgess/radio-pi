import { lighten } from "polished"
import React, { useContext } from "react"
import styled from "styled-components"

import { PlayerContext } from "../context/player"
import { Colors } from "../style"

const Player = (props) => {
    const [{ deviceId }] = useContext(PlayerContext)
    return <div className={props.className}>{deviceId ? deviceId : "not connected"}</div>
}

export default styled(Player)`
    background: ${lighten(0.1, Colors.background)};
    flex: none;
    height: 15vh;
    max-height: 250px;
    min-height: 125px;
`
