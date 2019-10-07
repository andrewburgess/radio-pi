import React from "react"
import styled from "styled-components"

const AlbumArt = (props) => {
    return (
        <div className={props.className}>
            <img alt={props.alt || props.title} className="art" src={props.src} title={props.title} />
        </div>
    )
}

export default styled(AlbumArt)`
    .art {
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
