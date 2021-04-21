import {
  AnalyzeBreakpointsReturn,
  Dict,
  filterUndefined,
  isDefined,
  isNumeric,
  isObject,
  mergeWith,
  runIfFn,
} from "@chakra-ui/utils"
import { CSSObject, StyleObjectOrFn } from "./types"
import { ResponsiveValue } from "./utils"
import { ColorMode } from "@chakra-ui/color-mode"

type Thunk<T, Args extends any[] = []> = T | ((...args: Args) => T)

export interface StyleConfigThemingProps extends Dict {
  theme: Dict
  colorMode: ColorMode

  variant?: ResponsiveValue<string>
  size?: ResponsiveValue<string>
  colorScheme?: string
  styleConfig?: StyleConfigOptions
  children?: unknown
}

export type DefaultVariantConfig = Record<
  string,
  Thunk<StyleObjectOrFn, [StyleConfigThemingProps]>
>

export type DefaultVariants = Partial<
  Record<"variant" | "size" | (string & {}), DefaultVariantConfig>
>

export type StyleConfigOptions = CSSObject & {
  parts?: string[]
  defaultVariants?: DefaultVariants
  defaultProps?: Dict
}

type StyleConfigInterpreterOptions = { isComponentMultiStyleConfig?: boolean }

type BreakpointDetail = NonNullable<AnalyzeBreakpointsReturn>["details"]

function getResponsiveVariantStyles(
  variantConfig: DefaultVariantConfig,
  responsiveName: ResponsiveValue<string>,
  props: StyleConfigThemingProps,
  { isComponentMultiStyleConfig }: StyleConfigInterpreterOptions,
) {
  const breakpointDetails: BreakpointDetail = props.theme.__breakpoints?.details
  if (!breakpointDetails) {
    return null
  }

  function findBreakpoint(key: string | number) {
    if (isNumeric(key)) {
      // key is an array index
      return breakpointDetails[key]
    }

    // key is the breakpoint name
    return breakpointDetails.find((bp) => bp.breakpoint === key)
  }

  if (!isObject(responsiveName) && !Array.isArray(responsiveName)) {
    return runIfFn(variantConfig[responsiveName], props)
  }

  // responsive prop is either in the object or array notation
  const result = Object.keys(responsiveName).map((key, index, all) => {
    const isLast = index === all.length - 1
    const value = responsiveName[key]
    const breakpoint = findBreakpoint(key)

    if (!breakpoint) {
      return null
    }

    const mediaQueryStyles = runIfFn(variantConfig[value], props)

    const mediaQuery = isLast ? breakpoint.minWQuery : breakpoint.minMaxQuery

    if (isComponentMultiStyleConfig && mediaQueryStyles) {
      return Object.fromEntries(
        Object.entries(mediaQueryStyles).map(
          ([partName, partStyles]) =>
            [partName, { [mediaQuery]: partStyles }] as const,
        ),
      )
    }

    return {
      [mediaQuery]: mediaQueryStyles,
    }
  })

  return mergeWith({}, ...result)
}

function getAllVariantStyles(
  defaultVariants: DefaultVariants,
  props: StyleConfigThemingProps,
  options: StyleConfigInterpreterOptions,
) {
  return Object.entries(defaultVariants)
    .map(
      ([
        /** @example `size` or `variant` */
        typeName,
        typeConfig,
      ]) => {
        if (!typeConfig) {
          // skip empty definitions
          return null
        }

        const referencingProp: ResponsiveValue<string> = props[typeName]
        if (!referencingProp) {
          // prop is not provided e.g. `size={null}`
          return null
        }

        return getResponsiveVariantStyles(
          typeConfig,
          referencingProp,
          props,
          options,
        )
      },
    )
    .filter(isDefined)
}

// TODO:
//  * call `styleConfig` in packages/system/src/use-style-config.ts
//  * mark updated object structure config as deprecated
export function interpretStyleConfig(
  colorMode: ColorMode,
  theme: Dict,
  styleConfig: StyleConfigOptions,
) {
  return function getStyles(props: Dict) {
    if (!styleConfig) {
      return null
    }

    const {
      defaultVariants,
      defaultProps = {},
      parts,
      ...restConfig
    } = styleConfig

    const isComponentMultiStyleConfig = Array.isArray(parts)

    const mergedProps: StyleConfigThemingProps = mergeWith(
      { theme, colorMode },
      defaultProps,
      props,
      filterUndefined(props),
    )

    const allDefaultVariantStyles = getAllVariantStyles(
      defaultVariants ?? {},
      mergedProps,
      { isComponentMultiStyleConfig },
    )

    const maybeMultiPartEmptyStyles = isComponentMultiStyleConfig
      ? Object.fromEntries(parts!.map((key) => [key, {}]))
      : {}

    return mergeWith(
      {},
      maybeMultiPartEmptyStyles,
      ...allDefaultVariantStyles,
      restConfig,
    )
  }
}

type OldStyleConfig = StyleConfigOptions & {
  baseStyle?: Dict
  variants?: Dict
  sizes?: Dict
}

export function normalizeStyleConfig(
  styleConfig: OldStyleConfig,
): StyleConfigOptions {
  const { baseStyle, variants, sizes, defaultVariants, ...rest } = styleConfig
  return {
    ...baseStyle,
    defaultVariants: {
      ...defaultVariants,
      variant: variants,
      size: sizes,
    },
    ...rest,
  }
}
