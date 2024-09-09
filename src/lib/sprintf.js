String.prototype.format = String.prototype.f = function () {
  let s = this, // eslint-disable-line @typescript-eslint/no-this-alias
    i = arguments.length

  while (i--) {
    s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i])
  }
  return s
}
