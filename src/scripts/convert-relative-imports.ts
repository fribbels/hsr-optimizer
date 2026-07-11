import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import {
  dirname,
  join,
  relative,
  resolve,
} from 'node:path'

const ROOT = resolve(import.meta.dirname, '../..')

const ALIASES = [
  { prefix: '', dir: resolve(ROOT, 'src') },
]

const SCAN_DIRS = [
  resolve(ROOT, 'src'),
]

function collectFiles(dir, ext, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      if (entry === 'node_modules') continue
      collectFiles(full, ext, results)
    } else if (ext.some((e) => full.endsWith(e))) {
      results.push(full)
    }
  }
  return results
}

function resolveImportPath(importerDir, relPath) {
  const abs = resolve(importerDir, relPath)
  for (const ext of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
    const candidate = abs + ext
    try {
      statSync(candidate)
      return abs
    } catch {}
  }
  return abs
}

function toAliasPath(absPath) {
  for (const alias of ALIASES) {
    if (absPath.startsWith(alias.dir + '/') || absPath.startsWith(alias.dir + '\\')) {
      const rel = relative(alias.dir, absPath).replace(/\\/g, '/')
      return alias.prefix + rel
    }
  }
  return null
}

let totalFiles = 0
let totalReplacements = 0

const files = SCAN_DIRS.flatMap((dir) => collectFiles(dir, ['.ts', '.tsx']))

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  const importerDir = dirname(file)

  const updated = content.replace(
    /(from\s+['"])(\.\.?\/[^'"]*?)(['"])/g,
    (match, before, relPath, after) => {
      const abs = resolveImportPath(importerDir, relPath)
      const alias = toAliasPath(abs)
      if (alias && alias !== relPath) {
        totalReplacements++
        return before + alias + after
      }
      return match
    },
  )

  if (updated !== content) {
    totalFiles++
    writeFileSync(file, updated)
    const relFile = relative(ROOT, file).replace(/\\/g, '/')
    console.log(`  ${relFile}`)
  }
}

console.log(`\nConverted ${totalReplacements} imports across ${totalFiles} files`)
