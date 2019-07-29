import * as classnames from "classnames"
import * as React from "react"
import styled from "styled-components"

import { AppContext } from "../context/app"
import Authorize from "./Authorize"
import { AUTHORIZED_STATE } from "../constants"
import Radio from "./Radio"

export interface IMainPanelProps {
    className?: string
}

const MainPanel: React.SFC<IMainPanelProps> = (props) => {
    const [context] = React.useContext(AppContext)

    if (context.authorized === AUTHORIZED_STATE.UNKNOWN) {
        return <div className={classnames(props.className, "loading")}>Loading...</div>
    }

    return (
        <div className={props.className}>
            {context.authorized === AUTHORIZED_STATE.AUTHORIZED ? <Radio /> : <Authorize />}
        </div>
    )
}

export default styled(MainPanel)`
    height: 100%;
    width: 100%;

    &.loading {
        align-items: center;
        display: flex;
        font-size: 2.5rem;
        font-weight: 900;
        justify-content: center;
        text-transform: uppercase;
    }
`
