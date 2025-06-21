import { createStore } from 'jotai/vanilla'
import { ALL, createMachine } from './create-machine'

let store: ReturnType<typeof createStore>

const createSpeedMachine = () =>
  createMachine('idling', {
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
  })

beforeEach(() => {
  store = createStore()
})

test('Get initial state', () => {
  const speedMachineAtom = createSpeedMachine()

  const speedState = store.get(speedMachineAtom)

  expect(speedState).toBe('idling')
})

test('Go through known states and matching events', () => {
  const speedMachineAtom = createSpeedMachine()

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
  const speedMachineAtom = createSpeedMachine()

  const initialState = store.get(speedMachineAtom)
  store.set(speedMachineAtom, 'SLOW_DOWN')
  expect(store.get(speedMachineAtom)).toBe(initialState)
})

test('Ignore unknown states', () => {
  const speedMachineAtom = createSpeedMachine()

  const initialState = store.get(speedMachineAtom)
  store.set(speedMachineAtom, 'START')
  expect(store.get(speedMachineAtom)).toBe(initialState)
})

test('React to ALL event', () => {
  const speedMachineAtom = createSpeedMachine()

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
