import { nanoid } from "@chakra-ui/utils"
import { ToastOptions, ToastPosition } from "./toast.types"

type Position =
  | "top"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom"
  | "bottom-right"

type State = Record<Position, Map<string, ToastOptions>>

export enum ActionType {
  ADD_TOAST,
  UPDATE_TOAST,
  CLOSE_TOAST,
  REMOVE_TOAST,
  CLOSE_ALL_TOAST,
}

type Action =
  | {
      type: ActionType.ADD_TOAST
      toast: ToastOptions
    }
  | {
      type: ActionType.CLOSE_TOAST
      id: string
    }
  | {
      type: ActionType.UPDATE_TOAST
      toast: ToastOptions
    }
  | {
      type: ActionType.REMOVE_TOAST
      id: string
    }
  | {
      type: ActionType.CLOSE_ALL_TOAST
      positions: ToastPosition[]
    }

export const getToastPosition = (toasts: State, id: string) => {
  const toastMap = Object.values(toasts)
    .flat()
    .find((toast) => toast.has(id))

  return toastMap?.get(id)?.position
}

export const reducer = (state: State, action: Action): State => {
  const newState = { ...state }

  switch (action.type) {
    case ActionType.ADD_TOAST: {
      const { position, id } = action.toast
      const toastId = id ?? nanoid()
      newState[position].set(toastId, { ...action.toast, id: toastId })

      return newState
    }
    case ActionType.CLOSE_TOAST: {
      const { id } = action
      const position = getToastPosition(state, id)

      if (!position) return state

      const toast = newState[position].get(id)

      if (toast) {
        toast.requestClose = true
        newState[position].set(id, toast)
      }

      return newState
    }
    case ActionType.UPDATE_TOAST: {
      const { id } = action.toast
      const position = getToastPosition(state, id)

      if (position) {
        newState[position].set(id, action.toast)
      }

      return newState
    }
    case ActionType.REMOVE_TOAST: {
      const { id } = action
      const position = getToastPosition(state, id)

      if (position) {
        newState[position].delete(id)
      }

      return newState
    }
    case ActionType.CLOSE_ALL_TOAST: {
      const { positions } = action

      for (const position of positions) {
        newState[position].forEach((toast) => {
          toast.requestClose = true
          newState[position].set(toast.id, toast)
        })
      }

      return newState
    }
    default:
      return state
  }
}
