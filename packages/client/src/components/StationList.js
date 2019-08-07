import classnames from "classnames"
import { filter, map } from "lodash"
import React, { useContext, useState } from "react"
import posed, { PoseGroup } from "react-pose"
import styled from "styled-components"

import { RADIO_BAND } from "@revolt-radio/common"

import { StationContext } from "../context/stations"

const Station = posed.li({
    enter: {
        x: 0,
        transition: ({ i }) => ({ delay: Math.min((i + 1) * 30, 1000), duration: 350, ease: "easeOut" })
    },
    exit: {
        x: ({ band }) => (band === RADIO_BAND.AM ? "-150%" : "150%"),
        transition: ({ i }) => ({ delay: Math.min(i * 30, 1000), duration: 350, ease: "easeIn" })
    }
})

const StationList = (props) => {
    const [band, setBand] = useState(RADIO_BAND.AM)
    const [{ loading, stations }] = useContext(StationContext)

    if (loading) {
        return (
            <div className={props.className}>
                <div className="loading">loading station list...</div>
            </div>
        )
    }

    const currentStations = filter(stations, (station) => station.band === band)

    return (
        <div className={classnames(props.className)}>
            <div className="bands">
                <button
                    className={classnames({ active: band === RADIO_BAND.AM })}
                    type="button"
                    onClick={() => setBand(RADIO_BAND.AM)}
                >
                    AM
                </button>
                <button
                    className={classnames({ active: band === RADIO_BAND.FM })}
                    type="button"
                    onClick={() => setBand(RADIO_BAND.FM)}
                >
                    FM
                </button>
            </div>

            <div className="stations">
                <ul>
                    <PoseGroup>
                        {currentStations.length ? (
                            map(currentStations, (station, index) => (
                                <Station band={station.band} key={station.frequency} i={index}>
                                    <h3>{station.frequency}</h3>
                                </Station>
                            ))
                        ) : (
                            <Station band={band} className="empty" key={`empty${band}`} i={0}>
                                <h3>no stations are set up</h3>
                            </Station>
                        )}
                    </PoseGroup>
                </ul>
            </div>
        </div>
    )
}

export default styled(StationList)`
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 1rem;

    .empty,
    .loading {
        color: rgba(255, 255, 255, 0.3);
        font-style: italic;
        text-align: center;
    }

    .bands {
        display: flex;
        flex-direction: row;
        margin-bottom: 1rem;
        width: 100%;

        & > button {
            background: transparent;
            border: 1px solid transparent;
            border-radius: 1rem;
            color: rgba(255, 255, 255, 0.3);
            flex: none;
            outline: none;
            padding: 2rem 0;
            transition: all 0.2s;
            width: 50%;

            &.active {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: var(--primary-color);
                font-weight: bold;
            }
        }
    }

    .stations {
        overflow-x: hidden;
        overflow-y: auto;
    }

    li {
        align-items: center;
        display: flex;
        list-style: none;

        h3 {
            flex: 0 0 84px;
            font-size: 3rem;
            margin-top: 1.25rem;
            padding-top: 1.25rem;
        }

        div {
            font-size: 2rem;
            font-weight: 700;
        }

        &.empty {
            h3 {
                flex: none;
                font-size: 2.8rem;
            }
        }
    }
`
