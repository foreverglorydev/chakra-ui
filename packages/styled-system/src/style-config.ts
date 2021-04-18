import { Dict, isDefined, mergeWith, runIfFn } from "@chakra-ui/utils"
import { CSSObject, StyleObjectOrFn } from "./types"
import { ResponsiveValue } from "./utils"

type Thunk<T, Args extends any[] = []> = T | ((...args: Args) => T)

export interface StyleConfigThemingProps extends Dict {
  variant?: ResponsiveValue<string>
  size?: ResponsiveValue<string>
  colorScheme?: string
  styleConfig?: StyleConfigObjectOptions
  theme: Dict
}

export type DefaultVariantConfig = Record<
  string,
  Thunk<StyleObjectOrFn, [StyleConfigThemingProps]>
>

export type DefaultVariants = Partial<
  Record<"variant" | "size" | (string & {}), DefaultVariantConfig>
>

export type StyleConfigObjectOptions = CSSObject & {
  defaultVariants?: DefaultVariants
  defaultProps?: Dict
}

export type StyleConfigOptions = Thunk<
  StyleConfigObjectOptions,
  [StyleConfigThemingProps]
>

function getResponsiveVariantStyles(
  variantConfig: DefaultVariantConfig,
  responsiveName: ResponsiveValue<string>,
) {
  // TODO:
  //   * Iterate over ResponsiveValue
  //   * create min-max breakpoints
  //   * populate breakpoints

  return {
    // Example:
    // [variantName]: stylesForVariantNameAtBase,
    // "@media(min=sm, max=md)": {
    //   [variantName]: stylesForVariantNameAtSm,
    // },
    // "@media(min=md)": {
    //   [variantName]: stylesForVariantNameAtMd,
    // },
  }
}

function getAllVariantStyles(defaultVariants: DefaultVariants, props: Dict) {
  return Object.entries(defaultVariants)
    .flatMap(
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

        return getResponsiveVariantStyles(typeConfig, referencingProp)
      },
    )
    .filter(isDefined)
}

// TODO:
//  * call `styleConfig` in packages/system/src/use-style-config.ts
//  * mark updated object structure config as deprecated
export function styleConfig(config: StyleConfigOptions) {
  return function getStyles(props: StyleConfigThemingProps) {
    const { defaultVariants, defaultProps, ...restStyles } = runIfFn(
      props.styleConfig ?? config,
      props,
    )
    const allProps = { ...props, ...defaultProps }

    const allDefaultVariantStyles = getAllVariantStyles(
      defaultVariants ?? {},
      allProps,
    )

    return mergeWith({}, ...allDefaultVariantStyles, restStyles)
  }
}
