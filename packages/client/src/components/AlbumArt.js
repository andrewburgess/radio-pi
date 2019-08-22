import React from "react"
import styled from "styled-components"

const AlbumArt = (props) => {
    return (
        <div className={props.className}>
            <img alt={props.alt || props.title} src={props.src} title={props.title} />
        </div>
    )
}

export default styled(AlbumArt)`
    img {
        width: 100%;
    }
`
