;(async function () {
    const vm = this.vm
    const scratchRenderer = vm.renderer
    const scratchCanvas = scratchRenderer.canvas
    const scratchCanvasParent = scratchCanvas.parentElement

    // ==========================================
    // 1. 统一清理机制 (增加防重入与彻底回收)
    // ==========================================
    function destroyState(old) {
        if (!old) return
        old.cancelled = true
        try {
            if (old.gui) old.gui.destroy()
            if (old._cleanupInput) old._cleanupInput()
            if (old.resizeObserver) old.resizeObserver.disconnect()
            if (old._drawHook && old._originalDraw) {
                scratchRenderer.draw = old._originalDraw
            }
            if (old.threeRenderer) old.threeRenderer.dispose()
            ;[old.loadingDiv, old.hintDiv, old.overlay].forEach(el => {
                if (el && el.parentElement) el.parentElement.removeChild(el)
            })
            if (old.scene) {
                old.scene.traverse(obj => {
                    if (obj.geometry) obj.geometry.dispose()
                    if (obj.material) {
                        const mats = Array.isArray(obj.material)
                            ? obj.material
                            : [obj.material]
                        mats.forEach(m => {
                            for (const k in m)
                                if (m[k] && m[k].isTexture) m[k].dispose()
                            m.dispose()
                        })
                    }
                })
            }
            if (old.textures)
                Object.values(old.textures).forEach(
                    t => t && t.dispose && t.dispose()
                )
            if (
                scratchRenderer._allDrawables &&
                scratchRenderer._allDrawables[old.drawableId]
            ) {
                scratchRenderer.destroyDrawable(old.drawableId, 'sprite')
            }
            if (
                scratchRenderer._allSkins &&
                scratchRenderer._allSkins[old.skinId] &&
                scratchRenderer.destroySkin
            ) {
                scratchRenderer.destroySkin(old.skinId)
            }
            const idx = scratchRenderer._drawList.indexOf(old.drawableId)
            if (idx !== -1) scratchRenderer._drawList.splice(idx, 1)
        } catch (e) {
            console.warn('清理旧实例时发生异常:', e)
        }

        // 置空引用，辅助垃圾回收
        ;[
            'overlay',
            'hintDiv',
            'loadingDiv',
            'gui',
            'threeRenderer',
            'scene',
            'textures',
            'controls'
        ].forEach(k => (old[k] = null))
        vm.__threejs_layer_state = null
    }

    destroyState(vm.__threejs_layer_state)

    const state = { cancelled: false }
    vm.__threejs_layer_state = state

    // ==========================================
    // 2. 动态并发引入依赖
    // ==========================================
    const [THREE, controlsMod, plyMod, guiMod] = await Promise.all([
        import('https://esm.sh/three@0.160.0'),
        import('https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js?deps=three@0.160.0'),
        import('https://esm.sh/three@0.160.0/examples/jsm/loaders/PLYLoader.js?deps=three@0.160.0'),
        import('https://esm.sh/three@0.160.0/examples/jsm/libs/lil-gui.module.min.js')
    ])
    window.THREE = THREE
    const { OrbitControls } = controlsMod
    const { PLYLoader } = plyMod
    const { GUI } = guiMod

    // ==========================================
    // 3. 初始化 Three.js 渲染器与场景
    // ==========================================
    const threeRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        desynchronized: true
    })
    threeRenderer.setPixelRatio(1)
    threeRenderer.setClearColor(0x000000, 0)

    const cssWidth = scratchCanvas.clientWidth || 480
    const cssHeight = scratchCanvas.clientHeight || 360
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let renderWidth = Math.round(cssWidth * dpr)
    let renderHeight = Math.round(cssHeight * dpr)

    threeRenderer.setSize(renderWidth, renderHeight, false)
    const threeCanvas = threeRenderer.domElement
    state.threeRenderer = threeRenderer

    threeRenderer.toneMapping = THREE.ACESFilmicToneMapping
    threeRenderer.toneMappingExposure = 1
    threeRenderer.shadowMap.enabled = true
    threeRenderer.shadowMap.type = THREE.PCFShadowMap

    const scene = new THREE.Scene()
    state.scene = scene

    const camera = new THREE.PerspectiveCamera(
        40,
        cssWidth / cssHeight,
        0.1,
        100
    )
    camera.position.set(7, 4, 1)

    // ==========================================
    // 4. 交互与 UI 辅助
    // ==========================================
    scratchCanvasParent.style.position = 'relative'
    const overlay = document.createElement('canvas')
    Object.assign(overlay.style, {
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        zIndex: '50',
        pointerEvents: 'none'
    })
    scratchCanvasParent.appendChild(overlay)
    state.overlay = overlay

    const hintDiv = document.createElement('div')
    hintDiv.textContent = '按住 Shift 键拖拽旋转视角'
    Object.assign(hintDiv.style, {
        position: 'absolute',
        left: '10px',
        bottom: '10px',
        zIndex: '60',
        color: '#fff',
        background: 'rgba(0,0,0,0.5)',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        pointerEvents: 'none'
    })
    scratchCanvasParent.appendChild(hintDiv)
    state.hintDiv = hintDiv

    const loadingDiv = document.createElement('div')
    loadingDiv.textContent = '正在加载 3D 模型...'
    Object.assign(loadingDiv.style, {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '70',
        color: '#fff',
        fontSize: '16px'
    })
    scratchCanvasParent.appendChild(loadingDiv)
    state.loadingDiv = loadingDiv

    const controls = new OrbitControls(camera, overlay)
    controls.enabled = false
    controls.minDistance = 2
    controls.maxDistance = 10
    controls.maxPolarAngle = Math.PI / 2
    controls.target.set(0, 1, 0)
    controls.update()
    state.controls = controls

    // [核心优化] 脏标记系统
    let dirty3D = true
    let needsScratchRedraw = true
    const setDirty3D = () => {
        dirty3D = true
        needsScratchRedraw = true
    }
    controls.addEventListener('change', setDirty3D)

    const toggleControls = e => {
        const isShift = e.shiftKey
        controls.enabled = isShift
        overlay.style.pointerEvents = isShift ? 'auto' : 'none'
    }
    window.addEventListener('keydown', toggleControls)
    window.addEventListener('keyup', toggleControls)
    state._cleanupInput = () => {
        window.removeEventListener('keydown', toggleControls)
        window.removeEventListener('keyup', toggleControls)
        controls.dispose()
        if (overlay.parentElement) overlay.parentElement.removeChild(overlay)
    }

    // ==========================================
    // 5. 纹理与灯光
    // ==========================================
    const loader = new THREE.TextureLoader().setPath(
        'https://threejs.org/examples/textures/'
    )
    const filenames = ['disturb.jpg', 'colors.png', 'uv_grid_opengl.jpg']
    const textures = { none: null }

    // [优化] 并发加载纹理
    await Promise.all(
        filenames.map(
            name =>
                new Promise((res, rej) => {
                    loader.load(
                        name,
                        tex => {
                            tex.minFilter = THREE.LinearFilter
                            tex.magFilter = THREE.LinearFilter
                            tex.generateMipmaps = false
                            tex.colorSpace = THREE.SRGBColorSpace
                            textures[name] = tex
                            res()
                        },
                        undefined,
                        rej
                    )
                })
        )
    )

    const ambient = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 0.25)
    scene.add(ambient)

    const spotLight = new THREE.SpotLight(0xffffff, 100)
    spotLight.name = 'spotLight'
    spotLight.map = textures['disturb.jpg'] // 确保此时纹理已就绪
    spotLight.position.set(2.5, 5, 2.5)
    spotLight.angle = Math.PI / 6
    spotLight.penumbra = 1
    spotLight.decay = 2
    spotLight.distance = 0
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 512 // [优化] 降低阴影分辨率以提升性能
    spotLight.shadow.mapSize.height = 512
    spotLight.shadow.camera.near = 2
    spotLight.shadow.camera.far = 10
    spotLight.shadow.focus = 1
    spotLight.shadow.bias = -0.003
    spotLight.shadow.intensity = 1
    scene.add(spotLight)

    spotLight.lightHelper = new THREE.SpotLightHelper(spotLight)
    spotLight.lightHelper.visible = false
    scene.add(spotLight.lightHelper)

    spotLight.shadowCameraHelper = new THREE.CameraHelper(
        spotLight.shadow.camera
    )
    spotLight.shadowCameraHelper.visible = false
    scene.add(spotLight.shadowCameraHelper)

    const geometry = new THREE.PlaneGeometry(10, 10)
    const material = new THREE.MeshLambertMaterial({ color: 0xbcbcbc })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, -1, 0)
    mesh.rotation.x = -Math.PI / 2
    mesh.receiveShadow = true
    scene.add(mesh)

    new PLYLoader().load(
        'https://threejs.org/examples/models/ply/binary/Lucy100k.ply',
        function (geo) {
            if (state.cancelled) {
                geo.dispose()
                return
            }
            geo.scale(0.0024, 0.0024, 0.0024)
            geo.computeVertexNormals()
            const mat = new THREE.MeshLambertMaterial()
            const plyMesh = new THREE.Mesh(geo, mat)
            plyMesh.rotation.y = -Math.PI / 2
            plyMesh.position.y = 0.8
            plyMesh.castShadow = true
            plyMesh.receiveShadow = true
            scene.add(plyMesh)

            if (loadingDiv.parentElement)
                loadingDiv.parentElement.removeChild(loadingDiv)
            setDirty3D() // 加载完成，触发一次渲染
        }
    )

    // ==========================================
    // 6. GUI 菜单创建
    // ==========================================
    const gui = new GUI({ container: scratchCanvasParent })
    Object.assign(gui.domElement.style, {
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: '100'
    })
    state.gui = gui

    const params = {
        map: textures['disturb.jpg'],
        color: spotLight.color.getHex(),
        intensity: spotLight.intensity,
        distance: spotLight.distance,
        angle: spotLight.angle,
        penumbra: spotLight.penumbra,
        decay: spotLight.decay,
        focus: spotLight.shadow.focus,
        shadowIntensity: spotLight.shadow.intensity,
        helpers: false
    }

    // [优化] 每次更改都通过 setDirty3D 标记脏
    gui.add(params, 'map', textures).onChange(val => {
        spotLight.map = val
        setDirty3D()
    })
    gui.addColor(params, 'color').onChange(val => {
        spotLight.color.setHex(val)
        setDirty3D()
    })
    gui.add(params, 'intensity', 0, 500).onChange(val => {
        spotLight.intensity = val
        setDirty3D()
    })
    gui.add(params, 'distance', 0, 20).onChange(val => {
        spotLight.distance = val
        setDirty3D()
    })
    gui.add(params, 'angle', 0, Math.PI / 3).onChange(val => {
        spotLight.angle = val
        setDirty3D()
    })
    gui.add(params, 'penumbra', 0, 1).onChange(val => {
        spotLight.penumbra = val
        setDirty3D()
    })
    gui.add(params, 'decay', 1, 2).onChange(val => {
        spotLight.decay = val
        setDirty3D()
    })
    gui.add(params, 'focus', 0, 1).onChange(val => {
        spotLight.shadow.focus = val
        setDirty3D()
    })
    gui.add(params, 'shadowIntensity', 0, 1).onChange(val => {
        spotLight.shadow.intensity = val
        setDirty3D()
    })
    gui.add(params, 'helpers').onChange(val => {
        spotLight.lightHelper.visible = val
        spotLight.shadowCameraHelper.visible = val
        setDirty3D()
    })

    // ==========================================
    // 7. 注册进 Scratch 并缓存计算
    // ==========================================
    const bufferCanvas = document.createElement('canvas')
    bufferCanvas.width = renderWidth
    bufferCanvas.height = renderHeight
    const bufferCtx = bufferCanvas.getContext('2d', { alpha: true })

    const [stageWidth] = scratchRenderer.getNativeSize()
    let currentResolution = bufferCanvas.width / stageWidth

    const skinId = scratchRenderer.createBitmapSkin(
        bufferCanvas,
        currentResolution
    )
    const drawableId = scratchRenderer.createDrawable('sprite')
    scratchRenderer.updateDrawableProperties(drawableId, {
        skinId: skinId,
        position: [0, 0],
        scale: [100, 100],
        direction: 90,
        visible: true
    })
    state.skinId = skinId
    state.drawableId = drawableId

    // ==========================================
    // 8. [核心优化] 同步拦截 draw，引入脏标记与层级缓存
    // ==========================================
    state._originalDraw = scratchRenderer.draw
    state._drawHook = true

    const _drawList = scratchRenderer._drawList
    const _runtime = vm.runtime

    let layerAdjusted = false // 防止每帧重算层级

    scratchRenderer.draw = function () {
        const st = vm.__threejs_layer_state
        try {
            if (st === state && !st.cancelled) {
                // 1. 维持层级 (只校正一次)
                if (!layerAdjusted) {
                    const me = _drawList.indexOf(st.drawableId)
                    const stage = _runtime.getTargetForStage
                        ? _runtime.getTargetForStage()
                        : _runtime.targets.find(t => t.isStage)
                    const stageIdx = stage
                        ? _drawList.indexOf(stage.drawableID)
                        : -1
                    const targetIdx = stageIdx !== -1 ? stageIdx + 1 : 0
                    if (me !== targetIdx) {
                        if (me !== -1) _drawList.splice(me, 1)
                        _drawList.splice(targetIdx, 0, st.drawableId)
                    }
                    layerAdjusted = true
                }

                // 2. 更新 3D 动画
                // (注: 如果想实现纯静止，请删除这段灯光动画代码，即可享受零负载按需渲染)
                const time = performance.now() / 3000
                spotLight.position.x = Math.cos(time) * 2.5
                spotLight.position.z = Math.sin(time) * 2.5
                if (spotLight.lightHelper.visible)
                    spotLight.lightHelper.update()
                dirty3D = true // 因为灯光在动，所以必定脏

                // 3. 仅在脏时渲染 Three.js
                if (dirty3D) {
                    threeRenderer.render(scene, camera)
                    bufferCtx.clearRect(
                        0,
                        0,
                        bufferCanvas.width,
                        bufferCanvas.height
                    )
                    bufferCtx.drawImage(
                        threeCanvas,
                        0,
                        0,
                        bufferCanvas.width,
                        bufferCanvas.height
                    )
                    this.updateBitmapSkin(
                        skinId,
                        bufferCanvas,
                        currentResolution
                    )
                    dirty3D = false
                    needsScratchRedraw = true // 3D画面变了，告知 Scratch 重绘
                }
            }
        } catch (e) {
            console.warn('threejs draw hook error:', e)
        }
        return state._originalDraw.apply(this, arguments)
    }

    // ==========================================
    // 9. 画布尺寸监听 (防抖 + 安全校验)
    // ==========================================
    let resizeTimer = null
    const resizeObserver = new ResizeObserver(() => {
        if (state.cancelled) return // 避免销毁后触发
        if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
            if (state.cancelled) return // 双保险
            const cWidth = scratchCanvas.clientWidth
            const cHeight = scratchCanvas.clientHeight
            if (!cWidth || !cHeight) return

            const currentDpr = Math.min(window.devicePixelRatio || 1, 2)
            let targetW = Math.round(cWidth * currentDpr)
            let targetH = Math.round(cHeight * currentDpr)

            const MAX_WIDTH = 1920
            if (targetW > MAX_WIDTH) {
                const scale = MAX_WIDTH / targetW
                targetW = MAX_WIDTH
                targetH = Math.round(targetH * scale)
            }

            camera.aspect = cWidth / cHeight
            camera.updateProjectionMatrix()

            threeRenderer.setSize(targetW, targetH, false)
            bufferCanvas.width = targetW
            bufferCanvas.height = targetH

            currentResolution = targetW / stageWidth
            if (controls.handleResize) controls.handleResize()
            setDirty3D() // 尺寸变了，需要重绘
        }, 150)
    })
    resizeObserver.observe(scratchCanvasParent)
    state.resizeObserver = resizeObserver

    // ==========================================
    // 10. 可见性智能暂停与帧率唤醒
    // ==========================================
    function loop() {
        if (vm.__threejs_layer_state !== state) return
        if (!document.hidden && needsScratchRedraw) {
            _runtime.requestRedraw()
            needsScratchRedraw = false // 重绘诉求已传达，暂停持续请求
        }
        requestAnimationFrame(loop)
    }
    loop()
}).call(this)
