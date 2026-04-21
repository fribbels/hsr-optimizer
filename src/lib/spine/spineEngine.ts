import {
  AnimationState,
  AnimationStateData,
  AssetManager,
  AtlasAttachmentLoader,
  ManagedWebGLRenderingContext,
  SceneRenderer,
  Skeleton,
  SkeletonBinary,
  Vector2,
} from '@esotericsoftware/spine-webgl'

export interface SpineInstance {
  dispose(): void
  /** Stop the rAF loop. No-op if already paused or disposed. */
  pause(): void
  /** Restart the rAF loop. No-op if already running or disposed. */
  resume(): void
}

interface SkeletonEntry {
  skeleton: Skeleton
  animState: AnimationState
}

// WebGL blend factor constants (WebGLRenderingContext enum values)
const GL_ONE = 1
const GL_ONE_MINUS_SRC_COLOR = 0x0301
const GL_ONE_MINUS_SRC_ALPHA = 0x0303

/**
 * Override spine-webgl's blend modes so Multiply/Screen compositing works on a
 * transparent canvas. The patched blendFuncSeparate values match PixiJS's blend
 * table:
 *
 *   Normal:   (SRC_ALPHA, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA)
 *   Additive: (SRC_ALPHA, ONE,                 ONE, ONE_MINUS_SRC_ALPHA)
 *   Multiply: (DST_COLOR, ONE_MINUS_SRC_ALPHA, ONE, ONE_MINUS_SRC_ALPHA)
 *   Screen:   (ONE,       ONE_MINUS_SRC_COLOR, ONE, ONE_MINUS_SRC_ALPHA)
 *
 * Alpha channel always uses Porter-Duff "over" (srcA=ONE, dstA=ONE_MINUS_SRC_ALPHA)
 * so shadow/shading overlays never destroy framebuffer alpha. Screen's color
 * equation uses dst×(1-src.rgb) (true Photoshop Screen) instead of dst×(1-src.a).
 *
 * Screen is detected by srcAlpha===ONE_MINUS_SRC_COLOR, which is unique to Screen
 * in spine-webgl's WebGLBlendModeConverter. Coupled to spine-webgl 4.1.x — if
 * upgrading, verify PolygonBatcher still calls blendFuncSeparate for all modes.
 *
 * Lost on WebGL context restore (silent degradation). Would need full re-creation.
 */
function patchBlendModes(gl: WebGLRenderingContext): void {
  const orig = gl.blendFuncSeparate.bind(gl)
  gl.blendFuncSeparate = (srcRGB: number, dstRGB: number, srcAlpha: number, _dstAlpha: number) => {
    if (srcAlpha === GL_ONE_MINUS_SRC_COLOR) {
      // Screen: fix dstRGB to ONE_MINUS_SRC_COLOR for correct Screen formula
      orig(srcRGB, GL_ONE_MINUS_SRC_COLOR, GL_ONE, GL_ONE_MINUS_SRC_ALPHA)
    } else {
      // Normal / Additive / Multiply: color unchanged, alpha fixed to Porter-Duff
      orig(srcRGB, dstRGB, GL_ONE, GL_ONE_MINUS_SRC_ALPHA)
    }
  }
}

export async function createSpineInstance(
  canvas: HTMLCanvasElement,
  baseUrl: string,
  files: { skelFile: string, atlasFile: string }[],
  signal?: AbortSignal,
): Promise<SpineInstance> {
  // Fast-path if already aborted before we did any work.
  if (signal?.aborted) {
    throw new DOMException('Spine load aborted', 'AbortError')
  }

  // --- WebGL context ---

  // premultipliedAlpha:true because blending naturally produces premultiplied
  // output on a cleared framebuffer — tells browser not to multiply again.
  // drawSkeleton uses PMA=false because atlas textures are straight (un-premultiplied).
  // antialias/preserveDrawingBuffer off: we redraw every frame (nothing to
  // preserve) and spine edges are alpha-blended bitmaps (MSAA is moot).
  const glContext = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false })
    || canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: false })
  if (!glContext) throw new Error('WebGL not available')
  const gl = glContext

  patchBlendModes(gl)

  // --- Asset loading ---

  const context = new ManagedWebGLRenderingContext(gl)
  const assetManager = new AssetManager(context, baseUrl)

  for (const { skelFile, atlasFile } of files) {
    assetManager.loadBinary(skelFile)
    assetManager.loadTextureAtlas(atlasFile)
  }

  try {
    await new Promise<void>((resolve, reject) => {
      function check() {
        // Bail out each rAF tick if the caller aborted — skips all downstream
        // skeleton parsing, shader compilation, and rAF bootstrap for doomed
        // loads during rapid character switching.
        if (signal?.aborted) {
          reject(new DOMException('Spine load aborted', 'AbortError'))
          return
        }
        if (assetManager.isLoadingComplete()) {
          if (assetManager.hasErrors()) {
            reject(new Error(JSON.stringify(assetManager.getErrors())))
          } else {
            resolve()
          }
        } else {
          requestAnimationFrame(check)
        }
      }
      check()
    })
  } catch (err) {
    assetManager.dispose()
    throw err
  }

  // --- Bounds calculation (scale=1) ---

  const canvasSize = canvas.width

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const { skelFile, atlasFile } of files) {
    const atlas = assetManager.require(atlasFile)
    const atlasLoader = new AtlasAttachmentLoader(atlas)
    const binary = new SkeletonBinary(atlasLoader)
    binary.scale = 1

    const skelData = binary.readSkeletonData(assetManager.require(skelFile))
    const skeleton = new Skeleton(skelData)
    skeleton.setToSetupPose()
    skeleton.updateWorldTransform()

    const offset = new Vector2()
    const size = new Vector2()
    skeleton.getBounds(offset, size, [])

    minX = Math.min(minX, offset.x)
    minY = Math.min(minY, offset.y)
    maxX = Math.max(maxX, offset.x + size.x)
    maxY = Math.max(maxY, offset.y + size.y)
  }

  const boundsW = maxX - minX
  const boundsH = maxY - minY
  const nativeCx = minX + boundsW / 2
  const nativeCy = minY + boundsH / 2
  const fitScale = canvasSize / Math.max(boundsW, boundsH)

  const camX = Math.round(nativeCx * fitScale)
  const camY = Math.round(nativeCy * fitScale)

  // --- Skeleton setup (fitted scale) ---

  const entries: SkeletonEntry[] = []

  for (const { skelFile, atlasFile } of files) {
    const atlas = assetManager.require(atlasFile)
    const atlasLoader = new AtlasAttachmentLoader(atlas)
    const binary = new SkeletonBinary(atlasLoader)
    binary.scale = fitScale

    const skelData = binary.readSkeletonData(assetManager.require(skelFile))
    const skeleton = new Skeleton(skelData)
    skeleton.setToSetupPose()

    const stateData = new AnimationStateData(skelData)
    stateData.defaultMix = 0.2 // 200ms cross-fade between animations
    const animState = new AnimationState(stateData)

    const defaultAnim = skelData.animations.find((a) => a.name.toLowerCase().includes('idle'))
      || skelData.animations[0]
    if (defaultAnim) {
      animState.setAnimation(0, defaultAnim.name, true)
    }

    skeleton.updateWorldTransform()
    entries.push({ skeleton, animState })
  }

  // --- Render loop ---

  const renderer = new SceneRenderer(canvas, context)

  renderer.camera.position.x = camX
  renderer.camera.position.y = camY
  renderer.camera.zoom = 1
  renderer.camera.setViewport(canvasSize, canvasSize)
  renderer.camera.update()

  // Lifecycle invariant: `rafId != null` iff the loop is scheduled.
  // `rafId == null && !disposed` means paused. `disposed` is terminal.
  let rafId: number | null = null
  let lastTime = performance.now()
  let disposed = false

  function loop(now: number) {
    const delta = Math.min((now - lastTime) / 1000, 0.1) // clamp to 100ms to avoid animation jumps on tab-resume
    lastTime = now

    for (const entry of entries) {
      entry.animState.update(delta)
      entry.animState.apply(entry.skeleton)
      entry.skeleton.updateWorldTransform()
    }

    gl.viewport(0, 0, canvasSize, canvasSize)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    renderer.begin()
    for (const entry of entries) {
      renderer.drawSkeleton(entry.skeleton, false)
    }
    renderer.end()

    rafId = requestAnimationFrame(loop)
  }

  if (signal?.aborted) {
    renderer.dispose()
    assetManager.dispose()
    throw new DOMException('Spine load aborted', 'AbortError')
  }

  rafId = requestAnimationFrame(loop)

  // --- Cleanup handle ---

  return {
    pause() {
      if (disposed || rafId == null) return
      cancelAnimationFrame(rafId)
      rafId = null
    },
    resume() {
      if (disposed || rafId != null) return
      lastTime = performance.now() // avoid a large delta on the resumed frame
      rafId = requestAnimationFrame(loop)
    },
    dispose() {
      if (disposed) return
      disposed = true
      if (rafId != null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      renderer.dispose()
      assetManager.dispose()
    },
  }
}
