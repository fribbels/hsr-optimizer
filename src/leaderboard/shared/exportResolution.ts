import {
  fileExists,
  joinPath,
  readTextFile,
  resolvePath,
} from 'leaderboard/shared/nodeFacade'

export type LeaderboardExportInput = {
  displayPath: string,
  paths: string[],
}

export function findLatestServerExport(): LeaderboardExportInput {
  const dir = resolvePath('exports')
  const manifestPath = joinPath(dir, 'latest-export.json')

  if (!fileExists(manifestPath)) {
    throw new Error(`No export manifest found at ${manifestPath}. Run the download script first.`)
  }

  const manifest = JSON.parse(readTextFile(manifestPath)) as { exportId: string, exportTime: string, files: string[] }
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    throw new Error(`Export manifest at ${manifestPath} has no data files`)
  }

  console.log(`Export manifest: ${manifest.files.length} files, exportTime: ${manifest.exportTime}, exportId: ${manifest.exportId}`)

  return {
    displayPath: dir,
    paths: manifest.files.map((f) => joinPath(dir, f)),
  }
}
