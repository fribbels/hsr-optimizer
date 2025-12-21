export function genericBuilder<T>(defaults?: Partial<T>): BuilderFor<T> {
  const obj = { ...defaults } as any

  const proxy = new Proxy(obj, {
    get(target, prop) {
      if (prop === 'build') {
        return () => target
      }
      return (value: any) => {
        target[prop] = value
        return proxy
      }
    },
  }) as BuilderFor<T>

  return proxy
}

type BuilderFor<T> =
  & {
    [K in keyof T]-?: (value: T[K]) => BuilderFor<T> // -? removes optionality
  }
  & { build: () => T }
