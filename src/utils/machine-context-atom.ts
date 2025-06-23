import { atom } from 'jotai/vanilla'
import type {
  ContextAtom,
  ContextAtoms,
  ContextAtomsCreator,
  ContextData,
} from '../types'
import { pick } from './pick'

const machineContextAtom = <Context extends ContextData>(
  contextCreator?: ContextAtomsCreator<Context>,
  actorContext?: ContextAtoms<Partial<Context>>
): [ContextAtom<Context>, ContextAtoms<Context>] => {
  const machineContextAtoms: ContextAtoms<Context> = contextCreator?.()
  const machineContextKeys = machineContextAtoms
    ? Object.keys(machineContextAtoms)
    : []

  if (machineContextKeys.length === 0) {
    const emptyContextAtom = atom({}, () => {
      // No-op for empty context
    }) as unknown as ContextAtom<Context>
    return [emptyContextAtom, {} as ContextAtoms<Context>]
  }

  const contextAtoms = {
    ...machineContextAtoms,
    ...pick(actorContext, machineContextKeys),
  } as ContextAtoms<Context>

  const contextAtom = atom(
    (get) => {
      const ctx = {} as Context
      for (const key in contextAtoms) {
        ctx[key] = get(contextAtoms[key])
      }
      return ctx
    },
    (_get, set, newContext: Partial<Context>) => {
      for (const key in newContext) {
        if (machineContextAtoms?.[key]) {
          set(contextAtoms[key], newContext[key] as unknown)
        }
      }
    }
  ) as ContextAtom<Context>

  return [contextAtom, contextAtoms] as const
}

export { machineContextAtom }
