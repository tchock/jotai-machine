import type { WritableAtom } from 'jotai/vanilla'

type ContextData<T = unknown> = Record<string, T> | undefined

type ContextAtoms<C extends ContextData> = {
  [K in keyof C]: WritableAtom<C[K], [C[K]], void>
}

type ContextAtomsCreator<C extends ContextData> = () => ContextAtoms<C>

type ContextAtom<C extends ContextData> = WritableAtom<C, [Partial<C>], void>

export type { ContextData, ContextAtoms, ContextAtomsCreator, ContextAtom }
