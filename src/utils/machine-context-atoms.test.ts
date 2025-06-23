import { atom, createStore } from 'jotai/vanilla'
import { machineContextAtom } from './machine-context-atom'

let store

beforeEach(() => {
  store = createStore()
})

test('Create context atom without actor context', () => {
  const [contextAtom] = machineContextAtom(() => ({
    userName: atom(''),
    userEmail: atom(''),
  }))

  expect(store.get(contextAtom)).toEqual({ userName: '', userEmail: '' })
})

test('Update context', () => {
  const [contextAtom] = machineContextAtom(() => ({
    userName: atom(''),
    userEmail: atom(''),
  }))

  expect(store.get(contextAtom)).toEqual({ userName: '', userEmail: '' })

  store.set(contextAtom, {
    userName: 'Alice',
    userEmail: 'alice@wonderland.com',
  })

  expect(store.get(contextAtom)).toEqual({
    userName: 'Alice',
    userEmail: 'alice@wonderland.com',
  })
})

test('Update context partially', () => {
  const [contextAtom] = machineContextAtom(() => ({
    userName: atom(''),
    userEmail: atom(''),
  }))

  expect(store.get(contextAtom)).toEqual({ userName: '', userEmail: '' })

  store.set(contextAtom, {
    userName: 'Alice',
  })

  expect(store.get(contextAtom)).toEqual({
    userName: 'Alice',
    userEmail: '',
  })
})

test('Update context with unknown properties should ignore those properties', () => {
  const [contextAtom] = machineContextAtom(() => ({
    userName: atom(''),
    userEmail: atom(''),
  }))

  expect(store.get(contextAtom)).toEqual({ userName: '', userEmail: '' })

  store.set(contextAtom, {
    userName: 'Alice',
    address: 'Wonderland 123',
  })

  expect(store.get(contextAtom)).toEqual({
    userName: 'Alice',
    userEmail: '',
  })
})

test('Create empty context when no contextCreator is provided', () => {
  const [contextAtom] = machineContextAtom()

  expect(store.get(contextAtom)).toEqual({})
})

test('Override contextCreator context with actor context', () => {
  const [contextAtom] = machineContextAtom(
    () => ({
      userName: atom(''),
      userEmail: atom(''),
    }),
    {
      userName: atom('John Doe'),
      userEmail: atom('john@doe.com'),
    }
  )

  expect(store.get(contextAtom)).toEqual({
    userName: 'John Doe',
    userEmail: 'john@doe.com',
  })
})

test('Ignore overwritten actor context properties that are not included in contextCreator output', () => {
  const [contextAtom] = machineContextAtom(
    () => ({
      userName: atom(''),
      userEmail: atom(''),
    }),
    {
      userName: atom('John Doe'),
      // @ts-expect-error Test unknown property
      userAddress: atom('John Street 123'),
    }
  )

  expect(store.get(contextAtom)).toEqual({
    userName: 'John Doe',
    userEmail: '',
  })
})

test('Expose context atoms', () => {
  const [, contextAtoms] = machineContextAtom(() => ({
    userName: atom('Hans'),
    userEmail: atom('hans@wurst.com'),
  }))

  expect(contextAtoms).toEqual({
    userName: expect.anything(),
    userEmail: expect.anything(),
  })

  expect(store.get(contextAtoms.userName)).toBe('Hans')
  expect(store.get(contextAtoms.userEmail)).toBe('hans@wurst.com')
})

test('Updating exposed context atoms should update contextAtom', () => {
  const [contextAtom, contextAtoms] = machineContextAtom(() => ({
    userName: atom('Hans'),
    userEmail: atom('hans@wurst.com'),
  }))

  expect(store.get(contextAtom)).toEqual({
    userName: 'Hans',
    userEmail: 'hans@wurst.com',
  })

  expect(store.get(contextAtoms.userName)).toBe('Hans')
  expect(store.get(contextAtoms.userEmail)).toBe('hans@wurst.com')

  store.set(contextAtoms.userName, 'Alice')
  store.set(contextAtoms.userEmail, 'alice@wonderland.com')

  expect(store.get(contextAtoms.userName)).toBe('Alice')
  expect(store.get(contextAtoms.userEmail)).toBe('alice@wonderland.com')
  expect(store.get(contextAtom)).toEqual({
    userName: 'Alice',
    userEmail: 'alice@wonderland.com',
  })
})
