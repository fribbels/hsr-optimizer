# Troubleshooting

## GPU

### Error: GPU acceleration is not supported

* WebGPU is still experimental technology and stability is not guaranteed in all browsers.
* The officially supported browsers are Chrome / Opera / Edge.
* Optimizer GPU acceleration does NOT currently run on Firefox Nightly due to Firefox's implementation bugs.
* If other browsers don't work, try using the optimizer on Chrome as it has been the most stable environment so far.

### Error: GPU acceleration process crashes / hangs

* This may indicate a bug in the optimizer or instability in the browser's WebGPU implementation.
* If you're on the GPU Acceleration Enabled (Experimental) optimization, try switching to the (Stable) engine.
* Try the optimizer on the other supported browsers, primarily Chrome but also Opera and Edge.
* In your browser flags, make sure the #use-angle option "Choose ANGLE graphics backend" is not set to OpenGL. Default
  is recommended, or D3D11.
* If none of these work, please report the bug to the discord server so we can investigate & fix.

### Combo DMG optimization is slow on Mac

* This is an issue with how compute shaders are compiled for Metal on Mac.
* We're currently looking for workarounds, but for Mac try to stick with optimization targets other than Combo DMG
