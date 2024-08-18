export function indent(wgsl: string, indents: number) {
  const indentSpaces = ' '.repeat(indents)
  return wgsl
    .split('\n')
    .map(line => indentSpaces + line)
    .join('\n');
}