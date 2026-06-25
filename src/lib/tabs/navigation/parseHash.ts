export function parseHash(input = window.location.hash) {
  const [hash, query] = input.split('?')
  return { hash, params: new URLSearchParams(query) }
}
