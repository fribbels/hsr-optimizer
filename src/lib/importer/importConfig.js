import { KelzFormatParser } from 'lib/importer/kelzFormatParser.jsx'

export const KelzScannerConfig = {
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

export const ReliquaryArchiverConfig = {
  name: 'Reliquary Archiver',
  author: 'IceDynamix',
  homepage: 'https://github.com/IceDynamix/reliquary-archiver',
  releases: 'https://github.com/IceDynamix/reliquary-archiver/releases/latest',
  defaultFileName: 'archiver_output.json',
  sourceString: 'reliquary_archiver',
  latestBuildVersion: 'v0.1.8',
  latestOutputVersion: 3,
  speedVerified: true,
}

export const YasScannerConfig = {
  name: 'Yas Scanner',
  author: 'wormtql, YCR160',
  homepage: 'https://github.com/wormtql/yas',
  releases: '', // not released yet
  defaultFileName: 'hsr.json',
  sourceString: 'yas-scanner',
  latestBuildVersion: 'v0.0.0',
  latestOutputVersion: 3,
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
