/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
export interface Expression<T, K> {
  evaluate(): T
  children: K
}

export abstract class AbstractExpression<T, K> implements Expression<T, K> {
  constructor(public readonly children: K) {
  }

  abstract evaluate(): T
}

export class ConstantExpression<T> extends AbstractExpression<T, T> {
  evaluate(): T {
    return this.children
  }
}


export class IncrementalExpression<T, K> extends AbstractExpression<T, K[]> {
  private partialResults: T[]
  constructor(children: K[], size: number) {
    super(children)
    this.partialResults = new Array<T>(size)
  }

  evaluate(): T {
    throw new Error('Method not implemented.')
  }
}

export type TODO = unknown
