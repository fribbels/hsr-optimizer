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

export function wgslFloat(v: number): string {
  return Number.isInteger(v) ? `${v}.0` : String(v)
}

/**
 * Tagged template for WGSL code generation.
 * Accepts strings and numbers as interpolated values.
 * Whole-number JS values are emitted with .0 suffix so WGSL sees abstract-float, not abstract-int.
 */
export function wgsl(strings: TemplateStringsArray, ...values: (string | number)[]): string {
  return String.raw(strings, ...values.map((v) =>
    typeof v === 'number' && Number.isInteger(v) ? `${v}.0` : String(v),
  ))
}
