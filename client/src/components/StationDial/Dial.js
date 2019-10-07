import { map, range } from "lodash"
import { darken, transparentize } from "polished"
import React, { useRef, useEffect } from "react"
import styled from "styled-components"

import { Colors } from "../../style"
import { RADIO_BAND } from "@radio-pi/common"

const AM_STATIONS = range(600, 1800, 100)
const FM_STATIONS = range(88, 110, 2)

const StationDial = (props) => {
    const bandsRef = useRef(null)

    useEffect(() => {
        if (bandsRef.current === null) return

        const $bands = bandsRef.current
        const amount = props.band === RADIO_BAND.AM ? (props.freq - 550) / (1750 - 550) : (props.freq - 86) / (110 - 86)

        $bands.style.transform = `translateX(${-1 * amount * 100}%)`
    })

    return (
        <div className={props.className}>
            <div className="band__labels">
                <div className="band__label band__label--fm">FM</div>
                <div className="band__label band__label--am">AM</div>
            </div>
            <div className="bands" ref={bandsRef}>
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
        height: 20vh;
        position: relative;
        width: 100%;
        z-index: 2;
    }

    .band__label {
        font-family: "Roboto Mono";
        opacity: 0.2;
        position: absolute;
        transform: translateX(-50%);
    }

    .band__label--fm {
        font-size: 8vh;
        left: 15%;
        top: 0;
    }

    .band__label--am {
        font-size: 6vh;
        bottom: 0;
        left: 85%;
    }

    .band__selector {
        background-color: ${transparentize(0.2, darken(0.2, Colors.dial))};
        border: 2px solid ${Colors.dial};
        box-shadow: 0 0 4px ${Colors.dial}, 0 0 8px ${transparentize(0.5, Colors.dial)},
            0 0 12px ${transparentize(0.7, Colors.dial)};
        height: 16vh;
        left: calc(50% - 4px);
        position: absolute;
        top: calc(50% - 8vh);
        width: 8px;
        z-index: 2;
    }

    .bands {
        flex: none;
        height: 20vh;
        justify-content: space-around;
        left: 50%;
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        transition: transform cubic-bezier(0.64, -0.08, 0.51, 1.19) 1.5s;
        width: 480vw;
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
