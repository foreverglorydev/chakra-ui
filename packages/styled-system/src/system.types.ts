import { Dict } from "@chakra-ui/utils"
import * as CSS from "csstype"
import type {
  BackgroundProps,
  BorderProps,
  ColorProps,
  EffectProps,
  FilterProps,
  FlexboxProps,
  GridProps,
  InteractivityProps,
  LayoutProps,
  ListProps,
  OtherProps,
  PositionProps,
  RingProps,
  SpaceProps,
  TextDecorationProps,
  TransformProps,
  TransitionProps,
  TypographyProps,
} from "./config"
import { Pseudos } from "./pseudos"
import { ResponsiveValue } from "./utils/types"

export interface StyleProps
  extends SpaceProps,
    ColorProps,
    TransitionProps,
    TypographyProps,
    FlexboxProps,
    TransformProps,
    GridProps,
    FilterProps,
    LayoutProps,
    BorderProps,
    EffectProps,
    BackgroundProps,
    ListProps,
    PositionProps,
    RingProps,
    InteractivityProps,
    TextDecorationProps,
    OtherProps {}

export interface SystemCSSProperties
  extends CSS.Properties,
    Omit<StyleProps, keyof CSS.Properties> {}

export type ThemeThunk<T> = T | ((theme: Dict) => T)

type PropertyValue<K extends keyof SystemCSSProperties> = ThemeThunk<
  ResponsiveValue<boolean | number | string | SystemCSSProperties[K]>
>

export type CSSWithMultiValues = {
  [K in keyof SystemCSSProperties]?: K extends keyof StyleProps
    ? StyleProps[K] | PropertyValue<K>
    : PropertyValue<K>
}

type PseudoKeys = keyof CSS.Pseudos | keyof Pseudos

type PseudoSelectorDefinition<D> = D | RecursivePseudo<D>

export type RecursivePseudo<D> = {
  [K in PseudoKeys]?: PseudoSelectorDefinition<D> & D
}

type CSSDefinition<D> = D | string | RecursiveCSSSelector<D | string>

export interface RecursiveCSSSelector<D> {
  [selector: string]: CSSDefinition<D> & D
}

export type RecursiveCSSObject<D> = D &
  (D | RecursivePseudo<D> | RecursiveCSSSelector<D>)

export type CSSObject = RecursiveCSSObject<CSSWithMultiValues>

export type SystemStyleObject = CSSObject

export interface FunctionCSSInterpolation {
  (theme: Dict): CSSObject
}

export type StyleObjectOrFn = CSSObject | FunctionCSSInterpolation

type PseudoProps = {
  [K in keyof Pseudos]?: SystemStyleObject
}

export interface SystemProps extends StyleProps, PseudoProps {}

export interface StyleConfig {
  baseStyle?: SystemStyleObject
  sizes?: { [size: string]: SystemStyleObject }
  variants?: { [variant: string]: SystemStyleObject }
  defaultProps?: {
    size?: string
    variant?: string
    colorScheme?: string
  }
}

export interface MultiStyleConfig {
  baseStyle?: { [part: string]: SystemStyleObject }
  sizes?: { [size: string]: { [part: string]: SystemStyleObject } }
  variants?: { [variants: string]: { [part: string]: SystemStyleObject } }
  defaultProps?: StyleConfig["defaultProps"]
}

export interface GlobalStyleProps {
  colorScheme: string
  colorMode: "light" | "dark"
  theme: Dict
}

export type GlobalStyles = {
  global?: SystemStyleObject | ((props: GlobalStyleProps) => SystemStyleObject)
}

export type JSXElementStyles = {
  [K in keyof JSX.IntrinsicElements]?: SystemStyleObject
}

export type Styles = GlobalStyles & JSXElementStyles

export function mode(light: any, dark: any) {
  return (props: Dict) => (props.colorMode === "dark" ? dark : light)
}

export function orient(options: {
  orientation?: "vertical" | "horizontal"
  vertical: any
  horizontal: any
}) {
  const { orientation, vertical, horizontal } = options
  if (!orientation) return {}
  return orientation === "vertical" ? vertical : horizontal
}
