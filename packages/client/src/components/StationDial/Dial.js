import { map, range } from "lodash"
import { darken, transparentize } from "polished"
import React from "react"
import styled from "styled-components"

import { Colors } from "../../style"

const AM_STATIONS = range(600, 1800, 100)
const FM_STATIONS = range(88, 110, 2)

const StationDial = (props) => {
    return (
        <div className={props.className}>
            <div className="band__labels">
                <div className="band__label band__label--fm">FM</div>
                <div className="band__label band__label--am">AM</div>
            </div>
            <div className="bands">
                <div className="band band--fm">
                    <div className="band__freq--spacer"></div>
                    {map(FM_STATIONS, (freq) => (
                        <div className="band__freq band__freq--fm" key={freq}>
                            {freq}
                        </div>
                    ))}
                    <div className="band__freq--spacer"></div>
                </div>
                <div className="band band--am">
                    {map(AM_STATIONS, (freq) => (
                        <div className="band__freq band__freq--am" key={freq}>
                            {freq}
                        </div>
                    ))}
                </div>
                <div className="band__hashes">
                    {map(range(0, 231), (value) => (
                        <div className="band__hash" key={value} />
                    ))}
                </div>
            </div>
            <div className="band__selector"></div>
        </div>
    )
}

export default styled(StationDial)`
    .band__labels {
        background-color: ${Colors.background};
        display: none;
        flex-direction: column;
        height: 20vh;
        justify-content: space-around;
        position: relative;
        width: 20vw;
        z-index: 2;
    }

    .band__label {
        align-items: center;
        display: flex;
        flex: none;
        font-family: "Roboto Mono";
        font-size: 4vh;
        justify-content: center;
        height: 8vh;
        opacity: 0.2;
        padding: 0.6rem 1rem;
        text-align: center;
    }

    .band__selector {
        background-color: ${transparentize(0.2, darken(0.2, "#ff5800"))};
        border: 2px solid #ff5800;
        box-shadow: 0 0 4px #ff5800, 0 0 8px ${transparentize(0.5, "#FF5800")},
            0 0 12px ${transparentize(0.7, "#FF5800")};
        height: 16vh;
        left: calc(50% + 10vw - 4px);
        position: absolute;
        top: calc(50% - 8vh);
        width: 8px;
        z-index: 2;
    }

    .bands {
        flex: none;
        justify-content: space-around;
        height: 20vh;
        position: absolute;
        width: 480vw;
        top: 0;
        z-index: 1;
    }

    .band {
        align-items: center;
        display: flex;
        flex-direction: row;
        font-family: "Roboto Mono";
        height: 50%;
        position: absolute;
        width: 100%;
    }

    .band__hashes {
        align-items: center;
        display: flex;
        flex-direction: row;
        height: 5vh;
        left: -1vw;
        position: absolute;
        top: calc(50% - 2vh);
    }

    .band__hash {
        height: 1vh;
        position: relative;
        width: 2vw;

        &:before {
            border-left: 1px solid rgba(255, 255, 255, 0.2);
            bottom: 0;
            content: "";
            position: absolute;
            left: calc(50% - 1px);
            top: 0;
        }

        &:nth-child(5n + 1) {
            height: 3vh;

            &:before {
                border-left: 1px solid rgba(255, 255, 255, 0.4);
            }
        }

        &:nth-child(10n + 1) {
            height: 4vh;

            &:before {
                border-left: 2px solid #fff;
            }
        }
    }

    .band--am {
        bottom: 0;
    }

    .band--fm {
        top: 0;
    }

    .band--am {
        font-size: 3vh;
    }

    .band--fm {
        font-size: 6vh;
    }

    .band__freq {
        flex: 1 0px;
        text-align: center;
    }

    .band__freq--spacer {
        flex: 0.5 0px;
    }
`
