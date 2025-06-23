export const pick = <T extends object, K extends keyof T>(
  obj: T | undefined,
  keys: K[]
): Pick<T, K> => {
  if (!obj || Object.keys(obj).length === 0) {
    return {} as Pick<T, K>
  }
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}
