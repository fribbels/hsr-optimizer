/// <reference types="vite/client" />

import { ImportMetaEnv } from 'vite/types/importMeta'

interface ImportMeta {
  readonly env: ImportMetaEnv
}
