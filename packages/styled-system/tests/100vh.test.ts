import { css } from "../src"
import { createTheme } from "./theme"

const theme = createTheme("ltr")

describe("100vh fix", () => {
  test("should transform 100vh properly", () => {
    expect(css({ minH: ["40px", "100vh"] })(theme)).toMatchInlineSnapshot(`
      Object {
        "@media screen and (min-width: 40em)": Object {
          "@supports(height: -webkit-fill-available)": Object {
            "minHeight": "-webkit-fill-available",
          },
          "minHeight": "100vh",
        },
        "minHeight": "40px",
      }
    `)
    expect(css({ height: "sm" })(theme)).toMatchInlineSnapshot(`
        Object {
          "height": "var(--sizes-sm)",
        }
      `)
    expect(css({ height: "40px" })(createTheme("ltr"))).toMatchInlineSnapshot(`
        Object {
          "height": "40px",
        }
      `)
  })
})
