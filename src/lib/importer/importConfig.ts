import { KelzFormatParser } from 'lib/importer/kelzFormatParser'

export type ScannerConfig = {
  name: string,
  author: string,
  homepage: string,
  releases: string,
  defaultFileName: string,
  sourceString: string,
  latestBuildVersion: string,
  latestOutputVersion: number,
  speedVerified: boolean,
}

export const KelzScannerConfig: ScannerConfig = {
  name: 'HSR-Scanner',
  author: 'Kel-z',
  homepage: 'https://github.com/kel-z/HSR-Scanner',
  releases: 'https://github.com/kel-z/HSR-Scanner/releases/latest',
  defaultFileName: 'HSRScanData.json',
  sourceString: 'HSR-Scanner',
  latestBuildVersion: 'v1.2.0',
  latestOutputVersion: 4,
  speedVerified: false,
}

export const ReliquaryArchiverConfig: ScannerConfig = {
  name: 'Reliquary Archiver',
  author: 'IceDynamix',
  homepage: 'https://github.com/IceDynamix/reliquary-archiver',
  releases: 'https://github.com/IceDynamix/reliquary-archiver/releases/latest',
  defaultFileName: 'archiver_output.json',
  sourceString: 'reliquary_archiver',
  latestBuildVersion: 'v0.8.0',
  latestOutputVersion: 4,
  speedVerified: true,
}

export const YasScannerConfig: ScannerConfig = {
  name: 'Yas Scanner',
  author: 'wormtql, YCR160',
  homepage: 'https://github.com/wormtql/yas',
  releases: '', // not released yet
  defaultFileName: 'hsr.json',
  sourceString: 'yas-scanner',
  latestBuildVersion: 'v0.0.0',
  latestOutputVersion: 3,
  speedVerified: false,
}

export const KelzScannerParser = new KelzFormatParser(KelzScannerConfig)
export const ReliquaryArchiverParser = new KelzFormatParser(ReliquaryArchiverConfig)
export const YasScannerParser = new KelzFormatParser(YasScannerConfig)

export const ScannerSourceToParser = {
  [KelzScannerConfig.sourceString]: KelzScannerParser,
  [ReliquaryArchiverConfig.sourceString]: ReliquaryArchiverParser,
  [YasScannerConfig.sourceString]: YasScannerParser,
}

export const ValidScannerSources = Object.keys(ScannerSourceToParser)
