import { FaCog } from "react-icons/fa"
import { lighten } from "polished"
import React, { useContext } from "react"
import styled from "styled-components"

import { Colors } from "../../style"
import { AppContext, OPEN_MODAL } from "../../context/app"

const EmptyAlbumArt = (props) => {
    const [, dispatch] = useContext(AppContext)
    return (
        <div className={props.className}>
            <button className="art" onClick={() => dispatch({ type: OPEN_MODAL, payload: "station-picker" })}>
                <FaCog />
            </button>
        </div>
    )
}

export default styled(EmptyAlbumArt)`
    .art {
        align-items: center;
        background-color: ${lighten(0.01, Colors.background)};
        border: none;
        border-radius: 2vw;
        box-shadow: 0vw 0vw 2vw 0.25vw inset ${lighten(0.05, Colors.background)},
            0.25vw 0.25vw 0.5vw 0.25vw rgba(0, 0, 0, 0.5);
        color: ${Colors.primary};
        display: flex;
        height: 20vw;
        justify-content: center;
        max-height: 500px;
        max-width: 500px;
        transition: box-shadow 0.1s;
        width: 20vw;

        svg {
            height: 10vw;
            opacity: 0.5;
            width: 10vw;
        }

        &:focus {
            outline: none;
        }

        &:active {
            box-shadow: 0vw 0vw 2.5vw 0.5vw inset ${lighten(0.08, Colors.background)},
                0.05vw 0.05vw 0.25vw 0.15vw rgba(0, 0, 0, 0.5);
        }
    }

    @media (orientation: portrait) {
        .art {
            height: 40vh;
            width: 40vh;
        }
    }
`
