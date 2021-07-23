/**
 * Gets the part object the describes a component part.
 *
 * @param scope - the scope or component name
 * @param part - the component part name
 *
 * @example
 * ```js
 * const alertTitle = toPart("alert", "title")
 * console.log(alertTitle.selector )
 * // => "&[data-part=alert__title]"
 * ```
 */
function toPart<Scope extends string>(scope: Scope, part?: string) {
  const attr = [scope, part ?? "root"].filter(Boolean).join("__")
  const partObj = {
    selector: `[data-part=${attr}]`,
    attrs: {
      "data-part": attr,
      ...(!part && { "data-scope": scope }),
    },
    getId(uuid: string | number) {
      return [`${scope}-${uuid}`, part].filter(Boolean).join("--")
    },
    toString() {
      return this.selector
    },
  }
  return partObj as typeof partObj & typeof scope
}

type CssScopePart = ReturnType<typeof toPart>

type CssScope<T extends string> = Record<T | "root", CssScopePart> & {
  readonly extend: <U extends string>(...args: U[]) => CssScope<T | U>
  readonly selectors: Record<T, string>
}

/**
 * Used to define the anatomy/parts of a component in a way that provides
 * a consistent API for `data-part`, css selector and `id`.
 *
 * @see Idea https://css.oddbird.net/scope/
 *
 * @param root - the root component or main component name (e.g alert)
 *
 * @example
 * ```js
 * const alert = scope("alert").parts("title", "icon")
 * console.log(alert.title)
 * // =>  { selector: `[data-part=alert__title]`, attrs: { "data-part": "alert__title" } }
 * ```
 */
export function scope(root: string) {
  const map: Record<string, CssScopePart> = {
    root: toPart(root),
  }
  return {
    parts<T extends string>(...values: T[]) {
      for (const part of values) {
        map[part] = toPart(root, part)
      }

      Object.defineProperty(map, "extend", {
        enumerable: false,
        writable: false,
        value: <T extends string>(...parts: T[]) => {
          for (const part of parts) {
            if (part in map) continue
            map[part] = toPart(root, part)
          }
          return map
        },
      })

      Object.defineProperty(map, "selectors", {
        enumerable: false,
        get() {
          return Object.fromEntries(
            Object.entries(map).map(([key, part]) => [key, part.selector]),
          )
        },
      })

      return map as CssScope<T>
    },
  }
}
