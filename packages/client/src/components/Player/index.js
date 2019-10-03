import { map } from "lodash"
import React, { useContext } from "react"
import styled from "styled-components"

import { PlayerContext } from "../../context/player"
import AlbumArt from "./AlbumArt"
import EmptyAlbumArt from "./EmptyAlbumArt"

const Player = (props) => {
    const [{ deviceId, playback }] = useContext(PlayerContext)

    if (!deviceId) {
        return <div className={props.className}>not connected</div>
    }

    if (!playback || !playback.track_window.current_track) {
        return (
            <div className={props.className}>
                <div className="station">
                    <span className="freq">N/A</span>
                </div>
                <EmptyAlbumArt />
                <div className="details">
                    <span className="title">no track playing</span>
                    <span className="artists">&nbsp;</span>
                </div>
            </div>
        )
    }

    const currentTrack = playback.track_window.current_track
    const album = currentTrack.album
    const artists = currentTrack.artists

    return (
        <div className={props.className}>
            <div className="station">
                <span className="freq">FM 92.5</span>
                <span className="station-name">{playback.context.metadata.context_description}</span>
            </div>
            <AlbumArt src={album.images[0].url} title={album.name} />
            <div className="details">
                <span className="title">{currentTrack.name}</span>
                <span className="artists">{map(artists, (artist) => artist.name).join(", ")}</span>
            </div>
        </div>
    )
}

export default styled(Player)`
    align-items: center;
    display: flex;
    flex-direction: column;
    flex: none;
    justify-content: center;

    ${AlbumArt}, ${EmptyAlbumArt} {
        padding: 1rem 0;
    }

    .details {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        padding: 1rem;

        .artists,
        .title {
            overflow: hidden;
            text-align: center;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .title {
            font-size: 3rem;
            font-weight: 700;
            padding: 0 0 0.5rem 0;
        }

        .artists {
            font-size: 2rem;
            opacity: 0.2;
        }
    }

    .station {
        align-items: center;
        display: flex;
        flex-direction: column;
        font-size: 1rem;
        padding: 1rem;
    }

    .freq {
        font-family: "Roboto Mono", monospace;
        opacity: 0.5;
    }

    .station-name {
        font-weight: 700;
        padding: 0.5rem 0;
    }

    @media (min-width: 1024px) {
        ${AlbumArt}, ${EmptyAlbumArt} {
            padding: 2rem 0;
        }

        .details {
            .title {
                font-size: 4rem;
            }

            .artists {
                font-size: 2.5rem;
            }
        }

        .station {
            font-size: 1.5rem;
        }
    }
`
