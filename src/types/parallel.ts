import { WritableAtom } from 'jotai/vanilla'
import { ContextAtom, ContextData } from './context'
import { ExtractEvent, ExtractState, Machine, MachineAtom } from './machine'

type ParallelChildMachines<Context extends ContextData> = Record<
  string,
  Machine<unknown, unknown, Partial<Context>>
>

// Helper type for the parallel machine state
type ParallelMachineState<
  TChildMachines extends ParallelChildMachines<Context>,
  Context extends ContextData = Record<string, unknown>,
> = {
  [K in keyof TChildMachines]: ExtractState<TChildMachines[K], Context>
}

// Helper type for the parallel machine events
type ParallelMachineEvent<
  TChildMachines extends ParallelChildMachines<Context>,
  Context extends ContextData = Record<string, unknown>,
> = {
  [K in keyof TChildMachines]: ExtractEvent<TChildMachines[K], Context>
}[keyof TChildMachines]

// Helper type for the atoms property
type ParallelMachineAtoms<
  TChildMachines extends ParallelChildMachines<Context>,
  Context extends ContextData,
> = {
  [K in keyof TChildMachines]: MachineAtom<
    ExtractState<TChildMachines[K], Context>,
    ParallelMachineEvent<TChildMachines>,
    Context
  >
}

type ParallelMachineAtom<
  TChildMachines extends ParallelChildMachines<Context>,
  Context extends ContextData = Record<string, unknown>,
> = WritableAtom<
  ParallelMachineState<TChildMachines>,
  [ParallelMachineEvent<TChildMachines>],
  void
> & {
  atoms: ParallelMachineAtoms<TChildMachines, Context>
  contextAtom: ContextAtom<Context>
}

export type {
  ParallelChildMachines,
  ParallelMachineState,
  ParallelMachineEvent,
  ParallelMachineAtoms,
  ParallelMachineAtom,
}
