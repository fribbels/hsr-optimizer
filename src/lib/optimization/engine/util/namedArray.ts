export class NamedArray<T> {
  private readonly items: T[] = []
  private readonly nameToIndex = new Map<string, number>()

  constructor(
    items: T[],
    private getKey: (item: T) => string,
  ) {
    items.forEach((item, index) => {
      this.items[index] = item
      this.nameToIndex.set(this.getKey(item), index)
    })
  }

  // Array-like access
  get(index: number): T | undefined {
    return this.items[index]
  }

  // Map-like access
  getByKey(key: string): T | undefined {
    const index = this.nameToIndex.get(key)
    return index !== undefined ? this.items[index] : undefined
  }

  // Get the entity index by name
  getIndex(key: string): number {
    return this.nameToIndex.get(key) ?? -1
  }

  has(key: string): boolean {
    return this.nameToIndex.has(key)
  }

  get length(): number {
    return this.items.length
  }

  get keys(): string[] {
    return Array.from(this.nameToIndex.keys())
  }

  get values(): T[] {
    return [...this.items]
  }

  forEach(callback: (item: T, index: number, key: string) => void): void {
    this.items.forEach((item, index) => {
      callback(item, index, this.getKey(item))
    })
  }

  find(predicate: (item: T, index: number) => boolean): T | undefined {
    return this.items.find(predicate)
  }

  findIndex(predicate: (item: T, index: number) => boolean): number {
    return this.items.findIndex(predicate)
  }

  *[Symbol.iterator](): Iterator<T> {
    yield* this.items
  }
}
