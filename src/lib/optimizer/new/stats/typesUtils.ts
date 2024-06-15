// These types are only used locally for some simple types, dont need to bring
// some utility types dependency into the project. This is optimized to work
// only with types in this folder. DO NOT USE IT ANYWHERE ELSE.
export type __DeepPartial<T> = T extends (infer K)[] ? K[] : {
  [P in keyof T]?: __DeepPartial<T[P]>
}
export type __DeepReadonly<T> = T extends (infer K)[] ? ReadonlyArray<__DeepReadonly<K>> : {
  readonly [P in keyof T]: __DeepReadonly<T[P]>
}
