export type NumberToNumberMap = Record<number, number>

export type StringToNumberMap = Record<string, number>

export type Nullable<T> = T | null | undefined

export type Prettify<T> =
  & {
    [K in keyof T]: T[K]
  }
  & {}
