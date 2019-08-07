import { map, range } from "lodash"
import React from "react"
import styled from "styled-components"

import { storiesOf } from "@storybook/react"

import ScrollView from "../components/ScrollView"

const StoryScrollView = styled(ScrollView)`
    height: 400px;
    width: 600px;
`

storiesOf("ScrollView", module).add("default", () => {
    const values = range(1, 100, 1)
    return (
        <StoryScrollView>
            {map(values, (value) => (
                <div>{value}</div>
            ))}
        </StoryScrollView>
    )
})
