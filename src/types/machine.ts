import type { Atom, WritableAtom } from 'jotai/vanilla'
import type {
  ContextAtom,
  ContextAtoms,
  ContextAtomsCreator,
  ContextData,
} from './context'

type MachineStatePrimitive = string | symbol | boolean
type EventName = string | symbol

type Machine<State, Event, Context extends ContextData> = (
  actorOptions?: CreateActorOptions<Context>
) => MachineAtom<State, Event, Context>

type TransitionsObj<T extends MachineStatePrimitive, E extends EventName> = {
  [state in T as string | symbol]: {
    [event in E]?: T | ((get: (atom: (atom: Atom<T>) => T) => T) => T)
  }
}

type Transitions<
  T extends MachineStatePrimitive,
  E extends EventName,
> = TransitionsObj<T, E>

type CreateMachineOptions<C extends ContextData> = {
  context?: ContextAtomsCreator<C>
}

type CreateActorOptions<C extends ContextData> = {
  context?: ContextAtoms<Partial<C>>
}

// Extract the state type from a WritableAtom
type ExtractState<T, C extends ContextData> =
  T extends Machine<infer State, unknown, C> ? State : never

// Extract the event type from a WritableAtom
type ExtractEvent<T, C extends ContextData> =
  T extends Machine<unknown, infer Event, C> ? Event : never

type MachineAtom<State, Event, Context extends ContextData> = WritableAtom<
  State,
  [event: Event, partialContext?: Partial<Context>],
  State
> & {
  contextAtom: ContextAtom<Context>
  contextAtoms: ContextAtoms<Context>
}

export type {
  MachineStatePrimitive,
  EventName,
  Transitions,
  TransitionsObj,
  ExtractState,
  ExtractEvent,
  CreateMachineOptions,
  CreateActorOptions,
  MachineAtom,
  Machine,
}
