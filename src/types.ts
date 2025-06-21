import type { Atom } from "jotai/vanilla";

type TransitionsObj<T extends string | symbol | boolean, E extends string | symbol> = {
  [state in T as string | symbol]: {
    [event in E]?: T | ((get: (atom: (atom: Atom<T>) => T) => T) => T);
  };
}

type Transitions<T extends string | symbol | boolean, E extends string | symbol> = TransitionsObj<T,E>;

export type {
  Transitions,
  TransitionsObj
}
