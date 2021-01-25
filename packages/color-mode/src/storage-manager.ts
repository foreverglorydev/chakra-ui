import { isBrowser } from "@chakra-ui/utils"
import type { ColorMode as BaseColorMode } from "./color-mode.utils"

type ColorMode = BaseColorMode | "system"

const hasLocalStorage = typeof Storage !== "undefined"
export const storageKey = "chakra-ui-color-mode"

export interface StorageManager {
  get(init?: ColorMode): ColorMode | undefined
  set(value: ColorMode): void
  type: "cookie" | "localStorage"
}

export const localStorageManager: StorageManager = {
  type: "localStorage",
  get(init?) {
    if (!hasLocalStorage || !isBrowser) return init
    const maybeValue = localStorage.getItem(storageKey) as ColorMode | undefined
    return maybeValue ?? init
  },
  set(value) {
    if (!hasLocalStorage || !isBrowser) return
    localStorage.setItem(storageKey, value)
  },
}

export const cookieStorageManager: StorageManager = {
  type: "cookie",
  get(init?) {
    if (typeof document === "undefined") return init
    const match = document.cookie.match(
      new RegExp(`(^| )${storageKey}=([^;]+)`),
    )
    const maybeValue = match?.[2] as ColorMode
    return maybeValue ?? init
  },
  set(value) {
    if (typeof document === "undefined") return
    document.cookie = `${storageKey}=${value}; max-age=31536000; path=/`
  },
}
