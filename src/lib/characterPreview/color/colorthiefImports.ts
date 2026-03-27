// ---------------------------------------------------------------------------
// Selective colorthief imports
//
// The colorthief/internals barrel re-exports WasmQuantizer which contains a
// dynamic import to a wasm file that doesn't ship with the package, breaking
// Vite's import analysis. We use Vite aliases (see vite.config.ts) to import
// directly from colorthief source files, avoiding WasmQuantizer entirely.
// ---------------------------------------------------------------------------

// @ts-expect-error -- Vite alias; see vite.config.ts
export { extractPalette, validateOptions } from 'colorthief-pipeline'
// @ts-expect-error -- Vite alias; see vite.config.ts
export { classifySwatches } from 'colorthief-swatches'
// @ts-expect-error -- Vite alias; see vite.config.ts
export { MmcqQuantizer } from 'colorthief-mmcq'
