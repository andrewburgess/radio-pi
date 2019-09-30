import { lighten } from "polished"
import React from "react"
import { FaSpotify } from "react-icons/fa"
import styled from "styled-components"

import { MESSAGE_TOKEN } from "@revolt-radio/common"

import { authorize } from "../lib/spotify"
import { SocketContext } from "../context/socket"
import { Colors } from "../style"

const onAuthorizeClick = async (event, ws) => {
    event.preventDefault()

    const tokens = await authorize()

    ws.send(
        JSON.stringify({
            payload: tokens,
            type: MESSAGE_TOKEN
        })
    )
}

const Authorize = (props) => {
    const [{ ws }] = React.useContext(SocketContext)

    return (
        <div className={props.className}>
            <button type="button" onClick={(event) => onAuthorizeClick(event, ws)}>
                <FaSpotify /> Login to Spotify
            </button>
        </div>
    )
}

export default styled(Authorize)`
    button {
        align-items: center;
        background: ${Colors.spotify};
        border: none;
        box-shadow: inset 0 0 1.5rem 0.5rem ${lighten(0.1, Colors.spotify)};
        color: #fff;
        display: flex;
        font-size: 6.25vw;
        justify-content: center;
        min-height: 10rem;
        padding: 2rem 2rem;
        text-transform: uppercase;
        width: 93.75vw;

        & > svg {
            margin-right: 0.5em;
        }
    }

    @media (min-width: 768px) {
        button {
            font-size: 4.8rem;
            width: 72rem;
        }
    }
`
