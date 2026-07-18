/* eslint-disable no-underscore-dangle */
// @ts-nocheck
/* eslint-disable func-names */
/**
 * RenderEngine —— 渲染世界扩展的核心渲染引擎
 *
 * 架构（游戏引擎级设计）：
 *   ┌──────────────────────────────────────────────────────────┐
 *   │                     RenderEngine                         │
 *   │  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
 *   │  │ SceneManager │  │ SessionGuard │  │ RendererAdapter│  │
 *   │  └──────────────┘  └──────────────┘  └───────────────┘  │
 *   │  ┌──────────────────────────────────────────────────┐   │
 *   │  │          渲染管线（脏标记 + draw hook + RAF）       │   │
 *   │  └──────────────────────────────────────────────────┘   │
 *   └──────────────────────────────────────────────────────────┘
 *
 * 设计要点（参考 test2.js 的优秀实践）：
 * 1. 脏标记系统：_dirty3D / _needsScratchRedraw，避免每帧无条件渲染
 * 2. 同步拦截 Scratch renderer.draw：在 Scratch 重绘前完成 3D 渲染并刷新皮肤
 * 3. ResizeObserver 防抖：尺寸变化时安全重建缓冲
 * 4. 可见性智能暂停：document.hidden 时不请求重绘
 * 5. SessionGuard：防止异步加载回调在项目重启后导致重复添加
 * 6. SceneManager：统一管理场景对象生命周期（注册/注销/dispose/动画更新）
 * 7. 资源 dispose：traverse 场景释放 geometry / material / texture
 */

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'
import { BrightnessContrastShader } from 'three/examples/jsm/shaders/BrightnessContrastShader.js'
import { HueSaturationShader } from 'three/examples/jsm/shaders/HueSaturationShader.js'

import { Skins } from '../utils/canvasSkin.js'
import {
    chen_RenderTheWorld_icon,
    chen_RenderTheWorld_extensionId,
    color,
    color_secondary
} from '../assets/index.js'
import RendererAdapter from '../adapters/rendererAdapter.js'
import DOMUtils from '../utils/dom.js'
import { RTW_Model_Box, Wrapper, setTHREE } from '../utils/RTWTools.js'
import SceneManager from './SceneManager.js'
import SessionGuard from './SessionGuard.js'

class RenderEngine {
    /**
     * @param {import('./main.js').default} ext - 扩展主对象
     */
    constructor(ext) {
        this.ext = ext
        /** @type {import('three')} */
        this.THREE = THREE
        setTHREE(THREE)
        /** Loaders（供分组使用，避免分组静态 import three） */
        this.GLTFLoader = GLTFLoader
        this.OBJLoader = OBJLoader
        this.MTLLoader = MTLLoader
        /** Post-processing（后处理模块） */
        this.EffectComposer = EffectComposer
        this.RenderPass = RenderPass
        this.UnrealBloomPass = UnrealBloomPass
        this.ShaderPass = ShaderPass
        this.OutputPass = OutputPass
        this.FXAAShader = FXAAShader
        this.VignetteShader = VignetteShader
        this.BrightnessContrastShader = BrightnessContrastShader
        this.HueSaturationShader = HueSaturationShader
        /** @type {EffectComposer|null} 后处理合成器（启用后处理时非 null） */
        this._composer = null
        /** @type {OutputPass|null} 输出通道（sRGB 转换 + 色调映射，始终为 composer 最后一个 pass） */
        this._outputPass = null
        /** @type {Object<string, any>} 各用户 pass 实例引用 */
        this._passes = {}
        /** OrbitControls 类（供分组使用） */
        this.OrbitControls = OrbitControls

        // ============== 子系统 ==============
        /** @type {RendererAdapter} */
        this.rendererAdapter = new RendererAdapter(ext.runtime)
        this.domUtils = new DOMUtils()
        /** @type {SceneManager} */
        this.sceneManager = new SceneManager(this)
        /** @type {SessionGuard} */
        this.sessionGuard = new SessionGuard()

        // ============== 渲染状态 ==============
        this._initialized = false
        this._dirty3D = true
        this._needsScratchRedraw = true
        /** 扩展是否已彻底卸载（不可恢复） */
        this._destroyed = false
        /** 3D 画面是否显示到舞台（旧版 isTcShow，默认关闭） */
        this._isTcShow = false

        // ============== 渲染设置（可由设置积木动态修改） ==============
        this._settings = {
            antialias: true,
            shadowMapType: THREE.PCFShadowMap,
            shadowEnabled: true,
            backgroundColor: null, // null = 透明背景
            pixelRatio: 1
        }

        // ============== Three.js 基础对象 ==============
        this.renderer = null
        this.scene = null
        this.camera = null
        // this.controls = null

        // ============== 缓冲与尺寸 ==============
        this.tc = null
        /** 空白画布：初始化前/隐藏时用作皮肤内容，避免显示未渲染的画布 */
        this.nullCanvas = document.createElement('canvas')
        this._renderWidth = 0
        this._renderHeight = 0
        this._stageWidth = 480
        this._currentResolution = 1

        // ============== Scratch 层级 / 皮肤 ==============
        this.threeSkinId = -1
        this.threeDrawableId = -1
        this.threeSkin = null

        // ============== 事件清理句柄 ==============
        /** @type {(() => void)[]} */
        this._cleanups = []
        this._originalDraw = null
        this._drawHooked = false
        this._layerAdjusted = false
        this._rafId = null
        this._resizeTimer = null
        this._resizeObserver = null

        // ============== 对象表（委托给 SceneManager，保留引用以兼容旧 API） ==============
        this.objects = this.sceneManager.objects
        this.animations = this.sceneManager.animations
        this.lights = this.sceneManager.lights

        // ============== 动画时钟 ==============
        this._lastAnimTime = 0

        // 立即注入层级与皮肤
        this._injectLayer()
        this._createSkin()

        // 自动初始化 Three.js（无需 init 积木，扩展加载即就绪）
        this._initThree()

        // 生命周期：项目停止时轻量清理，项目启动时自动恢复
        const runtime = ext.runtime
        const onStopAll = () => this._stopRender()
        runtime.on('PROJECT_STOP_ALL', onStopAll)
        this._cleanups.push(() => runtime.off('PROJECT_STOP_ALL', onStopAll))

        // PROJECT_STOP_ALL 后再次运行时自动重新初始化
        const onProjectStart = () => {
            if (!this._initialized && !this._destroyed) {
                this._initThree()
            }
        }
        runtime.on('PROJECT_START', onProjectStart)
        this._cleanups.push(() => runtime.off('PROJECT_START', onProjectStart))

        this._logDebugInfo()
    }

    // ============================================================
    //  兼容层：委托给 SceneManager（让旧分组代码无需修改）
    // ============================================================

    /**
     * 获取模型（委托给 SceneManager）
     * @param {*} obj
     * @returns {THREE.Object3D|null}
     */
    getModel(obj) {
        return this.sceneManager.getModel(obj)
    }

    /**
     * 注销对象（委托给 SceneManager）
     * @param {string} name
     */
    removeObject(name) {
        this.sceneManager.remove(name)
    }

    /**
     * 创建会话令牌（供异步加载校验）
     * @returns {number}
     */
    createSessionToken() {
        return this.sessionGuard.createToken()
    }

    /**
     * 校验会话令牌是否有效
     * @param {number} token
     * @returns {boolean}
     */
    isSessionValid(token) {
        return this.sessionGuard.isValid(token)
    }

    /**
     * Cast 工具的字符串转换（内部使用）
     * @param {*} v
     * @returns {string}
     */
    castToString(v) {
        return this.ext.cast ? this.ext.cast.toString(v) : String(v)
    }

    // ============================================================
    //  1. Scratch 层级与皮肤
    // ============================================================

    _injectLayer() {
        this.rendererAdapter.injectLayer('RenderTheWorld', 'video')
    }

    _createSkin() {
        const runtime = this.ext.runtime
        const adapter = this.rendererAdapter

        const [stageW, stageH] = this.rendererAdapter.getNativeSize()
        this._stageWidth = stageW
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        this._renderWidth = Math.round(stageW * dpr)
        this._renderHeight = Math.round(stageH * dpr)

        // this.tc 专供 WebGLRenderer 使用，不可获取 2D context，
        // 否则浏览器拒绝在同一 canvas 上创建 WebGL context。
        // 皮肤内容直接使用 WebGL canvas（texImage2D/texSubImage2D 接受 canvas 元素）。
        this.tc = this.domUtils.createCanvas(
            this._renderWidth,
            this._renderHeight,
            true
        )
        this.domUtils.appendTo(this.tc, runtime.renderer.canvas.parentElement)

        this._currentResolution = this._renderWidth / stageW

        this.threeSkinId = adapter.createSkinId()
        const SkinsClass = new Skins(runtime)
        this.threeSkin = new SkinsClass.CanvasSkin(
            this.threeSkinId,
            runtime.renderer
        )
        adapter.registerSkin(this.threeSkinId, this.threeSkin)

        // 先创建 Drawable（setContent 内部会调用 drawable._skinWasAltered()，
        // 必须保证 drawable 在 setContent 之前已存在）
        this.threeDrawableId = adapter.createDrawable('RenderTheWorld')
        adapter.updateDrawableSkinId(this.threeDrawableId, this.threeSkinId)
        adapter.updateDrawableProperties(this.threeDrawableId, {
            position: [0, 0],
            scale: [100, 100],
            direction: 90,
            visible: true
        })

        // 初始用空白画布，避免在 Three.js 初始化前显示未渲染内容
        this.threeSkin.setContent(this.nullCanvas)
    }

    // ============================================================
    //  2. Three.js 初始化（自动调用，无需 init 积木）
    // ============================================================

    /**
     * 自动初始化 Three.js 渲染器、场景、相机、控制器
     * 所有配置从 this._settings 读取，可由设置积木动态修改
     */
    _initThree() {
        if (this._destroyed || this._initialized) return

        // 开始新的会话（使旧的异步加载回调失效）
        this.sessionGuard.begin()

        try {
            const s = this._settings

            // 渲染器
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.tc,
                antialias: s.antialias,
                alpha: true,
                powerPreference: 'high-performance',
                desynchronized: true
            })
            this.renderer.setPixelRatio(s.pixelRatio)
            // 透明背景以支持 Scratch 舞台穿透
            this.renderer.setClearColor(0x000000, 0)
            this.renderer.setSize(this._renderWidth, this._renderHeight, false)
            this.renderer.outputColorSpace = THREE.SRGBColorSpace
            this.renderer.shadowMap.enabled = s.shadowEnabled
            this.renderer.shadowMap.type = s.shadowMapType

            // 场景
            this.scene = new THREE.Scene()
            if (s.backgroundColor != null) {
                this._applyBackgroundToScene(s.backgroundColor)
            }

            // 相机（fov=40，aspect=画布宽高比）
            const canvas = this.ext.runtime.renderer.canvas
            const aspect =
                canvas.width / canvas.height ||
                this._renderWidth / this._renderHeight ||
                16 / 9
            this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000)

            // 控制器（绑定到 runtime.renderer.canvas，显式禁用所有操作）
            // this.controls = new OrbitControls(this.camera, canvas)
            // this.controls.enabled = false
            // this.controls.enableDamping = false
            // this.controls.enablePan = false
            // this.controls.enableZoom = false
            // this.controls.enableRotate = false
            // this.controls.update()

            // 环境光和半球光（黑色，占位）
            this.lights.ambient = new THREE.AmbientLight(0x000000)
            this.scene.add(this.lights.ambient)
            this.lights.hemisphere = new THREE.HemisphereLight(
                0x000000,
                0x000000
            )
            this.scene.add(this.lights.hemisphere)

            this._initialized = true

            // _isTcShow 默认 false，显示空白画布
            if (!this._isTcShow && this.threeSkin) {
                this.threeSkin.setContent(this.nullCanvas)
            }

            this._hookScratchDraw()
            this._startRafLoop()
            this._observeResize()
            this.setDirty3D()
        } catch (err) {
            this.ext.logger?.error('RenderTheWorld: Three.js 初始化失败:', err)
            this.destroy()
            throw err
        }
    }

    // ============================================================
    //  2.1 渲染设置 API（供设置积木调用）
    // ============================================================

    /**
     * 设置背景颜色（null/空 = 透明）
     * @param {number|string|null} color
     */
    setBackgroundColor(color) {
        this._settings.backgroundColor = color
        if (this.scene) {
            if (color == null || color === '') {
                this.scene.background = null
            } else {
                this._applyBackgroundToScene(color)
            }
        }
        this.setDirty3D()
    }

    /** 内部：将颜色值应用到 scene.background */
    _applyBackgroundToScene(color) {
        try {
            const cast = this.ext.cast
            const colorVal = cast ? cast.toNumber(color) : Number(color)
            this.scene.background = new THREE.Color(colorVal)
        } catch {
            /* 非法颜色值忽略 */
        }
    }

    /**
     * 设置抗锯齿（需要重建 WebGLRenderer）
     * @param {boolean} enabled
     */
    setAntialias(enabled) {
        this._settings.antialias = !!enabled
        if (this._initialized) this._rebuildRenderer()
    }

    /**
     * 设置阴影类型
     * @param {number|string} type - THREE.ShadowMap 常量或字符串名
     */
    setShadowMapType(type) {
        this._settings.shadowMapType = type
        if (this.renderer) {
            const map = {
                BasicShadowMap: THREE.BasicShadowMap,
                PCFShadowMap: THREE.PCFShadowMap,
                PCFSoftShadowMap: THREE.PCFSoftShadowMap,
                VSMShadowMap: THREE.VSMShadowMap
            }
            this.renderer.shadowMap.type =
                typeof type === 'string'
                    ? map[type] || THREE.PCFShadowMap
                    : type
            // 阴影类型变更需要刷新材质
            this.scene?.traverse(child => {
                if (child.material) child.material.needsUpdate = true
            })
        }
        this.setDirty3D()
    }

    /**
     * 启用/禁用阴影
     * @param {boolean} enabled
     */
    setShadowEnabled(enabled) {
        this._settings.shadowEnabled = !!enabled
        if (this.renderer) {
            this.renderer.shadowMap.enabled = !!enabled
            this.scene?.traverse(child => {
                if (child.material) child.material.needsUpdate = true
            })
        }
        this.setDirty3D()
    }

    /**
     * 设置像素比（1 = 使用 _renderWidth 中已含的 DPR，不建议 >2）
     * @param {number} ratio
     */
    setPixelRatio(ratio) {
        this._settings.pixelRatio = ratio
        if (this.renderer) this.renderer.setPixelRatio(ratio)
        this.setDirty3D()
    }

    /**
     * 重建 WebGLRenderer（用于抗锯齿等创建时参数的切换）
     *
     * 浏览器不允许在同一 canvas 上创建第二个 WebGL context，
     * forceContextLoss 是异步的且不可靠。正确做法：
     *   1. 创建新 canvas（同尺寸）替换旧 canvas
     *   2. dispose 旧 renderer（释放旧 context 资源）
     *   3. 在新 canvas 上创建新 WebGLRenderer
     *   4. 更新 skin 内容指向新 canvas
     */
    _rebuildRenderer() {
        if (!this._initialized || !this.renderer) return
        const s = this._settings

        // 1. 创建新 canvas
        const oldCanvas = this.tc
        const newCanvas = this.domUtils.createCanvas(
            this._renderWidth,
            this._renderHeight,
            true
        )
        // 插入到旧 canvas 旁边，稍后移除旧 canvas
        if (oldCanvas?.parentElement) {
            oldCanvas.parentElement.insertBefore(newCanvas, oldCanvas)
        }

        // 2. dispose 旧 renderer（释放 GL 资源、着色器、几何体上传缓冲等）
        try {
            this.renderer.dispose()
        } catch {
            /* 忽略 */
        }
        // forceContextLoss 加速旧 context 释放（异步，不阻塞）
        try {
            this.renderer.forceContextLoss?.()
        } catch {
            /* 忽略 */
        }

        // 3. 移除旧 canvas DOM
        if (oldCanvas?.parentElement) {
            oldCanvas.parentElement.removeChild(oldCanvas)
        }

        // 4. 切换到新 canvas
        this.tc = newCanvas

        // 5. 在新 canvas 上创建新 WebGLRenderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.tc,
            antialias: s.antialias,
            alpha: true,
            powerPreference: 'high-performance',
            desynchronized: true
        })
        this.renderer.setPixelRatio(s.pixelRatio)
        this.renderer.setClearColor(0x000000, 0)
        this.renderer.setSize(this._renderWidth, this._renderHeight, false)
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.shadowMap.enabled = s.shadowEnabled
        this.renderer.shadowMap.type = s.shadowMapType

        // 6. 刷新所有材质（让新 context 重新编译着色器）
        this.scene?.traverse(child => {
            if (child.material) child.material.needsUpdate = true
        })

        // 7. 销毁旧后处理合成器（引用了旧 renderer，必须重建）
        //    保存 pass 参数以便重建后恢复
        const savedParams = this._savePassParams()
        this.disablePostProcessing()

        // 8. 如果当前是显示状态，更新 skin 指向新 canvas
        if (this._isTcShow && this.threeSkin) {
            this.threeSkin.setContent(this.tc)
        }

        // 9. 恢复后处理 pass
        this._restorePassParams(savedParams)

        this.setDirty3D()
    }

    /**
     * 保存当前所有 pass 的参数（用于 _rebuildRenderer 后恢复）
     * @returns {Object} 参数快照
     */
    _savePassParams() {
        const params = {}
        if (this._passes.bloom) {
            params.bloom = {
                strength: this._passes.bloom.strength,
                radius: this._passes.bloom.radius,
                threshold: this._passes.bloom.threshold
            }
        }
        if (this._passes.fxaa) params.fxaa = true
        if (this._passes.vignette) {
            params.vignette = {
                offset: this._passes.vignette.material.uniforms.offset.value,
                darkness: this._passes.vignette.material.uniforms.darkness.value
            }
        }
        if (this._passes.brightnessContrast) {
            params.brightnessContrast = {
                brightness:
                    this._passes.brightnessContrast.material.uniforms.brightness
                        .value,
                contrast:
                    this._passes.brightnessContrast.material.uniforms.contrast
                        .value
            }
        }
        if (this._passes.hueSaturation) {
            params.hueSaturation = {
                hue: this._passes.hueSaturation.material.uniforms.hue.value,
                saturation:
                    this._passes.hueSaturation.material.uniforms.saturation.value
            }
        }
        return params
    }

    /**
     * 从参数快照恢复后处理 pass
     * @param {Object} params - _savePassParams 的返回值
     */
    _restorePassParams(params) {
        if (params.bloom) {
            this.enableBloom(
                params.bloom.strength,
                params.bloom.radius,
                params.bloom.threshold
            )
        }
        if (params.fxaa) this.enableFXAA()
        if (params.vignette) {
            this.enableVignette(
                params.vignette.offset,
                params.vignette.darkness
            )
        }
        if (params.brightnessContrast) {
            this.enableBrightnessContrast(
                params.brightnessContrast.brightness,
                params.brightnessContrast.contrast
            )
        }
        if (params.hueSaturation) {
            this.enableHueSaturation(
                params.hueSaturation.hue,
                params.hueSaturation.saturation
            )
        }
    }

    // ============================================================
    //  3. Scratch draw 拦截（脏标记驱动）
    // ============================================================

    _hookScratchDraw() {
        if (this._drawHooked) return
        const scratchRenderer = this.ext.runtime.renderer
        this._originalDraw = scratchRenderer.draw.bind(scratchRenderer)
        this._drawHooked = true

        // draw hook 只做层级同步，3D 渲染在 RAF 循环中执行
        // （与旧版 setAnimationLoop 方式一致：在 Scratch draw 之前
        //   完成渲染 + setContent，确保 draw 时皮肤已有最新内容）
        const self = this
        scratchRenderer.draw = function () {
            try {
                if (!self._destroyed && self._initialized) {
                    self._syncLayerOnce()
                }
            } catch (e) {
                self.ext.logger?.warn('RTW draw hook error:', e)
            }
            return self._originalDraw.apply(this, arguments)
        }
    }

    _unhookScratchDraw() {
        if (!this._drawHooked) return
        const scratchRenderer = this.ext.runtime.renderer
        if (this._originalDraw) {
            scratchRenderer.draw = this._originalDraw
        }
        this._originalDraw = null
        this._drawHooked = false
    }

    /**
     * 仅校正一次：将 Three.js drawable 放到 stage 之上的固定位置
     */
    _syncLayerOnce() {
        if (this._layerAdjusted) return
        try {
            const drawList = this.rendererAdapter.renderer._drawList
            const me = drawList.indexOf(this.threeDrawableId)
            const stage = this.ext.runtime.getTargetForStage
                ? this.ext.runtime.getTargetForStage()
                : this.ext.runtime.targets.find(t => t.isStage)
            const stageIdx = stage ? drawList.indexOf(stage.drawableID) : -1
            const targetIdx = stageIdx !== -1 ? stageIdx + 1 : 0
            if (me !== targetIdx) {
                if (me !== -1) drawList.splice(me, 1)
                drawList.splice(targetIdx, 0, this.threeDrawableId)
            }
            this._layerAdjusted = true
        } catch {
            /* 容错 */
        }
    }

    /**
     * 实际渲染 Three.js 一帧并把结果写回 Scratch 皮肤
     * 与旧版 render() 逻辑一致：isTcShow 时渲染 tc，否则渲染 nullCanvas
     */
    _renderThree() {
        if (!this.renderer || !this.scene || !this.camera || !this.threeSkin)
            return
        if (this._isTcShow) {
            // 后处理合成器优先
            if (this._composer) {
                this._composer.render()
            } else {
                this.renderer.render(this.scene, this.camera)
            }
            this.threeSkin.setContent(this.tc)
        } else {
            this.threeSkin.setContent(this.nullCanvas)
        }
        // 控制器更新（旧版 render 中始终调用 controls.update()）
        // this.controls?.update()
    }

    /**
     * 推进所有动画混合器（自动计算帧间隔）
     * @returns {boolean} 是否有注册的动画
     */
    _updateAnimations() {
        const names = Object.keys(this.animations)
        if (names.length === 0) return false
        const now = performance.now()
        const dt = this._lastAnimTime
            ? (now - this._lastAnimTime) / 1000
            : 0
        this._lastAnimTime = now
        this.sceneManager.updateAnimations(dt)
        return true
    }

    // ============================================================
    //  4. RAF 渲染循环
    // ============================================================

    /**
     * RAF 循环：每帧检查脏标记，如果为脏则渲染 3D + 更新皮肤 + 请求 Scratch 重绘
     *
     * 优化：无动画且非脏时自动暂停 RAF，由 setDirty3D() 唤醒。
     * 控制器交互通过 change 事件调用 setDirty3D() 触发唤醒。
     */
    _startRafLoop() {
        const loop = () => {
            if (this._destroyed || !this._initialized) {
                this._rafId = null
                return
            }
            if (!document.hidden) {
                const hasAnimations = this._updateAnimations()
                if (this._dirty3D) {
                    this._renderThree()
                    this._dirty3D = false
                    this.rendererAdapter.requestRedraw()
                }
                // 无动画且非脏时暂停 RAF，由 setDirty3D 唤醒
                if (!hasAnimations && !this._dirty3D) {
                    this._rafId = null
                    return
                }
            }
            this._rafId = requestAnimationFrame(loop)
        }
        this._rafId = requestAnimationFrame(loop)
    }

    _stopRafLoop() {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }
    }

    // ============================================================
    //  5. 尺寸监听
    // ============================================================

    _observeResize() {
        const scratchCanvas = this.ext.runtime.renderer.canvas
        const parent = scratchCanvas.parentElement
        if (!parent) return

        this._resizeObserver = new ResizeObserver(() => {
            if (this._destroyed || !this._initialized) return
            if (this._resizeTimer) clearTimeout(this._resizeTimer)
            this._resizeTimer = setTimeout(() => {
                if (this._destroyed || !this._initialized) return
                this._handleResize()
            }, 150)
        })
        this._resizeObserver.observe(parent)
    }

    /**
     * 处理尺寸变化
     *
     * 参考：https://threejs.org/manual/#zh/responsive
     * - renderer.setSize 已内部设置 canvas.width/height，无需手动重复设置
     * - 相机 aspect 仅在尺寸真正变化时更新
     * - EffectComposer 也需要同步缩放其内部渲染目标
     * - FXAA 的 resolution uniform 需手动更新（ShaderPass.setSize 不处理 uniform）
     */
    _handleResize() {
        const scratchCanvas = this.ext.runtime.renderer.canvas
        const cWidth = scratchCanvas.clientWidth || 480
        const cHeight = scratchCanvas.clientHeight || 360
        if (!cWidth || !cHeight) return

        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        let targetW = Math.round(cWidth * dpr)
        let targetH = Math.round(cHeight * dpr)

        // 限制最大宽度，避免高分屏渲染过重
        const MAX_WIDTH = 1920
        if (targetW > MAX_WIDTH) {
            const scale = MAX_WIDTH / targetW
            targetW = MAX_WIDTH
            targetH = Math.round(targetH * scale)
        }

        if (targetW === this._renderWidth && targetH === this._renderHeight)
            return

        this._renderWidth = targetW
        this._renderHeight = targetH

        if (this.camera) {
            this.camera.aspect = cWidth / cHeight
            this.camera.updateProjectionMatrix()
        }
        // renderer.setSize(w, h, false) 已内部设置 canvas.width/height
        // 参考：https://threejs.org/manual/#zh/responsive
        if (this.renderer) this.renderer.setSize(targetW, targetH, false)
        // 同步缩放后处理合成器的渲染目标
        if (this._composer) this._composer.setSize(targetW, targetH)
        // FXAA 的 resolution uniform 需手动更新
        if (this._passes.fxaa) {
            this._passes.fxaa.material.uniforms.resolution.value.set(
                1 / targetW,
                1 / targetH
            )
        }
        // this.controls?.handleResize?.()

        this._currentResolution = targetW / this._stageWidth
        this.setDirty3D()
    }

    // ============================================================
    //  6. 对外 API
    // ============================================================

    /**
     * 标记 3D 场景为脏，并确保 RAF 循环正在运行
     */
    setDirty3D() {
        this._dirty3D = true
        // 如果 RAF 已停止（无动画且非脏时自动暂停），则重新启动
        if (this._rafId === null && this._initialized && !this._destroyed) {
            this._startRafLoop()
        }
    }

    // ============================================================
    //  后处理管理（模块化 pass 系统）
    // ============================================================

    /**
     * 确保后处理合成器已创建（含 RenderPass + OutputPass）
     *
     * OutputPass 始终为最后一个 pass，负责 sRGB 色彩空间转换与色调映射。
     * 参考：https://threejs.org/manual/#zh/color-management
     * 参考：https://threejs.org/manual/#zh/how-to-use-post-processing
     *
     * @returns {EffectComposer|null}
     */
    _ensureComposer() {
        if (!this._initialized || !this.renderer) return null
        if (this._composer) return this._composer
        const size = this.renderer.getDrawingBufferSize(
            new this.THREE.Vector2()
        )
        this._composer = new EffectComposer(this.renderer)
        this._composer.addPass(new RenderPass(this.scene, this.camera))
        this._outputPass = new OutputPass()
        this._composer.addPass(this._outputPass)
        this._composer.setSize(size.x, size.y)
        return this._composer
    }

    /**
     * 重新排列 pass 顺序：Render → Bloom → 色彩 → FXAA → Vignette → Output
     *
     * RenderPass 始终第一，OutputPass 始终最后（负责 sRGB 转换 + 色调映射）。
     * 参考：https://threejs.org/manual/#zh/how-to-use-post-processing
     */
    _reorderPasses() {
        if (!this._composer) return
        const composer = this._composer
        // 保留 RenderPass，移除其他
        const passes = composer.passes
        const renderPass = passes[0]
        composer.passes = [renderPass]
        // 按固定顺序重新添加用户 pass
        const order = ['bloom', 'brightnessContrast', 'hueSaturation', 'fxaa', 'vignette']
        for (const name of order) {
            if (this._passes[name]) {
                composer.passes.push(this._passes[name])
            }
        }
        // OutputPass 始终最后
        if (this._outputPass) {
            composer.passes.push(this._outputPass)
        }
        // 只有最后一个 pass renderToScreen = true
        for (let i = 0; i < composer.passes.length - 1; i++) {
            composer.passes[i].renderToScreen = false
        }
        if (composer.passes.length > 0) {
            composer.passes[composer.passes.length - 1].renderToScreen = true
        }
    }

    /**
     * 启用 Bloom 辉光
     */
    enableBloom(strength = 0.6, radius = 0.4, threshold = 0.85) {
        const composer = this._ensureComposer()
        if (!composer || this._passes.bloom) return
        const size = this.renderer.getDrawingBufferSize(
            new this.THREE.Vector2()
        )
        this._passes.bloom = new UnrealBloomPass(
            size, strength, radius, threshold
        )
        this._reorderPasses()
        this.setDirty3D()
    }

    /**
     * 禁用 Bloom
     */
    disableBloom() {
        if (!this._passes.bloom) return
        this._passes.bloom.dispose?.()
        delete this._passes.bloom
        this._reorderPasses()
        this._checkComposerEmpty()
        this.setDirty3D()
    }

    /**
     * 启用 FXAA 抗锯齿
     */
    enableFXAA() {
        const composer = this._ensureComposer()
        if (!composer || this._passes.fxaa) return
        const size = this.renderer.getDrawingBufferSize(
            new this.THREE.Vector2()
        )
        const fxaa = new ShaderPass(FXAAShader)
        fxaa.material.uniforms.resolution.value.set(1 / size.x, 1 / size.y)
        this._passes.fxaa = fxaa
        this._reorderPasses()
        this.setDirty3D()
    }

    /**
     * 禁用 FXAA
     */
    disableFXAA() {
        if (!this._passes.fxaa) return
        this._passes.fxaa.dispose?.()
        delete this._passes.fxaa
        this._reorderPasses()
        this._checkComposerEmpty()
        this.setDirty3D()
    }

    /**
     * 启用 Vignette 暗角
     */
    enableVignette(offset = 1.0, darkness = 1.0) {
        const composer = this._ensureComposer()
        if (!composer || this._passes.vignette) return
        const pass = new ShaderPass(VignetteShader)
        pass.material.uniforms.offset.value = offset
        pass.material.uniforms.darkness.value = darkness
        this._passes.vignette = pass
        this._reorderPasses()
        this.setDirty3D()
    }

    /**
     * 禁用 Vignette
     */
    disableVignette() {
        if (!this._passes.vignette) return
        this._passes.vignette.dispose?.()
        delete this._passes.vignette
        this._reorderPasses()
        this._checkComposerEmpty()
        this.setDirty3D()
    }

    /**
     * 启用亮度/对比度调整
     */
    enableBrightnessContrast(brightness = 0, contrast = 0) {
        const composer = this._ensureComposer()
        if (!composer || this._passes.brightnessContrast) return
        const pass = new ShaderPass(BrightnessContrastShader)
        pass.material.uniforms.brightness.value = brightness
        pass.material.uniforms.contrast.value = contrast
        this._passes.brightnessContrast = pass
        this._reorderPasses()
        this.setDirty3D()
    }

    /**
     * 禁用亮度/对比度
     */
    disableBrightnessContrast() {
        if (!this._passes.brightnessContrast) return
        this._passes.brightnessContrast.dispose?.()
        delete this._passes.brightnessContrast
        this._reorderPasses()
        this._checkComposerEmpty()
        this.setDirty3D()
    }

    /**
     * 启用色相/饱和度调整
     */
    enableHueSaturation(hue = 0, saturation = 0) {
        const composer = this._ensureComposer()
        if (!composer || this._passes.hueSaturation) return
        const pass = new ShaderPass(HueSaturationShader)
        pass.material.uniforms.hue.value = hue
        pass.material.uniforms.saturation.value = saturation
        this._passes.hueSaturation = pass
        this._reorderPasses()
        this.setDirty3D()
    }

    /**
     * 禁用色相/饱和度
     */
    disableHueSaturation() {
        if (!this._passes.hueSaturation) return
        this._passes.hueSaturation.dispose?.()
        delete this._passes.hueSaturation
        this._reorderPasses()
        this._checkComposerEmpty()
        this.setDirty3D()
    }

    /**
     * 如果没有任何用户效果 pass，销毁合成器回到直接渲染
     * （OutputPass 不算用户 pass；无效果时 renderer.render() 自身已做 sRGB 转换）
     */
    _checkComposerEmpty() {
        if (this._composer && Object.keys(this._passes).length === 0) {
            this._composer.dispose?.()
            this._composer = null
            this._outputPass = null
        }
    }

    /**
     * 禁用所有后处理
     */
    disablePostProcessing() {
        for (const name of Object.keys(this._passes)) {
            this._passes[name]?.dispose?.()
            delete this._passes[name]
        }
        if (this._composer) {
            this._composer.dispose?.()
            this._composer = null
        }
        this._outputPass = null
        this.setDirty3D()
    }

    /**
     * 更新 Bloom 参数
     */
    setBloomParams(strength, radius, threshold) {
        if (!this._passes.bloom) return
        if (strength != null) this._passes.bloom.strength = strength
        if (radius != null) this._passes.bloom.radius = radius
        if (threshold != null) this._passes.bloom.threshold = threshold
        this.setDirty3D()
    }

    /**
     * 更新 Vignette 参数
     */
    setVignetteParams(offset, darkness) {
        if (!this._passes.vignette) return
        if (offset != null)
            this._passes.vignette.material.uniforms.offset.value = offset
        if (darkness != null)
            this._passes.vignette.material.uniforms.darkness.value = darkness
        this.setDirty3D()
    }

    /**
     * 更新亮度/对比度
     */
    setBrightnessContrast(brightness, contrast) {
        if (!this._passes.brightnessContrast) return
        if (brightness != null)
            this._passes.brightnessContrast.material.uniforms.brightness.value = brightness
        if (contrast != null)
            this._passes.brightnessContrast.material.uniforms.contrast.value = contrast
        this.setDirty3D()
    }

    /**
     * 更新色相/饱和度
     */
    setHueSaturation(hue, saturation) {
        if (!this._passes.hueSaturation) return
        if (hue != null)
            this._passes.hueSaturation.material.uniforms.hue.value = hue
        if (saturation != null)
            this._passes.hueSaturation.material.uniforms.saturation.value = saturation
        this.setDirty3D()
    }

    /**
     * 更新色调映射
     * @param {number} toneMapping - THREE.ToneMapping 常量
     * @param {number} exposure
     */
    setToneMapping(toneMapping, exposure) {
        if (!this.renderer) return
        if (toneMapping != null)
            this.renderer.toneMapping = toneMapping
        if (exposure != null)
            this.renderer.toneMappingExposure = exposure
        this.scene?.traverse(child => {
            if (child.material) child.material.needsUpdate = true
        })
        this.setDirty3D()
    }

    /**
     * 切换当前相机
     * @param {THREE.Camera|RTW_Model_Box|Wrapper|string} camera
     */
    setActiveCamera(camera) {
        const obj = this.getModel(camera)
        if (obj && obj.isCamera) {
            this.camera = obj
            this.setDirty3D()
        }
    }

    /**
     * 触发 objectLoadingCompleted 事件帽
     * @param {string} name
     */
    triggerObjectLoaded(name) {
        const runtime = this.ext.runtime
        if (!runtime) return
        const opcode =
            chen_RenderTheWorld_extensionId + '_objectLoadingCompleted'
        try {
            if (typeof runtime.startHatsWithParams === 'function') {
                runtime.startHatsWithParams(opcode, {
                    parameters: { name }
                })
            } else if (typeof runtime.startHats === 'function') {
                runtime.startHats(opcode, { name })
            }
        } catch {
            /* 忽略 */
        }
    }

    /**
     * 设置 3D 显示器状态（与旧版 set3dState 一致）
     * @param {boolean} display - true=显示, false=隐藏
     */
    setVisible(display) {
        if (!this.tc) return '⚠️显示器未初始化！'
        this._isTcShow = display
        if (display) {
            // 旧版 display 时立即 setContent(this.tc)
            if (this.threeSkin && this.tc) this.threeSkin.setContent(this.tc)
            this.setDirty3D()
        } else {
            // 旧版 hidden 时立即 setContent(this.NullCanvas)
            if (this.threeSkin) this.threeSkin.setContent(this.nullCanvas)
        }
    }

    /**
     * 获取 3D 显示器是否显示（与旧版 get3dState 一致）
     * @returns {boolean}
     */
    get3dState() {
        return this._isTcShow
    }

    // ============================================================
    //  7. 资源释放
    // ============================================================

    /**
     * 停止渲染（PROJECT_STOP_ALL 时调用）
     * 轻量清理 Three.js 资源，保留 tc canvas / skin / drawable：
     *   - 停止动画循环
     *   - 释放 material/geometry/scene/controls/renderer
     *   - 不销毁 tc canvas / skin / drawable（保留以便 _initThree 自动恢复）
     *   - 不设置 _destroyed（允许 PROJECT_START 时自动重新初始化）
     */
    _stopRender() {
        if (!this._initialized) return

        // 停止 RAF
        this._stopRafLoop()

        // 解除 draw 钩子
        this._unhookScratchDraw()

        // 解除 resize 监听
        this._resizeObserver?.disconnect()
        this._resizeObserver = null
        if (this._resizeTimer) {
            clearTimeout(this._resizeTimer)
            this._resizeTimer = null
        }

        // 清空所有命名对象（通过 SceneManager 统一 dispose）
        this.sceneManager.clear()

        // 释放控制器
        // this.controls?.dispose()
        // this.controls = null

        // 释放后处理合成器
        this.disablePostProcessing()

        // 释放场景中的 material/geometry/texture，然后清空场景
        // 参考：https://threejs.org/manual/#zh/how-to-dispose-of-objects
        if (this.scene) {
            this.scene.traverse(child => {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    const mats = Array.isArray(child.material)
                        ? child.material
                        : [child.material]
                    mats.forEach(m => {
                        // 释放材质引用的所有纹理（map/normalMap/roughnessMap 等）
                        for (const k in m) {
                            if (m[k] && m[k].isTexture) m[k].dispose()
                        }
                        m.dispose()
                    })
                }
            })
            this.scene.clear()
            this.scene = null
        }

        // 释放渲染器
        if (this.renderer) {
            this.renderer.dispose()
            this.renderer = null
        }
        this.camera = null

        // 清空灯光引用（scene.clear 已移除灯光对象，这里只清引用）
        // 注意：不能重新赋值 this.lights = Object.create(null)，否则会断开
        // 与 sceneManager.lights 的共享引用。应原地清空 key。
        for (const k in this.lights) delete this.lights[k]

        // 旧版停止时不清除皮肤内容，保留最后画面
        // _isTcShow 在下次 init 时重置为 false

        // 重置状态标记（允许重新 init）
        this._initialized = false
        this._layerAdjusted = false
        this._dirty3D = true
    }

    /**
     * 彻底销毁（扩展从舞台移除时调用，不可恢复）
     * 销毁所有资源包括 tc/skin/drawable
     */
    destroy() {
        if (this._destroyed) return
        this._destroyed = true

        // 先执行停止渲染的清理
        this._stopRender()

        // 移除缓冲画布
        if (this.tc?.parentElement) {
            this.tc.parentElement.removeChild(this.tc)
        }
        this.tc = null
        this.nullCanvas = null

        // 清理 Scratch 皮肤与 drawable
        try {
            const scratchRenderer = this.ext.runtime.renderer
            if (scratchRenderer._allDrawables?.[this.threeDrawableId]) {
                scratchRenderer.destroyDrawable(
                    this.threeDrawableId,
                    'RenderTheWorld'
                )
            }
            if (
                scratchRenderer._allSkins?.[this.threeSkinId] &&
                scratchRenderer.destroySkin
            ) {
                scratchRenderer.destroySkin(this.threeSkinId)
            }
            const idx = scratchRenderer._drawList.indexOf(this.threeDrawableId)
            if (idx !== -1) scratchRenderer._drawList.splice(idx, 1)
        } catch (e) {
            this.ext.logger?.warn('RTW 清理 Scratch 资源时发生异常:', e)
        }

        // 其他清理（事件监听等）
        this._cleanups.forEach(fn => {
            try {
                fn()
            } catch {
                /* 忽略 */
            }
        })
        this._cleanups = []
    }

    // ============================================================
    //  8. 调试信息
    // ============================================================

    /**
     * 打印渲染器内存信息（用于检测内存泄漏）
     * 参考：https://threejs.org/manual/#zh/how-to-dispose-of-objects
     */
    logMemoryInfo() {
        if (!this.renderer) {
            console.log('RTW: renderer 未初始化')
            return
        }
        const info = this.renderer.info
        console.log(
            '%c RTW Memory Info %c geometries: %d, textures: %d, programs: %d',
            `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${color}; font-weight: bold;`,
            'color: #aaa;',
            info.memory.geometries,
            info.memory.textures,
            info.programs?.length || 0
        )
    }

    _logDebugInfo() {
        console.log(
            `%c    RenderTheWorld%c by xiaochen004hao\n      https://github.com/RenderTheWorld/RenderTheWorld\n      Version: ${this.ext.$version}`,
            `background-image: url("${chen_RenderTheWorld_icon}");
             background-size: contain;
             background-repeat: no-repeat;
             padding: 10px;
             color: #def;
             font-weight: bold;
             font-size: 25px;
             font-family: serif;
            `,
            'color: #aaa;'
        )
        if (this.ext.$inMainWorkspace()) {
            this.domUtils.setGlobal(
                'RTW',
                {
                    THREE,
                    Extension: this.ext,
                    VM: this.ext.vm,
                    ScratchBlocks: this.ext.ScratchBlocks,
                    scratchInstance: this.ext.Scratch,
                    logMemoryInfo: () => this.logMemoryInfo()
                },
                true
            )

            console.log(
                '%c RTW Developer %c 🔓ON ',
                `padding: 2px 1px; border: 1.5px solid ${color_secondary}; border-right: none; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, ${color}); font-weight: bold;`,
                `padding: 2px 1px; border: 1.5px solid ${color_secondary}; border-left: none; border-radius: 0 3px 3px 0; color: #fff; background: ${color}; font-weight: bold;`
            )
            console.log(
                '%c Internal RTW Extension: %c (RTW.Extension) \n %o',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.Extension
            )
            console.log(
                '%c Three JS: %c               (RTW.THREE) \n %o',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.THREE
            )
            console.log(
                '%c Scratch Blocks: %c         (RTW.ScratchBlocks) \n %o',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.ScratchBlocks
            )
            console.log(
                '%c Scratch VM: %c             (RTW.VM) \n %o',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.VM
            )
        } else {
            console.log(
                '%c RTW Developer %c 🔒OFF ',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${color}; font-weight: bold;`,
                `padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: ${color}; font-weight: bold;`
            )
        }
    }
}

export default RenderEngine
