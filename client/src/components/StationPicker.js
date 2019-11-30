import classnames from "classnames"
import { darken, lighten } from "polished"
import { debounce, last, map } from "lodash"
import React, { useContext, useState, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import styled from "styled-components"
import useSWR, { useSWRPages } from "swr"

import { AppContext, CLOSE_MODAL } from "../context/app"
import { Colors } from "../style"

export const STATION_PICKER_MODAL = "station-picker"

const getFetcher = (accessToken) => (url) =>
    fetch(url, {
        headers: {
            authorization: `Bearer ${accessToken}`
        }
    })
        .then((response) => response.json())
        .then((data) => data.playlists || data)

const LoadedPlaylists = (props) => {
    return (
        <>
            <div className="playlists">{props.playlists}</div>
            <button className={classnames("load-more", { hide: props.atEnd })} onClick={props.loadMore}>
                Load More
            </button>
        </>
    )
}

const Modal = (props) => {
    const [state, dispatch] = useContext(AppContext)
    const [playlistUrl, setPlaylistUrl] = useState("https://api.spotify.com/v1/me/playlists")

    const fetcher = getFetcher(state.tokens.access_token)
    const { pages, isEmpty, isReachingEnd, loadMore } = useSWRPages(
        `${playlistUrl}`,
        ({ offset, withSWR }) => {
            const { data } = withSWR(
                // eslint-disable-next-line react-hooks/rules-of-hooks
                useSWR(`${playlistUrl}${playlistUrl.indexOf("?") >= 0 ? "&" : "?"}offset=${offset || 0}`, fetcher)
            )

            if (!data) {
                return <div>Loading...</div>
            }

            return map(data.items, (playlist) => (
                <div key={playlist.id}>
                    <div className="cover-art">
                        <img alt={playlist.name} src={playlist.images[0].url} />
                    </div>
                    <div className="playlist-name">{playlist.name}</div>
                </div>
            ))
        },
        ({ data }) => {
            if (data) {
                return data.limit + data.offset
            }

            return null
        },
        [playlistUrl]
    )

    const onChange = useCallback(
        debounce((target) => {
            const val = target.value

            if (val) {
                setPlaylistUrl(`https://api.spotify.com/v1/search?q=${encodeURIComponent(val)}&type=playlist`)
            } else {
                setPlaylistUrl(`https://api.spotify.com/v1/me/playlists`)
            }
        }, 250),
        []
    )

    useEffect(() => {
        const onKeyUp = (ev) => {
            if (ev.code === "Escape") {
                dispatch({
                    type: CLOSE_MODAL,
                    payload: STATION_PICKER_MODAL
                })
            }
        }

        window.addEventListener("keyup", onKeyUp)

        return () => window.removeEventListener("keyup", onKeyUp)
    }, [dispatch])

    return (
        <div className={props.className}>
            <div className="container">
                <input type="text" placeholder="Search for a playlist" onChange={(ev) => onChange(ev.target)} />
                <LoadedPlaylists atEnd={isEmpty || isReachingEnd} loadMore={loadMore} playlists={pages} />
            </div>
        </div>
    )
}

const StationPicker = (props) => {
    const [state, dispatch] = useContext(AppContext)

    if (!state.modal[STATION_PICKER_MODAL]) {
        return null
    }

    return createPortal(<Modal className={props.className} />, document.getElementsByTagName("body")[0])
}

export default styled(StationPicker)`
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 10;

    &:before {
        background-color: rgba(0, 0, 0, 0.7);
        bottom: 0;
        content: "";
        display: block;
        left: 0;
        position: fixed;
        right: 0;
        top: 0;
    }

    .container {
        background-color: ${lighten(0.2, Colors.background)};
        border: ${darken(0.1, Colors.background)};
        height: 50vh;
        left: 50%;
        min-height: 300px;
        min-width: 300px;
        overflow: auto;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 40vw;

        & > input {
            display: block;
            font-family: "Roboto Mono", monospace;
            font-size: 2.2rem;
            padding: 2rem;
            text-align: center;
            width: 100%;
        }

        .playlists > div {
            align-items: center;
            display: flex;
            font-size: 3rem;
            font-weight: bold;

            &:nth-child(2n + 1) {
                background-color: ${lighten(0.3, Colors.background)};
            }

            .cover-art {
                flex: none;
                margin: 0 1rem 0 0;
                height: 8vw;
                width: 8vw;

                img {
                    height: 100%;
                    object-fit: cover;
                    width: 100%;
                }
            }

            .playlist-name {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .load-more {
            background: #000;
            border: none;
            color: #fff;
            font-size: 4rem;
            margin-top: 4rem;
            padding: 2rem;
            text-transform: uppercase;
            width: 100%;
        }
    }
`
