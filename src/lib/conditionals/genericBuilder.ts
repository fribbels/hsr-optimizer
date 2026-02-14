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

export function schemaBuilder<TFull, TDefaults, TRequired>(schema: {
  defaults: TDefaults
  required: ReadonlyArray<keyof TRequired>
}) {
  return () => {
    const obj = { ...schema.defaults } as any
    const requiredSet = new Set(schema.required)
    const setFields = new Set<string>()

    const proxy = new Proxy(obj, {
      get(target, prop) {
        if (prop === 'build') {
          return () => {
            const missing = [...requiredSet].filter(k => !setFields.has(k as string))
            if (missing.length > 0) {
              throw new Error(`Missing required fields: ${missing.join(', ')}`)
            }
            return target
          }
        }
        return (value: any) => {
          target[prop] = value
          setFields.add(prop as string)
          return proxy
        }
      },
    })

    return proxy as BuilderFor<TFull>
  }
}
