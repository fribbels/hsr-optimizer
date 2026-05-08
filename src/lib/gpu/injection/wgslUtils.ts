export function indent(wgsl: string, levels: number) {
  if (!globalThis.WEBGPU_DEBUG) return wgsl

  const indentSpaces = ' '.repeat(levels * 2)
  return wgsl
    .split('\n')
    .map((line) => indentSpaces + line)
    .join('\n')
}

export function wgslTrue(condition: number | boolean) {
  return condition ? 'true' : 'false'
}

export function wgslFalse(condition: number | boolean) {
  return condition ? 'false' : 'true'
}

/**
 * Tagged template for WGSL code generation.
 * Accepts strings and numbers as interpolated values.
 * Numbers are always emitted as abstract-float literals (appending .0 to whole numbers)
 * so that WGSL never infers i32 from a JS integer, preventing f32*i32 type errors.
 */
export function wgsl(strings: TemplateStringsArray, ...values: (string | number)[]): string {
  return String.raw(strings, ...values.map((v) => {
    if (typeof v !== 'number') return v
    return Number.isInteger(v) ? `${v}.0` : String(v)
  }))
}
