import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'RenderTheWorld', // Replace it with your extension name
  //entry: ['src/RenderTheWorld.ts', 'src/RenderTheWorld.js', 'src/BufferGeometryUtils.js', 'src/GLTFLoader.js', 'src/MTLLoader.js', 'src/OBJLoader.js', 'src/three.js', 'src/WebGL.js', 'src/OrbitControls.js'],
  entry: ['src/index.ts', 'src/index.js'],
  target: ['esnext'],
  format: ['iife'],
  outDir: 'dist',
  banner: {
    // Replace it with your extension's metadata
    js: `// Name: xiaochen004hao's example Extension
// ID: RenderTheWorld
// Description: 积木渲染世界
// By: xiaochen004hao
// Original: xiaochen004hao
// License: LGPL-3.0 license
`
  },
  platform: 'browser',
  clean: true
})
