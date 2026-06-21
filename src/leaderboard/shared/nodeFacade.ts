// @ts-nocheck
// Central Node runtime boundary for leaderboard scripts.
//
// Use this file for Node-only APIs such as node:* imports, process/env/argv,
// worker_threads, SQLite, Buffer, and filesystem access. Keep exports typed
// with small platform-neutral interfaces so the normal browser-oriented
// tsconfig can typecheck leaderboard code without exposing Node globals to
// the rest of the app.

import { createHash } from 'node:crypto'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import {
  availableParallelism as nodeAvailableParallelism,
  homedir,
  tmpdir,
} from 'node:os'
import {
  dirname,
  join,
  resolve,
} from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'
import {
  parentPort,
  Worker,
} from 'node:worker_threads'
import {
  gunzipSync,
  gzipSync,
} from 'node:zlib'

export type SqliteValue = string | number | bigint | null | Uint8Array
export type SqliteRow = Record<string, SqliteValue>

export type SqliteRunResult = {
  changes: number | bigint,
  lastInsertRowid: number | bigint,
}

export type SqliteStatement<Row extends SqliteRow = SqliteRow> = {
  get(...params: SqliteValue[]): Row | undefined,
  run(...params: SqliteValue[]): SqliteRunResult,
}

export type SqliteDatabase = {
  exec(sql: string): void,
  prepare<Row extends SqliteRow = SqliteRow>(sql: string): SqliteStatement<Row>,
}

export type NodeWorker = {
  on<T>(event: 'message', listener: (value: T) => void): void,
  on(event: 'error', listener: (error: Error) => void): void,
  on(event: 'exit', listener: (code: number) => void): void,
  postMessage(value: unknown): void,
  terminate(): Promise<number>,
}

export type ParentMessagePort = {
  on<T>(event: 'message', listener: (value: T) => void): void,
  postMessage(value: unknown): void,
}

export function readTextFile(path: string): string {
  return readFileSync(path, 'utf-8')
}

export function readGzipTextFile(path: string): string {
  return gunzipSync(readFileSync(path)).toString('utf-8')
}

export function gunzipBase64Text(value: string): string {
  return gunzipSync(Buffer.from(value, 'base64')).toString('utf-8')
}

export function gzipTextToBase64(value: string): string {
  return gzipSync(Buffer.from(value)).toString('base64')
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf-8').digest('hex')
}

export function commandLineArgs(): string[] {
  return process.argv.slice(2)
}

export function setExitCode(code: number): void {
  process.exitCode = code
}

export function cwd(): string {
  return process.cwd()
}

export function homeDir(): string {
  return homedir()
}

export function tmpDir(): string {
  return tmpdir()
}

export function resolvePath(...paths: string[]): string {
  return resolve(...paths)
}

export function joinPath(...paths: string[]): string {
  return join(...paths)
}

export function dirnamePath(path: string): string {
  return dirname(path)
}

export function ensureDirectory(path: string): void {
  mkdirSync(path, { recursive: true })
}

export function fileExists(path: string): boolean {
  return existsSync(path)
}

export function listDirectoryWithMtime(dir: string): { name: string, mtimeMs: number }[] {
  return readdirSync(dir).map((name) => ({ name, mtimeMs: statSync(join(dir, name)).mtimeMs }))
}

export function writeTextFile(path: string, content: string): void {
  writeFileSync(path, content)
}

export function writeGzipTextFile(path: string, content: string): void {
  writeFileSync(path, gzipSync(Buffer.from(content)))
}

export function deleteFile(path: string): void {
  unlinkSync(path)
}

export function removeDirectory(path: string): void {
  rmSync(path, { recursive: true, force: true })
}

export function listDirectory(dir: string): string[] {
  return readdirSync(dir)
}

export function isDirectory(path: string): boolean {
  return existsSync(path) && statSync(path).isDirectory()
}

export function renameFile(from: string, to: string): void {
  renameSync(from, to)
}

export function copyFile(from: string, to: string): void {
  copyFileSync(from, to)
}

export function openSqliteDatabase(path: string): SqliteDatabase {
  return new DatabaseSync(path)
}

export function availableParallelism(): number {
  return nodeAvailableParallelism()
}

export function createNodeWorker(workerScriptUrl: URL): NodeWorker {
  return new Worker(workerScriptUrl)
}

export function scheduleImmediate(callback: () => void): void {
  setImmediate(callback)
}

export function getParentMessagePort(): ParentMessagePort | null {
  return parentPort
}

export function isMainModule(moduleUrl: string): boolean {
  if (!process.argv[1]) return false
  return resolve(process.argv[1]) === fileURLToPath(moduleUrl)
}
