export class StatArrayUtils {
  static createFloat32Array(size: number, fillValue?: number): Float32Array
  static copyFloat32Array(source: Float32Array): Float32Array
  static areEqual(arr1: Float32Array, arr2: Float32Array, tolerance?: number): boolean
  static sum(arr: Float32Array): number
  static max(arr: Float32Array): number
  static min(arr: Float32Array): number
  static normalize(arr: Float32Array): Float32Array
  static dot(arr1: Float32Array, arr2: Float32Array): number
  static distance(arr1: Float32Array, arr2: Float32Array): number
  static lerp(arr1: Float32Array, arr2: Float32Array, t: number): Float32Array
  static clamp(arr: Float32Array, min: Float32Array, max: Float32Array): Float32Array
  static toString(arr: Float32Array, precision?: number): string
  static fromArray(arr: number[]): Float32Array
  static toArray(arr: Float32Array): number[]
}
