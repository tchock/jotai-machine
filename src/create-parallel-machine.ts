import { atom } from 'jotai/vanilla'
import {
  ExtractEvent,
  ExtractState,
  ParallelChildAtoms,
  ParallelMachineAtom,
  ParallelMachineAtoms,
  ParallelMachineState,
} from './types'

const createParallelMachine = <const TChildAtoms extends ParallelChildAtoms>(
  childAtoms: TChildAtoms
) => {
  type State = ExtractState<TChildAtoms[keyof TChildAtoms]>
  type Event = ExtractEvent<TChildAtoms[keyof TChildAtoms]>

  const parallelAtoms: ParallelMachineAtoms<TChildAtoms> = Object.entries(
    childAtoms
  ).reduce((acc, [key, childAtom]) => {
    acc[key] = atom(
      (get) => get(childAtom),
      (_get, set, event: Event) => {
        set(combinedAtom, event)
      }
    )
    return acc
  }, {}) as unknown as ParallelMachineAtoms<TChildAtoms>

  const combinedAtom = atom(
    (get) => {
      const state = {} as unknown as ParallelMachineState<TChildAtoms>
      for (const key in childAtoms) {
        state[key] = get(childAtoms[key]) as State
      }
      return state
    },
    (_get, set, event: Event) => {
      for (const key in childAtoms) {
        set(childAtoms[key], event)
      }
    }
  ) as ParallelMachineAtom<TChildAtoms>

  combinedAtom.atoms = parallelAtoms

  return combinedAtom
}

export { createParallelMachine }
