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
}

interface SkeletonEntry {
  skeleton: Skeleton
  animState: AnimationState
}

export async function createSpineInstance(
  canvas: HTMLCanvasElement,
  baseUrl: string,
  files: { skelFile: string; atlasFile: string }[],
): Promise<SpineInstance> {
  const glContext = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false, antialias: true })
    || canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true })
  if (!glContext) throw new Error('WebGL not available')
  const gl = glContext

  const context = new ManagedWebGLRenderingContext(gl)
  const assetManager = new AssetManager(context, baseUrl)

  // Queue all skeleton + atlas files for loading
  for (const { skelFile, atlasFile } of files) {
    assetManager.loadBinary(skelFile)
    assetManager.loadTextureAtlas(atlasFile)
  }

  // Poll until all assets are loaded
  await new Promise<void>((resolve, reject) => {
    function check() {
      if (assetManager.isLoadingComplete()) {
        assetManager.hasErrors()
          ? reject(new Error(JSON.stringify(assetManager.getErrors())))
          : resolve()
      } else {
        requestAnimationFrame(check)
      }
    }
    check()
  })

  const canvasSize = canvas.width

  // Pass 1: parse all skeletons at scale 1 to compute combined bounds
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

  // Pass 2: re-parse all skeletons at fitted scale, create animation states
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
    stateData.defaultMix = 0.2
    const animState = new AnimationState(stateData)

    const defaultAnim = skelData.animations.find((a) => a.name.toLowerCase().includes('idle'))
      || skelData.animations[0]
    if (defaultAnim) {
      animState.setAnimation(0, defaultAnim.name, true)
    }

    skeleton.updateWorldTransform()
    entries.push({ skeleton, animState })
  }

  const renderer = new SceneRenderer(canvas, context)

  // Render loop
  let rafId: number | null = null
  let lastTime = performance.now()

  function loop(now: number) {
    const delta = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    for (const entry of entries) {
      entry.animState.update(delta)
      entry.animState.apply(entry.skeleton)
      entry.skeleton.updateWorldTransform()
    }

    gl.viewport(0, 0, canvasSize, canvasSize)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    renderer.camera.position.x = camX
    renderer.camera.position.y = camY
    renderer.camera.zoom = 1
    renderer.camera.setViewport(canvasSize, canvasSize)
    renderer.camera.update()

    renderer.begin()
    for (const entry of entries) {
      renderer.drawSkeleton(entry.skeleton, false)
    }
    renderer.end()

    rafId = requestAnimationFrame(loop)
  }

  rafId = requestAnimationFrame(loop)

  return {
    dispose() {
      if (rafId != null) cancelAnimationFrame(rafId)
      renderer.dispose()
      assetManager.dispose()
    },
  }
}
