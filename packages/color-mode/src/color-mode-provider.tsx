import { noop, __DEV__ } from "@chakra-ui/utils"
import * as React from "react"
import { ColorMode, disabledAllTransition } from "./color-mode.utils"
import {
  localStorageManager,
  StorageManager,
  cookieStorageManager,
} from "./storage-manager"

export type { ColorMode }

export interface ColorModeOptions {
  initialColorMode?: ColorMode
  useSystemColorMode?: boolean
}

interface ColorModeContextType {
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (value: any) => void
}

export const ColorModeContext = React.createContext({} as ColorModeContextType)

if (__DEV__) {
  ColorModeContext.displayName = "ColorModeContext"
}

/**
 * React hook that reads from `ColorModeProvider` context
 * Returns the color mode and function to toggle it
 */
export const useColorMode = () => {
  const context = React.useContext(ColorModeContext)
  if (context === undefined) {
    throw new Error("useColorMode must be used within a ColorModeProvider")
  }
  return context
}

export interface ColorModeProviderProps {
  value?: ColorMode
  children?: React.ReactNode
  options: ColorModeOptions
  manager?: StorageManager
  disabledTransition?: boolean
}

/**
 * Provides context for the color mode based on config in `theme`
 * Returns the color mode and function to toggle the color mode
 */
export function ColorModeProvider(props: ColorModeProviderProps) {
  const {
    value,
    children,
    options: { useSystemColorMode, initialColorMode },
    manager = localStorageManager,
    disabledTransition = true,
  } = props

  const [colorMode, setColorModeState] = React.useState(() =>
    manager.get(initialColorMode),
  )

  const [resolvedColorMode, setResolvedColorMode] = React.useState(
    () => manager.get(initialColorMode) as ColorMode,
  )

  const changeColorMode = React.useCallback(
    (value: ColorMode, updateStorage = true) => {
      const undo = disabledTransition ? disabledAllTransition() : null
      if (updateStorage) manager.set(value)
      const d = document.documentElement
      d.dataset.theme = value
      undo?.()
    },
    // eslint-disable-next-line
    [],
  )

  React.useEffect(() => {
    if (!useSystemColorMode) return
    const media = window.matchMedia("(prefers-color-scheme: dark)")

    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e.matches
      const systemTheme = isDark ? "dark" : "light"
      setResolvedColorMode(systemTheme)
      if (colorMode === "system") changeColorMode(systemTheme, false)
    }
    media.addListener(handler)
    handler(media)
    return () => media.removeListener(handler)
  }, [colorMode]) // eslint-disable-line

  const setColorMode = React.useCallback(
    (value) => {
      changeColorMode(value)
      setColorModeState(value)
    },
    [], // eslint-disable-line
  )

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== "chakra-ui-color-mode") return
      const theme = e.newValue
      setColorMode(theme)
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, []) // eslint-disable-line

  React.useEffect(() => {
    if (manager.type !== "cookie") return

    function tick() {
      const _value = cookieStorageManager.get()
      if (!_value) return
      const d = document.documentElement
      if (d.dataset.theme !== _value) {
        setColorMode(_value)
      }
    }
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [colorMode]) // eslint-disable-line

  const mode = colorMode === "system" ? resolvedColorMode : colorMode

  const toggleColorMode = React.useCallback(() => {
    setColorMode(mode === "dark" ? "light" : "dark")
  }, [mode, setColorMode])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ColorModeContext.Provider
      value={{
        colorMode: (value ?? mode) as ColorMode,
        toggleColorMode: value ? noop : toggleColorMode,
        setColorMode: value ? noop : setColorMode,
      }}
    >
      {children}
    </ColorModeContext.Provider>
  )
}

if (__DEV__) {
  ColorModeProvider.displayName = "ColorModeProvider"
}

/**
 * Locks the color mode to `dark`, without any way to change it.
 */
export const DarkMode: React.FC = (props) => (
  <ColorModeContext.Provider
    value={{ colorMode: "dark", toggleColorMode: noop, setColorMode: noop }}
    {...props}
  />
)

if (__DEV__) {
  DarkMode.displayName = "DarkMode"
}

/**
 * Locks the color mode to `light` without any way to change it.
 */
export const LightMode: React.FC = (props) => (
  <ColorModeContext.Provider
    value={{ colorMode: "light", toggleColorMode: noop, setColorMode: noop }}
    {...props}
  />
)

if (__DEV__) {
  LightMode.displayName = "LightMode"
}

/**
 * Change value based on color mode.
 *
 * @param light the light mode value
 * @param dark the dark mode value
 *
 * @example
 *
 * ```js
 * const Icon = useColorModeValue(MoonIcon, SunIcon)
 * ```
 */
export function useColorModeValue<TLight = unknown, TDark = unknown>(
  light: TLight,
  dark: TDark,
) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}
