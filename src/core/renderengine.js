/* eslint-disable no-underscore-dangle */
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

import { Skins } from '../utils/canvasSkin.js'
import {
    chen_RenderTheWorld_icon,
    chen_RenderTheWorld_extensionId,
    color,
    color_secondary
} from '../assets/index.js'
import RendererAdapter from '../adapters/rendererAdapter.js'
import DOMUtils from '../utils/dom.js'
import { RTW_Model_Box, Wrapper } from '../utils/RTWTools.js'
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
        /** Loaders（供分组使用，避免分组静态 import three） */
        this.GLTFLoader = GLTFLoader
        this.OBJLoader = OBJLoader
        this.MTLLoader = MTLLoader
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

        // ============== Three.js 基础对象 ==============
        this.renderer = null
        this.scene = null
        this.camera = null
        this.controls = null

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

        // 项目停止时轻量清理 Three.js 资源（不销毁 skin/drawable/canvas）
        // 与旧版 _listener 中 PROJECT_STOP_ALL 逻辑一致
        const runtime = ext.runtime
        const onStopAll = () => this._stopRender()
        runtime.on('PROJECT_STOP_ALL', onStopAll)
        this._cleanups.push(() => {
            runtime.off('PROJECT_STOP_ALL', onStopAll)
        })

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
    //  2. Three.js 初始化
    // ============================================================

    /**
     * 初始化 Three.js 渲染器、场景、相机、控制器
     * @param {number|string} [backgroundColor] - 背景色
     * @param {boolean} [antialias=true] - 是否启用抗锯齿（仅首次生效）
     * @param {number|string} [shadowMapType] - 阴影类型
     * @param {number} [sizex] - 渲染宽度
     * @param {number} [sizey] - 渲染高度
     */
    init(backgroundColor, antialias = true, shadowMapType, sizex, sizey) {
        if (this._destroyed) return

        // 开始新的会话（使旧的异步加载回调失效）
        this.sessionGuard.begin()

        // 已初始化：仅更新可变参数
        if (this._initialized) {
            this._applyBackground(backgroundColor)
            this._applyShadowMapType(shadowMapType)
            if (sizex && sizey) {
                this._applySize(sizex, sizey)
            }
            // 旧版 init 时重置 isTcShow = false
            this._isTcShow = false
            if (this.threeSkin) this.threeSkin.setContent(this.nullCanvas)
            this.setDirty3D()
            return
        }

        try {
            // 渲染器
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.tc,
                antialias: antialias !== false,
                alpha: true,
                powerPreference: 'high-performance',
                desynchronized: true
            })
            this.renderer.setPixelRatio(1)
            // 旧版 setClearColor('#000000')；新版用透明背景以支持 Scratch 舞台穿透
            this.renderer.setClearColor(0x000000, 0)
            if (sizex && sizey) this._applySize(sizex, sizey)
            this.renderer.setSize(this._renderWidth, this._renderHeight, false)
            // 旧版设 outputColorSpace = SRGBColorSpace
            this.renderer.outputColorSpace = THREE.SRGBColorSpace
            this.renderer.shadowMap.enabled = true
            this.renderer.shadowMap.type = THREE.PCFShadowMap
            this._applyShadowMapType(shadowMapType)

            // 场景
            this.scene = new THREE.Scene()
            this._applyBackground(backgroundColor)

            // 相机（旧版 fov=40，aspect=画布宽高比）
            const canvas = this.ext.runtime.renderer.canvas
            const aspect =
                canvas.width / canvas.height ||
                this._renderWidth / this._renderHeight ||
                16 / 9
            this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000)

            // 控制器（旧版绑定到 runtime.renderer.canvas，显式禁用所有操作）
            this.controls = new OrbitControls(this.camera, canvas)
            this.controls.enabled = false
            this.controls.enableDamping = false
            this.controls.enablePan = false
            this.controls.enableZoom = false
            this.controls.enableRotate = false
            this.controls.update()

            // 旧版在 init 时创建环境光和半球光（黑色，占位）
            this.lights.ambient = new THREE.AmbientLight(0x000000)
            this.scene.add(this.lights.ambient)
            this.lights.hemisphere = new THREE.HemisphereLight(
                0x000000,
                0x000000
            )
            this.scene.add(this.lights.hemisphere)

            this._initialized = true

            // 旧版 init 时 isTcShow = false，显示空白画布
            this._isTcShow = false
            if (this.threeSkin) this.threeSkin.setContent(this.nullCanvas)

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

    /**
     * 应用渲染尺寸
     */
    _applySize(sizex, sizey) {
        this._renderWidth = sizex
        this._renderHeight = sizey
        if (this.renderer) this.renderer.setSize(sizex, sizey, false)
        if (this.tc) {
            this.tc.width = sizex
            this.tc.height = sizey
        }
    }

    _applyBackground(backgroundColor) {
        if (!this.scene || backgroundColor == null || backgroundColor === '')
            return
        try {
            // 旧版用 Cast.toNumber(color) 确保数字类型
            // THREE.Color 对字符串 '0' 会走 setStyle 找颜色名导致报错
            // 对数字 0 则走 setHex(0) 正确得到黑色
            const cast = this.ext.cast
            const colorVal = cast
                ? cast.toNumber(backgroundColor)
                : Number(backgroundColor)
            this.scene.background = new THREE.Color(colorVal)
        } catch {
            /* 非法颜色值忽略 */
        }
    }

    _applyShadowMapType(shadowMapType) {
        if (!this.renderer || shadowMapType == null || shadowMapType === '')
            return
        const map = {
            BasicShadowMap: THREE.BasicShadowMap,
            PCFShadowMap: THREE.PCFShadowMap,
            PCFSoftShadowMap: THREE.PCFSoftShadowMap,
            VSMShadowMap: THREE.VSMShadowMap
        }
        this.renderer.shadowMap.type =
            typeof shadowMapType === 'string'
                ? map[shadowMapType] || THREE.PCFShadowMap
                : shadowMapType
    }

    // ============================================================
    //  3. Scratch draw 拦截（脏标记驱动）
    // ============================================================

    _hookScratchDraw() {
        if (this._drawHooked) return
        const scratchRenderer = this.ext.runtime.renderer
        this._originalDraw = scratchRenderer.draw.bind(scratchRenderer)
        this._drawHooked = true

        const self = this
        scratchRenderer.draw = function () {
            try {
                if (!self._destroyed && self._initialized) {
                    self._syncLayerOnce()
                    self._updateAnimations()
                    if (self._dirty3D) {
                        self._renderThree()
                        self._dirty3D = false
                        self._needsScratchRedraw = true
                    }
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
            this.renderer.render(this.scene, this.camera)
            this.threeSkin.setContent(this.tc)
        } else {
            this.threeSkin.setContent(this.nullCanvas)
        }
        // 控制器更新（旧版 render 中始终调用 controls.update()）
        this.controls?.update()
    }

    /**
     * 推进所有动画混合器（自动计算帧间隔）
     */
    _updateAnimations() {
        const names = Object.keys(this.animations)
        if (names.length === 0) return
        const now = performance.now()
        const dt = this._lastAnimTime
            ? (now - this._lastAnimTime) / 1000
            : 0
        this._lastAnimTime = now
        this.sceneManager.updateAnimations(dt)
    }

    // ============================================================
    //  4. RAF 唤醒循环
    // ============================================================

    _startRafLoop() {
        const loop = () => {
            if (this._destroyed || !this._initialized) return
            if (!document.hidden && this._needsScratchRedraw) {
                this.rendererAdapter.requestRedraw()
                this._needsScratchRedraw = false
            }
            this._rafId = requestAnimationFrame(loop)
        }
        loop()
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
        if (this.renderer) this.renderer.setSize(targetW, targetH, false)
        if (this.tc) {
            this.tc.width = targetW
            this.tc.height = targetH
        }
        this.controls?.handleResize?.()

        this._currentResolution = targetW / this._stageWidth
        this.setDirty3D()
    }

    // ============================================================
    //  6. 对外 API
    // ============================================================

    /**
     * 标记 3D 场景为脏
     */
    setDirty3D() {
        this._dirty3D = true
        this._needsScratchRedraw = true
    }

    /**
     * 切换当前相机
     * @param {THREE.Camera|RTW_Model_Box|Wrapper|string} camera
     */
    setActiveCamera(camera) {
        const obj = this.getModel(camera)
        if (obj && obj.isCamera) {
            this.camera = obj
            if (this.controls) this.controls.object = obj
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
     * 与旧版 _listener 中 PROJECT_STOP_ALL 逻辑一致：
     *   - 停止动画循环
     *   - 释放 material/geometry/scene/controls
     *   - 不销毁 tc canvas / skin / drawable（保留以便重新 init）
     *   - 不设置 _destroyed（允许重新 init）
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
        this.controls?.dispose()
        this.controls = null

        // 释放场景中的 material/geometry，然后清空场景
        if (this.scene) {
            this.scene.traverse(child => {
                if (child.material) child.material.dispose()
                if (child.geometry) child.geometry.dispose()
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
        this.lights = Object.create(null)

        // 重置显示状态（旧版 isTcShow 在 init 时重置）
        this._isTcShow = false
        if (this.threeSkin) this.threeSkin.setContent(this.nullCanvas)

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
                    scratchInstance: this.ext.Scratch
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
