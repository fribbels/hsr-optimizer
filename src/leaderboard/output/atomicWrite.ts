import {
  copyFile,
  deleteFile,
  dirnamePath,
  ensureDirectory,
  joinPath,
  renameFile,
  writeTextFile,
} from 'leaderboard/shared/nodeFacade'

export function atomicWriteJsonFile(path: string, content: string): void {
  const dir = dirnamePath(path)
  ensureDirectory(dir)

  const tmpPath = joinPath(dir, `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`)
  writeTextFile(tmpPath, content)
  try {
    renameFile(tmpPath, path)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'EPERM') {
      copyFile(tmpPath, path)
      deleteFile(tmpPath)
    } else {
      throw err
    }
  }
}
