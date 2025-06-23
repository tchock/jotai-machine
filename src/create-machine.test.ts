import { atom, createStore } from 'jotai/vanilla'
import { ALL, createMachine } from './create-machine'

let store: ReturnType<typeof createStore>

const machineDescription = {
  [ALL]: {
    RESET: 'idling',
  },
  idling: {
    SPEED_UP: 'slow',
  },
  slow: {
    SPEED_UP: 'fast',
    SLOW_DOWN: 'idling',
  },
  fast: {
    SLOW_DOWN: 'slow',
    SPEED_UP: 'ridiculous speed',
  },
  'ridiculous speed': {
    SLOW_DOWN: 'fast',
  },
}

const speedMachine = createMachine('idling', machineDescription, {
  context: () => ({
    fastSpeed: atom(100),
    slowSpeed: atom(50),
  }),
})

beforeEach(() => {
  store = createStore()
})

test('Get initial state', () => {
  const speedMachineAtom = speedMachine()

  const speedState = store.get(speedMachineAtom)

  expect(speedState).toBe('idling')
})

test('Go through known states and matching events', () => {
  const speedMachineAtom = speedMachine()

  store.set(speedMachineAtom, 'SPEED_UP')
  expect(store.get(speedMachineAtom)).toBe('slow')

  store.set(speedMachineAtom, 'SPEED_UP')
  expect(store.get(speedMachineAtom)).toBe('fast')

  store.set(speedMachineAtom, 'SPEED_UP')
  expect(store.get(speedMachineAtom)).toBe('ridiculous speed')

  store.set(speedMachineAtom, 'SLOW_DOWN')
  expect(store.get(speedMachineAtom)).toBe('fast')

  store.set(speedMachineAtom, 'SLOW_DOWN')
  expect(store.get(speedMachineAtom)).toBe('slow')

  store.set(speedMachineAtom, 'SLOW_DOWN')
  expect(store.get(speedMachineAtom)).toBe('idling')
})

test('Ignore events that are not defined in the current states', () => {
  const speedMachineAtom = speedMachine()

  const initialState = store.get(speedMachineAtom)
  store.set(speedMachineAtom, 'SLOW_DOWN')
  expect(store.get(speedMachineAtom)).toBe(initialState)
})

test('Ignore unknown states', () => {
  const speedMachineAtom = speedMachine()

  const initialState = store.get(speedMachineAtom)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store.set(speedMachineAtom, 'START' as any)
  expect(store.get(speedMachineAtom)).toBe(initialState)
})

test('React to ALL event', () => {
  const speedMachineAtom = speedMachine()

  store.set(speedMachineAtom, 'SPEED_UP')
  expect(store.get(speedMachineAtom)).toBe('slow')

  store.set(speedMachineAtom, 'RESET')
  expect(store.get(speedMachineAtom)).toBe('idling')

  store.set(speedMachineAtom, 'SPEED_UP')
  store.set(speedMachineAtom, 'SPEED_UP')
  expect(store.get(speedMachineAtom)).toBe('fast')
  store.set(speedMachineAtom, 'RESET')
  expect(store.get(speedMachineAtom)).toBe('idling')

  store.set(speedMachineAtom, 'SPEED_UP')
  store.set(speedMachineAtom, 'SPEED_UP')
  store.set(speedMachineAtom, 'SPEED_UP')
  expect(store.get(speedMachineAtom)).toBe('ridiculous speed')
  store.set(speedMachineAtom, 'RESET')
  expect(store.get(speedMachineAtom)).toBe('idling')
})

test('Expose context', () => {
  const speedMachineAtom = speedMachine()

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 100,
    slowSpeed: 50,
  })

  store.set(speedMachineAtom.contextAtom, {
    slowSpeed: 30,
  })

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 100,
    slowSpeed: 30,
  })
})

test('Set context partially', () => {
  const speedMachineAtom = speedMachine()

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 100,
    slowSpeed: 50,
  })

  store.set(speedMachineAtom.contextAtom, {
    slowSpeed: 30,
  })

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 100,
    slowSpeed: 30,
  })
})

test('Override context in actor options', () => {
  const fastSpeedAtom = atom(200)
  const slowSpeedAtom = atom(100)
  const speedMachineAtom = speedMachine({
    context: {
      fastSpeed: fastSpeedAtom,
      slowSpeed: slowSpeedAtom,
    },
  })

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 200,
    slowSpeed: 100,
  })
  expect(store.get(fastSpeedAtom)).toBe(200)
  expect(store.get(slowSpeedAtom)).toBe(100)

  store.set(speedMachineAtom.contextAtom, {
    slowSpeed: 80,
  })

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 200,
    slowSpeed: 80,
  })
  expect(store.get(fastSpeedAtom)).toBe(200)
  expect(store.get(slowSpeedAtom)).toBe(80)

  store.set(fastSpeedAtom, 300)
  store.set(slowSpeedAtom, 150)
  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 300,
    slowSpeed: 150,
  })
})

test('Override context partially in actor options', () => {
  const fastSpeedAtom = atom(200)
  const speedMachineAtom = speedMachine({
    context: {
      fastSpeed: fastSpeedAtom,
    },
  })

  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 200,
    slowSpeed: 50,
  })

  store.set(speedMachineAtom.contextAtom, {
    fastSpeed: 500,
    slowSpeed: 80,
  })
  expect(store.get(speedMachineAtom.contextAtom)).toEqual({
    fastSpeed: 500,
    slowSpeed: 80,
  })
  expect(store.get(fastSpeedAtom)).toBe(500)
})
