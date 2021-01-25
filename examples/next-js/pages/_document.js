import { ColorModeScript } from "@chakra-ui/react"
import Document, { Head, Html, Main, NextScript } from "next/document"
import React from "react"

class Doc extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          <ColorModeScript type="cookie" initialColorMode="system" />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default Doc
