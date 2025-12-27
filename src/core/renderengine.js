import * as THREE from 'three/webgpu';

import { Skins } from '../utils/canvasSkin.js';
import { chen_RenderTheWorld_icon, color, color_secondary } from '../assets/index.js'
import Extension from './main.js';
import RendererAdapter from '../adapters/rendererAdapter.js';
import DOMUtils from '../utils/dom.js';

class RenderEngine {
    /**
     * @param {Extension} ext 
     */
    constructor(ext) {
        this.ext = ext;
        this.THREE = THREE;

        // 初始化适配器
        this.rendererAdapter = new RendererAdapter(ext.runtime);
        this.domUtils = new DOMUtils();

        // 渲染状态
        this.isRendering = false;
        this.renderReqId = null;

        // 1. 创建离屏 Canvas
        this.tc = this.domUtils.createCanvas(1287, 724, true);
        
        // 挂载到 DOM 以防万一（某些浏览器策略），虽然 display none
        this.domUtils.appendTo(this.tc, this.ext.runtime.renderer.canvas.parentElement);

        // 2. 插入 Scratch 渲染层级
        this._injectLayer();

        // 3. 创建 Scratch Skin 和 Drawable
        this._createSkin();

        // 4. 初始化 Three.js 基础组件 (延迟到 init 调用或首次使用)
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this._logDebugInfo();
    }

    _injectLayer() {
        this.rendererAdapter.injectLayer('RenderTheWorld', 'video');
    }

    _createSkin() {
        this.threeSkinId = this.rendererAdapter.createSkinId();
        let SkinsClass = new Skins(this.ext.runtime);
        this.threeSkin = new SkinsClass.CanvasSkin(
            this.threeSkinId,
            this.ext.runtime.renderer,
        );
        
        this.rendererAdapter.registerSkin(this.threeSkinId, this.threeSkin);

        this.threeDrawableId = this.rendererAdapter.createDrawable('RenderTheWorld');
        this.rendererAdapter.updateDrawableSkinId(
            this.threeDrawableId,
            this.threeSkinId,
        );

        this.threeSkin.setContent(this.tc); 

        this.rendererAdapter.setDrawableVisible(this.threeDrawableId, true);
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
            'color: #aaa;',
        );
        if (this.ext.$inMainWorkspace()) {
            this.domUtils.setGlobal('RTW', {
                THREE: THREE,
                Extension: this.ext,
                VM: this.ext.vm,
                ScratchBlocks: this.ext.ScratchBlocks,
                scratchInstance: this.ext.Scratch,
            }, true);

            console.log(
                '%c RTW Developer %c 🔓ON ',
                `padding: 2px 1px; border: 1.5px solid ${color_secondary}; border-right: none; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, ${color}); font-weight: bold;`,
                `padding: 2px 1px; border: 1.5px solid ${color_secondary}; border-left: none; border-radius: 0 3px 3px 0; color: #fff; background: ${color}; font-weight: bold;`
            );
            console.log(
                "%c Internal RTW Extension: %c (RTW.Extension) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.Extension
            );
            console.log(
                "%c Three JS: %c               (RTW.THREE) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.THREE
            );
            console.log(
                "%c Scratch Blocks: %c         (RTW.ScratchBlocks) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.ScratchBlocks
            );
            console.log(
                "%c Scratch VM: %c             (RTW.VM) \n %o",
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: linear-gradient(to right, ${color_secondary}, rgba(0, 0, 0, 0))`,
                'color: #aaa;',
                RTW.VM
            );
        } else {
            console.log(
                '%c RTW Developer %c 🔒OFF ',
                `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${color}; font-weight: bold;`,
                `padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: ${color}; font-weight: bold;`
            );
        }
    }

    /**
     * 初始化 Three.js 环境
     */
    init() {
        if (this.renderer) return; // 防止重复初始化

        try {
            // 渲染器 - 优化配置
            this.renderer = new THREE.WebGPURenderer({
                canvas: this.tc,
                context: this.tc.getContext('webgl2'),
                antialias: false, // 禁用抗锯齿以提升性能
                alpha: true,
                powerPreference: "high-performance",
                precision: "mediump" // 使用中等精度
            });
            this.renderer.setSize(1287, 724);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比例

            // 场景 - 启用视锥剔除
            this.scene = new THREE.Scene();
            this.scene.matrixAutoUpdate = false; // 手动控制矩阵更新

            // 摄像机 - 优化参数
            this.camera = new THREE.PerspectiveCamera(75, 1287 / 724, 0.1, 1000);
            this.camera.position.z = 5;
            this.camera.matrixAutoUpdate = false; // 手动控制矩阵更新

        } catch (error) {
            console.error('RenderTheWorld: Failed to initialize Three.js:', error);
            this.dispose();
            throw error;
        }
    }

    /**
     * 清理资源
     */
    dispose() {
        // 停止渲染循环
        this.stopRenderLoop();

        // 清理 Three.js 资源
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }

        // 清理场景
        if (this.scene) {
            // 清理场景中的所有对象
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
            this.scene = null;
        }

        this.camera = null;
    }

    /**
     * 停止渲染循环
     */
    stopRenderLoop() {
        this.isRendering = false;
        if (this.renderReqId) {
            cancelAnimationFrame(this.renderReqId);
            this.renderReqId = null;
        }
    }

    /**
     * 开启渲染循环
     */
    startRenderLoop() {
        if (this.isRendering) return;
        this.isRendering = true;
        this.lastFrameTime = 0;
        this._loop();
    }

    _loop = (currentTime = 0) => {
        if (!this.isRendering) return;

        // 简单的帧率控制 (约60fps)
        if (currentTime - this.lastFrameTime >= 16.67) {
            this.render();
            this.lastFrameTime = currentTime;
        }

        this.renderReqId = requestAnimationFrame(this._loop);
    }

    /**
     * 单帧渲染逻辑 - 优化版本
     */
    render() {
        // 快速检查是否需要渲染
        if (!this.renderer || !this.scene || !this.camera || !this.threeSkin) return;

        // 1. Three.js 渲染场景
        this.renderer.render(this.scene, this.camera);

        // 2. 更新 Scratch 皮肤 (关键步骤)
        this.threeSkin.setContent(this.tc);
        
        // 3. 触发 Scratch 重绘
        this.rendererAdapter.requestRedraw();
    }
}

export default RenderEngine;