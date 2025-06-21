import { atom } from 'jotai/vanilla'

import type { WritableAtom } from 'jotai'
import type { EventName, MachineStatePrimitive, Transitions } from './types'

const ALL = Symbol('ALL')

const createMachine = <T extends MachineStatePrimitive, E extends EventName>(
  initialState: T,
  transitions: Transitions<T, E>
): WritableAtom<T, [eventName: E], void> => {
  const stateAtom = atom<T>(initialState)
  const transitionAtom = atom(
    (get) => get(stateAtom),
    (get, set, event: E) => {
      const currentState = get(stateAtom)
      const transition = transitions[currentState as string | symbol]
      const nextState: unknown =
        transition?.[event] ?? transitions[ALL]?.[event]

      if (nextState !== undefined) {
        set(stateAtom, nextState)
      }
    }
  )

  return transitionAtom
}

export { createMachine, ALL }
