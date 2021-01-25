import {
  ChakraProvider,
  cookieStorageManager,
  extendTheme,
} from "@chakra-ui/react"

export const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
})

export const Chakra = ({ children }) => {
  return (
    <ChakraProvider colorModeManager={cookieStorageManager} theme={theme}>
      {children}
    </ChakraProvider>
  )
}
