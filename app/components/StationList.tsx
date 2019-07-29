import * as classnames from "classnames"
import { filter, map } from "lodash"
import * as React from "react"
import { useContext, useState } from "react"
import styled from "styled-components"

import { RADIO_BAND } from "../constants"
import { StationContext } from "../context/stations"

export interface IStationListProps {
    className?: string
}

const StationList: React.SFC<IStationListProps> = (props) => {
    const [band, setBand] = useState(RADIO_BAND.FM)
    const [{ loading, stations }] = useContext(StationContext)

    if (loading) {
        return (
            <div className={props.className}>
                <div className="loading">loading station list...</div>
            </div>
        )
    }

    const amStations = filter(stations, (station) => station.band === RADIO_BAND.AM)
    const fmStations = filter(stations, (station) => station.band === RADIO_BAND.FM)

    return (
        <div className={classnames(props.className, { am: band === RADIO_BAND.AM, fm: band === RADIO_BAND.FM })}>
            <h2>Stations</h2>
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
                {amStations.length ? (
                    <ul className="am">
                        {map(amStations, (station) => (
                            <li key={station.frequency}>
                                <h3>{station.frequency}</h3>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="am empty">no stations are set up</div>
                )}
                {fmStations.length ? (
                    <ul className="fm">
                        {map(fmStations, (station) => (
                            <li key={station.frequency}>
                                <h3>{station.frequency}</h3>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="fm empty">no stations are set up</div>
                )}
            </div>
        </div>
    )
}

export default styled(StationList)`
    padding: 0 1rem;

    .empty,
    .loading {
        color: rgba(255, 255, 255, 0.3);
        font-style: italic;
        text-align: center;
    }

    h2 {
        font-size: 2.4rem;
        padding: 0 0 1rem 0;
        text-transform: uppercase;
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
        position: relative;
    }

    li {
        align-items: center;
        display: flex;
        list-style: none;

        & + li {
            border-top: 1px dotted rgba(255, 255, 255, 0.3);
            margin-top: 1.25rem;
            padding-top: 1.25rem;
        }

        h3 {
            flex: 0 0 84px;
            font-size: 3rem;
            margin: 0 1rem 0 0;
        }

        div {
            font-size: 2rem;
            font-weight: 700;
        }
    }
`
