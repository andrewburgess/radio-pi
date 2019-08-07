import classnames from "classnames"
import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const ScrollView = (props) => {
    const scroller = useRef(null)
    const container = useRef(null)

    const [isMouseDown, setMouseDown] = useState(false)

    useEffect(() => {
        if (!scroller.current) return

        const $scroller = scroller.current

        const mouseDown = (event) => {
            setMouseDown(true)
        }

        const mouseUp = (event) => {
            setMouseDown(false)
        }

        const mouseMove = (event) => {
            if (!isMouseDown) return

            console.log(event.clientX + ", " + event.clientY)
        }

        $scroller.addEventListener("mousedown", mouseDown)
        $scroller.addEventListener("mouseup", mouseUp)
        $scroller.addEventListener("mousemove", mouseMove)

        return () => {
            $scroller.removeEventListener("mousedown", mouseDown)
            $scroller.removeEventListener("mouseup", mouseUp)
            $scroller.removeEventListener("mousemove", mouseMove)
        }
    }, [isMouseDown])

    return (
        <div className={classnames(props.className, "scroller")} ref={scroller}>
            <div className="container" ref={container}>
                {props.children}
            </div>
        </div>
    )
}

export default styled(ScrollView)`
    max-height: 100%;
    overflow: hidden;

    .container {
        display: flex;
        flex-direction: column;
        overflow: visible;
        width: 100%;
    }
`
