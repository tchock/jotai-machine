import { atom } from 'jotai/vanilla'

import type {
  ContextData,
  CreateActorOptions,
  CreateMachineOptions,
  EventName,
  MachineAtom,
  MachineStatePrimitive,
  Transitions,
} from './types'
import { machineContextAtom } from './utils/machine-context-atom'

const ALL = Symbol('ALL')

const createMachine =
  <
    State extends MachineStatePrimitive,
    Event extends EventName,
    Context extends ContextData = Record<string, never>,
  >(
    initialState: State,
    transitions: Transitions<State, Event>,
    createOptions: CreateMachineOptions<Context> = {}
  ) =>
  (actorOptions: CreateActorOptions<Context> = {}) => {
    const stateAtom = atom<State>(initialState)
    const [contextAtom, contextAtoms] = machineContextAtom(
      createOptions.context,
      actorOptions.context
    )

    const transitionAtom = atom(
      (get) => get(stateAtom),
      (get, set, event: Event, partialContext?: Partial<Context>) => {
        const currentState = get(stateAtom)
        const transition = transitions[currentState as string | symbol]
        const nextState = (transition?.[event] ?? transitions[ALL]?.[event]) as
          | State
          | undefined

        if (nextState !== undefined) {
          set(stateAtom, nextState)
          if (partialContext) {
            set(contextAtom, partialContext)
          }
          return nextState
        }
        return currentState
      }
    ) as MachineAtom<State, Event, Context>

    transitionAtom.contextAtom = contextAtom
    transitionAtom.contextAtoms = contextAtoms

    return transitionAtom
  }

export { createMachine, ALL }
