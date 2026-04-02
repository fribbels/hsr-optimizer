import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { webgpuNotSupportedNotification } from 'lib/interactions/notifications'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'

// Firefox and some GPUs require storage address space — uniform array<f32> violates the 16-byte stride
// requirement unless the 'uniform_buffer_standard_layout' feature is supported.
export function uniformCompatible(): boolean {
  return navigator.gpu?.wgslLanguageFeatures?.has('uniform_buffer_standard_layout') ?? false
}

export async function getWebgpuDevice(notify?: boolean) {
  try {
    const adapter: GPUAdapter | null = await navigator?.gpu?.requestAdapter()

    if (!adapter) {
      throw new Error('WebGPU adapter not available')
    }

    return await adapter.requestDevice({
      requiredLimits: {},
    })
  } catch (e) {
    if (notify) {
      console.error('Webgpu not supported', e)
      webgpuNotSupportedNotification()
    }
  }
}

export async function verifyWebgpuSupport(warn: boolean) {
  try {
    const device = await getWebgpuDevice(warn)
    if (!device) {
      // GPU unavailable at startup — no chance of recovery, so persist CPU so it survives reloads
      useGlobalStore.getState().setSavedSessionKey(SavedSessionKeys.computeEngine, COMPUTE_ENGINE_CPU)
      SaveState.delayedSave()
    }
    return device
  } catch (e) {
    console.log(e)
    return null
  }
}
