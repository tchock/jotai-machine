import { atom } from 'jotai/vanilla'
import {
  ContextData,
  CreateActorOptions,
  ExtractEvent,
  ExtractState,
  ParallelChildMachines,
  ParallelMachineAtom,
  ParallelMachineAtoms,
  ParallelMachineState,
} from './types'

const createParallelMachine =
  <
    const TChildMachines extends ParallelChildMachines<Context>,
    const Context extends ContextData,
  >(
    childMachines: TChildMachines
  ) =>
  (actorOptions: CreateActorOptions<Context> = {}) => {
    type State = ExtractState<TChildMachines[keyof TChildMachines], Context>
    type Event = ExtractEvent<TChildMachines[keyof TChildMachines], Context>
    const childAtoms = Object.entries(childMachines).reduce(
      (acc, [key, machine]) => {
        acc[key] = machine({
          context: actorOptions.context,
        })
        return acc
      },
      {}
    ) as ParallelMachineAtoms<TChildMachines, Context>

    const contextAtom = atom(
      (get) => {
        return Object.values(childAtoms).reduce(
          (acc, childAtom) => ({
            ...acc,
            ...get(childAtom.contextAtom),
          }),
          {} as Context
        )
      },
      (_get, set, newContext: Partial<Context>) => {
        for (const key in childAtoms) {
          set(childAtoms[key].contextAtom, newContext)
        }
      }
    )

    const parallelAtoms: ParallelMachineAtoms<TChildMachines, Context> =
      Object.entries(childAtoms).reduce((acc, [key, childAtom]) => {
        acc[key] = atom(
          (get) => get(childAtom),
          (_get, set, event: unknown) => {
            set(combinedAtom, event)
          }
        )
        acc[key].contextAtom = childAtom.contextAtom
        return acc
      }, {}) as ParallelMachineAtoms<TChildMachines, Context>

    const combinedAtom = atom(
      (get) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = {} as any
        for (const key in childAtoms) {
          state[key] = get(childAtoms[key]) as State
        }
        return state as ParallelMachineState<TChildMachines>
      },
      (_get, set, event: Event) => {
        for (const key in childAtoms) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          set(childAtoms[key], event as any)
        }
      }
    ) as ParallelMachineAtom<TChildMachines, Context>

    combinedAtom.atoms = parallelAtoms
    combinedAtom.contextAtom = contextAtom

    return combinedAtom
  }

export { createParallelMachine }
