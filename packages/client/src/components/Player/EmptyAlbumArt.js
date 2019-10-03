import { lighten } from "polished"
import React from "react"
import styled from "styled-components"

import { Colors } from "../../style"

const EmptyAlbumArt = (props) => {
    return (
        <div className={props.className}>
            <div className="art"></div>
        </div>
    )
}

export default styled(EmptyAlbumArt)`
    .art {
        background-color: ${lighten(0.3, Colors.background)};
        height: 20vw;
        max-height: 500px;
        max-width: 500px;
        width: 20vw;
    }

    @media (orientation: portrait) {
        .art {
            height: 40vh;
            width: 40vh;
        }
    }
`
