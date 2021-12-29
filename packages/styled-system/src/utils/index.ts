import type { ThemeScale } from "../create-theme-vars"
import { createTransform } from "./create-transform"
import { CSSProp, logical, PropConfig, toConfig } from "./prop-config"
import { transformFunctions as transforms } from "./transform-functions"

export * from "./types"
export { transforms }

export const t = {
  borderWidths: toConfig("borderWidths"),
  borderStyles: toConfig("borderStyles"),
  colors: toConfig("colors"),
  borders: toConfig("borders"),
  radii: toConfig("radii", transforms.px),
  space: toConfig("space", transforms.px),
  spaceT: toConfig("space", transforms.px),
  degreeT(property: PropConfig["property"]) {
    return { property, transform: transforms.degree }
  },
  heightT(property: CSSProp) {
    const result: PropConfig = { scale: "sizes" }
    result.transform = createTransform({
      scale: "sizes",
      transform: transforms.px,
      compose(value) {
        if (value !== "100vh") return { [property]: value }
        return {
          [property]: "100vh",
          [`@supports(height: -webkit-fill-available)`]: {
            [property]: "-webkit-fill-available",
          },
        }
      },
    })
    return result
  },
  prop(
    property: PropConfig["property"],
    scale?: ThemeScale,
    transform?: PropConfig["transform"],
  ) {
    return {
      property,
      scale,
      ...(scale && {
        transform: createTransform({ scale, transform }),
      }),
    }
  },
  propT(property: PropConfig["property"], transform?: PropConfig["transform"]) {
    return { property, transform }
  },
  sizes: toConfig("sizes", transforms.px),
  sizesT: toConfig("sizes", transforms.fraction),
  shadows: toConfig("shadows"),
  logical,
  blur: toConfig("blur", transforms.blur),
}
