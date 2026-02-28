import { GpuExecutionContext } from 'lib/gpu/webgpuTypes'

export class GpuProfiler {
  private iterations: { phases: Map<string, number>, total: number }[] = []
  private iterStart = 0
  private phaseStart = 0
  private phases = new Map<string, number>()

  start() {
    this.iterStart = performance.now()
    this.phaseStart = this.iterStart
    this.phases = new Map()
  }

  mark(phase: string) {
    const now = performance.now()
    this.phases.set(phase, now - this.phaseStart)
    this.phaseStart = now
  }

  end(lastPhase?: string) {
    if (lastPhase) this.mark(lastPhase)
    this.iterations.push({ phases: this.phases, total: performance.now() - this.iterStart })
  }

  summary(gpuContext: GpuExecutionContext) {
    const n = this.iterations.length
    if (n === 0) return

    const permStride = gpuContext.BLOCK_SIZE * gpuContext.CYCLES_PER_INVOCATION
    const phaseNames = [...new Set(this.iterations.flatMap((i) => [...i.phases.keys()]))]

    const stats = (vals: number[]) => {
      const total = vals.reduce((a, b) => a + b, 0)
      return { total, avg: total / vals.length, min: Math.min(...vals), max: Math.max(...vals) }
    }

    const grandTotal = stats(this.iterations.map((i) => i.total)).total
    const fmt = (v: number) => v.toFixed(2).padStart(10) + 'ms'
    const pct = (v: number) => ((v / grandTotal) * 100).toFixed(1).padStart(5) + '%'
    const num = (v: number) => Math.round(v).toLocaleString()

    const pad = Math.max(...phaseNames.map((p) => p.length), 5)
    const sep = '  |  '
    const row = (label: string, s: ReturnType<typeof stats>, showPct = true) =>
      `${label.padEnd(pad)}${sep}total: ${fmt(s.total)}${sep}avg: ${fmt(s.avg)}${sep}min: ${fmt(s.min)}${sep}max: ${fmt(s.max)}${
        showPct ? sep + 'pct: ' + pct(s.total) : ''
      }`

    const permsPerSec = gpuContext.permutations / (grandTotal / 1000)
    const l = gpuContext.device.limits

    const lines = [
      `[GpuProfiler] ${n} iterations  |  ${grandTotal.toFixed(2)}ms total`,
      `[GpuProfiler] ${num(gpuContext.permutations)} permutations  |  ${num(permStride)}/iteration  |  ${num(permsPerSec)}/sec`,
    ]

    lines.push('')
    for (const phase of phaseNames) {
      lines.push(row(phase, stats(this.iterations.map((i) => i.phases.get(phase) ?? 0))))
    }
    lines.push('')
    lines.push(row('TOTAL', stats(this.iterations.map((i) => i.total)), false))

    lines.push('')
    lines.push(`[GpuProfiler] Device limits: ${JSON.stringify({
      maxComputeInvocationsPerWorkgroup: l.maxComputeInvocationsPerWorkgroup,
      maxComputeWorkgroupSizeX: l.maxComputeWorkgroupSizeX,
      maxComputeWorkgroupsPerDimension: l.maxComputeWorkgroupsPerDimension,
      maxStorageBufferBindingSize: l.maxStorageBufferBindingSize,
      maxBufferSize: l.maxBufferSize,
      maxUniformBufferBindingSize: l.maxUniformBufferBindingSize,
      maxStorageBuffersPerShaderStage: l.maxStorageBuffersPerShaderStage,
      maxComputeWorkgroupStorageSize: l.maxComputeWorkgroupStorageSize,
      maxBindGroups: l.maxBindGroups,
    }, null, 2)}`)
    lines.push(`[GpuProfiler] Pipeline config: ${JSON.stringify({
      WORKGROUP_SIZE: gpuContext.WORKGROUP_SIZE,
      NUM_WORKGROUPS: gpuContext.NUM_WORKGROUPS,
      BLOCK_SIZE: gpuContext.BLOCK_SIZE,
      CYCLES_PER_INVOCATION: gpuContext.CYCLES_PER_INVOCATION,
      permsPerDispatch: permStride,
    }, null, 2)}`)

    const output = lines.join('\n')
    console.log(output)
  }
}
