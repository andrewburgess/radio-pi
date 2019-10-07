import React from "react"

import { storiesOf } from "@storybook/react"

import AlbumArt from "../components/AlbumArt"

storiesOf("Album Art", module).add("default", () => {
    return <AlbumArt src="https://i.scdn.co/image/2c8c0cea05bf3d3c070b7498d8d0b957c4cdec20" />
})
