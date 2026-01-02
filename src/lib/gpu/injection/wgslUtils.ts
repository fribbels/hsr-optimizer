export function indent(wgsl: string, levels: number) {
  // if (!globalThis.WEBGPU_DEBUG) return wgsl

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
 * Enforces at compile-time that all interpolated values are strings.
 * This catches missing .wgsl(action) calls on buff builders.
 *
 * @example
 * // Compile error - HitBuffBuilder is not a string:
 * wgsl`${buff.hit(StatKey.DMG_BOOST, 0.60).damageType(DamageTag.BASIC)}`
 *
 * // Correct usage:
 * wgsl`${buff.hit(StatKey.DMG_BOOST, 0.60).damageType(DamageTag.BASIC).wgsl(action)}`
 */
export function wgsl(strings: TemplateStringsArray, ...values: string[]): string {
  return String.raw(strings, ...values)
}
