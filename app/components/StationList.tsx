import { map, range, round } from "lodash"
import * as React from "react"
import styled from "styled-components"

import { RADIO_BAND } from "../constants"

export interface IStationListProps {
    className?: string
}

const amStations = range(550, 1610, 10)
const fmStations = map(range(87.5, 107.9, 0.2), (station) => round(station, 2))

const StationList: React.SFC<IStationListProps> = (props) => {
    const [band, setBand] = React.useState(RADIO_BAND.FM)
    const stations = band === RADIO_BAND.AM ? amStations : fmStations

    return (
        <div className={props.className}>
            <h2>Stations</h2>
            <div>
                <button type="button" onClick={() => setBand(RADIO_BAND.AM)}>
                    AM
                </button>
                <button type="button" onClick={() => setBand(RADIO_BAND.FM)}>
                    FM
                </button>
            </div>
            <ul>
                {map(stations, (station) => (
                    <li key={station}>
                        <h3>{station}</h3>
                        <div className="unassigned">Unassigned</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default styled(StationList)`
    h2 {
        font-size: 2.4rem;
        padding: 0 0 1rem 0;
        text-transform: uppercase;
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

            &.unassigned {
                color: rgba(255, 255, 255, 0.5);
                font-style: italic;
            }
        }
    }
`
