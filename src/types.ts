import type { Atom, WritableAtom } from 'jotai/vanilla'

type MachineStatePrimitive = string | symbol | boolean
type EventName = string | symbol

type TransitionsObj<T extends MachineStatePrimitive, E extends EventName> = {
  [state in T as string | symbol]: {
    [event in E]?: T | ((get: (atom: (atom: Atom<T>) => T) => T) => T)
  }
}

type Transitions<
  T extends MachineStatePrimitive,
  E extends EventName,
> = TransitionsObj<T, E>

// Extract the state type from a WritableAtom
type ExtractState<T> =
  T extends WritableAtom<infer State, [unknown], unknown> ? State : never

// Extract the event type from a WritableAtom
type ExtractEvent<T> =
  T extends WritableAtom<unknown, [infer Event], unknown> ? Event : never

type ParallelChildAtoms = Record<string, WritableAtom<unknown, [unknown], void>>

// Helper type for the parallel machine state
type ParallelMachineState<TChildAtoms extends ParallelChildAtoms> = {
  [K in keyof TChildAtoms]: ExtractState<TChildAtoms[K]>
}

// Helper type for the parallel machine events
type ParallelMachineEvent<TChildAtoms extends ParallelChildAtoms> = {
  [K in keyof TChildAtoms]: ExtractEvent<TChildAtoms[K]>
}[keyof TChildAtoms]

// Helper type for the atoms property
type ParallelMachineAtoms<TChildAtoms extends ParallelChildAtoms> = {
  [K in keyof TChildAtoms]: WritableAtom<
    ExtractState<TChildAtoms[K]>,
    [ParallelMachineEvent<TChildAtoms>],
    void
  >
}

type ParallelMachineAtom<TChildAtoms extends ParallelChildAtoms> = WritableAtom<
  ParallelMachineState<TChildAtoms>,
  [ParallelMachineEvent<TChildAtoms>],
  void
> & {
  atoms: ParallelMachineAtoms<TChildAtoms>
}

export type {
  MachineStatePrimitive,
  EventName,
  Transitions,
  TransitionsObj,
  ParallelChildAtoms,
  ParallelMachineAtom,
  ParallelMachineState,
  ParallelMachineEvent,
  ParallelMachineAtoms,
  ExtractState,
  ExtractEvent,
}
