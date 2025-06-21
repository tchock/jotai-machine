import { createStore } from 'jotai/vanilla'
import { createParallelMachine } from './create-parallel-machine'
import { ALL, createMachine } from './create-machine'

let store: ReturnType<typeof createStore>

const motorMachineAtom = createMachine('stopped', {
  stopped: {
    START: 'running',
  },
  running: {
    STOP: 'stopped',
    REVERSE: 'reversing',
  },
})

const speedMachineAtom = createMachine('off', {
  [ALL]: {
    STOP: 'off',
  },
  off: {
    START: 'idling',
  },
  idling: {
    SPEED_UP: 'slow',
  },
  slow: {
    SPEED_UP: 'fast',
  },
  fast: {
    SLOW_DOWN: 'slow',
    REVERSE: 'slow',
    SPEED_UP: 'ridiculous speed',
    STOP: 'idling',
  },
  'ridiculous speed': {
    SLOW_DOWN: 'fast',
    STOP: 'idling',
  },
})

beforeEach(() => {
  store = createStore()
})

test('Get initial state', () => {
  const carMachineAtom = createParallelMachine({
    speed: speedMachineAtom,
    motor: motorMachineAtom,
  })

  const carState = store.get(carMachineAtom)

  expect(carState).toEqual({
    speed: 'off',
    motor: 'stopped',
  })
})

test('React to events in parallel', () => {
  const carMachineAtom = createParallelMachine({
    speed: speedMachineAtom,
    motor: motorMachineAtom,
  })

  store.set(carMachineAtom, 'START')

  expect(store.get(carMachineAtom)).toEqual({
    speed: 'idling',
    motor: 'running',
  })
})

test('React to events independently', () => {
  const carMachineAtom = createParallelMachine({
    speed: speedMachineAtom,
    motor: motorMachineAtom,
  })

  store.set(carMachineAtom, 'START')
  store.set(carMachineAtom, 'SPEED_UP')
  expect(store.get(carMachineAtom)).toEqual({
    speed: 'slow',
    motor: 'running',
  })

  store.set(carMachineAtom, 'SPEED_UP')
  expect(store.get(carMachineAtom)).toEqual({
    speed: 'fast',
    motor: 'running',
  })

  store.set(carMachineAtom, 'SPEED_UP')
  expect(store.get(carMachineAtom)).toEqual({
    speed: 'ridiculous speed',
    motor: 'running',
  })

  store.set(carMachineAtom, 'SLOW_DOWN')
  expect(store.get(carMachineAtom)).toEqual({
    speed: 'fast',
    motor: 'running',
  })

  store.set(carMachineAtom, 'REVERSE')
  expect(store.get(carMachineAtom)).toEqual({
    speed: 'slow',
    motor: 'reversing',
  })
})

test('Ignore events that are not defined in the current states', () => {
  const carMachineAtom = createParallelMachine({
    speed: speedMachineAtom,
    motor: motorMachineAtom,
  })

  const initialState = store.get(carMachineAtom)
  store.set(carMachineAtom, 'STOP')
  expect(store.get(carMachineAtom)).toBe(initialState)
})

test('Ignore unknown states', () => {
  const carMachineAtom = createParallelMachine({
    speed: speedMachineAtom,
    motor: motorMachineAtom,
  })

  const initialState = store.get(carMachineAtom)
  store.set(carMachineAtom, 'FLY')
  expect(store.get(carMachineAtom)).toBe(initialState)
})

test('Expose child atoms', () => {
  const carMachineAtom = createParallelMachine({
    speed: speedMachineAtom,
    motor: motorMachineAtom,
  })

  expect(carMachineAtom.atoms).toEqual({
    speed: expect.anything(),
    motor: expect.anything(),
  })

  const speedAtom = carMachineAtom.atoms.speed
  const motorAtom = carMachineAtom.atoms.motor

  expect(store.get(speedAtom)).toBe('off')
  expect(store.get(motorAtom)).toBe('stopped')

  // Test that child atoms can be set and affect the parent state
  store.set(speedAtom, 'START')
  expect(store.get(carMachineAtom).speed).toBe('idling')
  expect(store.get(motorAtom)).toBe('running')
})
