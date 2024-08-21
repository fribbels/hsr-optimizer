export function indent(wgsl: string, levels: number) {
  const indentSpaces = ' '.repeat(levels * 2)
  return wgsl
    .split('\n')
    .map(line => indentSpaces + line)
    .join('\n');
}

export function wgslIsTrue(condition: number | boolean) {
  return condition ? 'true' : 'false'
}

export function wgslIsFalse(condition: number | boolean) {
  return condition ? 'false' : 'true'
}