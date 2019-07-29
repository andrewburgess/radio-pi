import * as React from "react"
import styled from "styled-components"

import StationList from "./StationList"

export interface IRadioProps {
    className?: string
}

const Radio: React.SFC<IRadioProps> = (props) => {
    return (
        <div className={props.className}>
            <StationList />
        </div>
    )
}

export default styled(Radio)`
    align-self: stretch;
    display: flex;
    flex-direction: column;
    padding: 6rem 0 2rem;
    width: 100%;
`
