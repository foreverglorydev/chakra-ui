import {
  ColorModeProvider,
  cookieStorageManager,
  CSSReset,
  GlobalStyle,
  ThemeProvider,
} from "@chakra-ui/react"
import { theme } from "../src/chakra.config"

function MyApp(props) {
  const { Component, pageProps } = props
  return (
    <ThemeProvider theme={theme}>
      <CSSReset />
      <ColorModeProvider manager={cookieStorageManager} options={theme.config}>
        <GlobalStyle />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  )
}

export default MyApp
