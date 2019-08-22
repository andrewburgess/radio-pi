import { map } from "lodash"
import { lighten } from "polished"
import React, { useContext } from "react"
import styled from "styled-components"

import { PlayerContext } from "../context/player"
import { Colors } from "../style"
import AlbumArt from "./AlbumArt"

const Player = (props) => {
    const [{ deviceId, playback }] = useContext(PlayerContext)

    if (!deviceId) {
        return <div className={props.className}>not connected</div>
    }

    if (!playback || !playback.track_window.current_track) {
        return <div className={props.className}>no track playing</div>
    }

    const currentTrack = playback.track_window.current_track
    const album = currentTrack.album
    const artists = currentTrack.artists

    return (
        <div className={props.className}>
            <AlbumArt src={album.images[0].url} title={album.name} />
            <div className="details">
                <span className="title">{currentTrack.name}</span>
                <span className="artists">{map(artists, (artist) => artist.name).join(", ")}</span>
            </div>
            <div className="station">92.5</div>
        </div>
    )
}

export default styled(Player)`
    background: ${lighten(0.05, Colors.background)};
    display: flex;
    flex: none;
    height: 15vh;
    max-height: 250px;
    min-height: 125px;

    ${AlbumArt} {
        flex: none;
        width: 15vh;
    }

    .details,
    .station {
        display: flex;
        height: 100%;
    }

    .details {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        height: 100%;
        justify-content: center;
        overflow: hidden;
        padding: 1rem;

        .artists,
        .title {
            font-size: 4rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .title {
            font-weight: 700;
        }

        .artists {
            opacity: 0.2;
        }
    }

    .station {
        align-items: center;
        color: ${Colors.primary};
        font-size: 6rem;
        opacity: 0.6;
        padding: 2rem;
    }
`
