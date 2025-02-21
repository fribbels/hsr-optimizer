export function indent(wgsl: string, levels: number) {
  if (!window.WEBGPU_DEBUG) return wgsl

  const indentSpaces = ' '.repeat(levels * 2)
  return wgsl
    .split('\n')
    .map(line => indentSpaces + line)
    .join('\n')
}

export function wgslTrue(condition: number | boolean) {
  return condition ? 'true' : 'false'
}

export function wgslFalse(condition: number | boolean) {
  return condition ? 'false' : 'true'
}
