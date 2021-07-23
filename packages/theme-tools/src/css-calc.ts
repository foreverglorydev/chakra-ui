import { isObject } from "@chakra-ui/utils"
import { CSSVar } from "./css-var"

export type Operand = string | number | CSSVar
type Operands = Operand[]

type Operator = "+" | "-" | "*" | "/"

function resolveReference(operand: Operand): string {
  if (isObject(operand) && operand.reference) {
    return operand.reference
  }
  return String(operand)
}

const toExpression = (operator: Operator, ...operands: Operands) =>
  operands.map(resolveReference).join(` ${operator} `).replace(/calc/g, "")

const add = (...operands: Operands) => `calc(${toExpression("+", ...operands)})`

const subtract = (...operands: Operands) =>
  `calc(${toExpression("-", ...operands)})`

const multiply = (...operands: Operands) =>
  `calc(${toExpression("*", ...operands)})`

const divide = (...operands: Operands) =>
  `calc(${toExpression("/", ...operands)})`

const negate = (x: Operand) => {
  const value = resolveReference(x)

  if (value != null && !Number.isNaN(parseFloat(value))) {
    return String(value).startsWith("-") ? String(value).slice(1) : `-${value}`
  }

  return multiply(value, -1)
}

interface CalcChain {
  add: (...operands: Operands) => CalcChain
  subtract: (...operands: Operands) => CalcChain
  multiply: (...operands: Operands) => CalcChain
  divide: (...operands: Operands) => CalcChain
  negate: () => CalcChain
  toString: () => string
}

export const calc = Object.assign(
  (x: Operand): CalcChain => ({
    add: (...operands) => calc(add(x, ...operands)),
    subtract: (...operands) => calc(subtract(x, ...operands)),
    multiply: (...operands) => calc(multiply(x, ...operands)),
    divide: (...operands) => calc(divide(x, ...operands)),
    negate: () => calc(negate(x)),
    toString: () => x.toString(),
  }),
  {
    add,
    subtract,
    multiply,
    divide,
    negate,
  },
)
