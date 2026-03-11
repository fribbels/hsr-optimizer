import type { UseFormReturnType } from '@mantine/form'
import { ShowcaseTabForm } from 'lib/tabs/tabShowcase/showcaseTabController'

type Jipt = {
  start(): void,
  stop(): void,
}

type SaveFilePickerOptions = {
  excludeAcceptAllOption?: boolean,
  id?: string,
  // A FileSystemHandle or a well known directory ("desktop", "documents", "downloads", "music", "pictures", or "videos") to open the dialog in.
  startIn?: FileSystemHandle | string,
  suggestedName?: string,
  types?: {
    description?: string,
    // An Object with the keys set to the MIME type and the values an Array of file extensions
    accept?: Record<string, string[]>,
  }[],
}

declare global {
  interface Window {
    // Crowdin in-context translation tool (added by CI)
    jipt?: Jipt

    // Mantine form instance for showcase tab (to be migrated)
    showcaseTabForm: UseFormReturnType<ShowcaseTabForm>

    // File System API
    showSaveFilePicker: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>

    // i18n YAML parser
    yaml: unknown

    // Debug console access — consolidated from individual window.X exports
    __HSR_DEBUG: Record<string, unknown>

    title: string
    WEBGPU_DEBUG: boolean
  }

  var WEBGPU_DEBUG: boolean
  var SEQUENTIAL_BENCHMARKS: boolean
}
