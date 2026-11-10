import {
  readdir,
  writeFile,
} from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { AbilityKind } from '../lib/optimization/rotation/turnAbilityConfig'
import { type CharacterConfig } from '../types/characterConfig'

async function getCharacterFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return getCharacterFiles(path)
    return entry.name.endsWith('.ts') ? [path] : []
  }))
  return files.flat()
}

function isCharacterConfig(value: unknown): value is CharacterConfig {
  return value != null
    && typeof value === 'object'
    && 'id' in value
    && 'scoring' in value
    && 'conditionals' in value
    && 'display' in value
}

async function run() {
  const characterFiles = await getCharacterFiles(join(import.meta.dirname, '../lib/conditionals/character'))
  const characterConfigs: CharacterConfig[] = []
  for (const file of characterFiles) {
    const characterModule = await import(pathToFileURL(file).href) as Record<string, unknown>
    characterConfigs.push(...Object.values(characterModule).filter(isCharacterConfig))
  }

  const hasUnique: string[] = characterConfigs.map((config) => {
    const id = config.id
    const abilities = config.conditionals(0, false).actionDeclaration()
    if (abilities.includes(AbilityKind.UNIQUE)) return id
  }).filter((id) => id !== undefined).map((id) => `'${id}'`)

  const type = `export type UniqueAbilityOwner = 'Default' | ${hasUnique.join(' | ')}`
  await writeFile('src/types/uniqueAbility.ts', type)
}

await run()
