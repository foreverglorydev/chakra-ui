import { StyleConfigOptions, SystemStyleObject } from "@chakra-ui/styled-system"
import { Dict, get } from "@chakra-ui/utils"
import { useChakra } from "./hooks"
import { ThemingProps } from "./system.types"
import {
  interpretStyleConfig,
  normalizeStyleConfig,
} from "@chakra-ui/styled-system"

export function useStyleConfig(
  themeKey: string,
  props: ThemingProps & Dict,
  /**
   * @deprecated option `isMultiPart` is unused
   */
  opts: { isMultiPart: true },
): Record<string, SystemStyleObject>

export function useStyleConfig(
  themeKey: string,
  props?: ThemingProps & Dict,
  /**
   * @deprecated option `isMultiPart` is unused
   */
  opts?: { isMultiPart?: boolean },
): SystemStyleObject

export function useStyleConfig(
  themeKey: string,
  props: ThemingProps & Dict = {},
  _: any,
) {
  const { theme, colorMode } = useChakra()
  const { styleConfig, ...rest } = props
  const config: StyleConfigOptions =
    styleConfig ?? get(theme, `components.${themeKey}`)
  const getStyles = interpretStyleConfig(
    colorMode,
    theme,
    normalizeStyleConfig(config),
  )
  return getStyles(rest)
}

export function useMultiStyleConfig(
  themeKey: string,
  props: ThemingProps & Dict,
) {
  return useStyleConfig(themeKey, props)
}
