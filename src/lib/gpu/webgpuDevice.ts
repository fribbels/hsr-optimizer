export async function getWebgpuDevice() {
  const adapter: GPUAdapter | null = await navigator?.gpu?.requestAdapter()

  if (adapter == null) {
    return null
  }
  return await adapter.requestDevice({
    requiredLimits: {
      // Investigate limits for high-end experimental channel
      // maxComputeInvocationsPerWorkgroup: 512,
      // maxComputeWorkgroupSizeX: 512,
      // maxStorageBufferBindingSize: 268435456,
    },
  })
}
