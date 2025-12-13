import * as THREE from 'three/webgpu';

import { Skins } from '../utils/canvasSkin.js';
import { chen_RenderTheWorld_icon, color, color_secondary } from '../assets/index.js'
import Extension from './main.js';

class RenderEngine {
    /**
     * @param {Extension} ext 
     */
    constructor(ext) {
        this.ext = ext;
        this.THREE = THREE;

        // 渲染状态
        this.isRendering = false;
        this.renderReqId = null;

        // 1. 创建离屏 Canvas
        this.tc = document.createElement('canvas');
        this.tc.width = 1287;
        this.tc.height = 724;
        this.tc.style.display = 'none'; 
        
        // 挂载到 DOM 以防万一（某些浏览器策略），虽然 display none
        if (this.ext.runtime.renderer.canvas.parentElement) {
            this.ext.runtime.renderer.canvas.parentElement.append(this.tc);
        }

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
        const renderer = this.ext.runtime.renderer;
        let index = renderer._groupOrdering.indexOf('video');
        if (index === -1) index = 0; 
        
        // 防止重复添加
        if (renderer._groupOrdering.indexOf('RenderTheWorld') === -1) {
            renderer._groupOrdering.splice(index + 1, 0, 'RenderTheWorld');
        }

        const videoLayer = renderer._layerGroups['video'];
        const drawListOffset = videoLayer ? videoLayer.drawListOffset : 0;

        renderer._layerGroups['RenderTheWorld'] = {
            groupIndex: index + 1,
            drawListOffset: drawListOffset,
        };

        // 更新后续层级索引
        for (let i = 0; i < renderer._groupOrdering.length; i++) {
            const groupName = renderer._groupOrdering[i];
            if(renderer._layerGroups[groupName]) {
                 renderer._layerGroups[groupName].groupIndex = i;
            }
        }
    }

    _createSkin() {
        this.threeSkinId = this.ext.runtime.renderer._nextSkinId++;
        let SkinsClass = new Skins(this.ext.runtime);
        this.threeSkin = new SkinsClass.CanvasSkin(
            this.threeSkinId,
            this.ext.runtime.renderer,
        );
        
        this.threeSkin.setContent(this.tc); 
        this.ext.runtime.renderer._allSkins[this.threeSkinId] = this.threeSkin;

        this.threeDrawableId = this.ext.runtime.renderer.createDrawable('RenderTheWorld');
        this.ext.runtime.renderer.updateDrawableSkinId(
            this.threeDrawableId,
            this.threeSkinId,
        );

        const drawable = this.ext.runtime.renderer._allDrawables[this.threeDrawableId];
        if (drawable) {
             drawable.updateVisible(true);
        }
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
            globalThis.RTW = {
                THREE: THREE,
                Extension: this.ext,
                VM: this.ext.vm,
                ScratchBlocks: this.ext.ScratchBlocks,
            };

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

        // 渲染器
        this.renderer = new THREE.WebGPURenderer({
            canvas: this.tc,
            context: this.tc.getContext('webgl2'),
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(1287, 724); // 匹配 Scratch 舞台

        // 场景
        this.scene = new THREE.Scene();

        // 摄像机
        this.camera = new THREE.PerspectiveCamera(75, 480 / 360, 0.1, 1000);
        this.camera.position.z = 5;
    }

    /**
     * 开启渲染循环
     */
    startRenderLoop() {
        if (this.isRendering) return;
        this.isRendering = true;
        this._loop();
    }

    _loop() {
        if (!this.isRendering) return;

        this.render();
        this.renderReqId = requestAnimationFrame(this._loop.bind(this));
    }

    /**
     * 单帧渲染逻辑
     */
    render() {
        if (!this.renderer || !this.scene || !this.camera) return;

        // 1. Three.js 渲染场景
        this.renderer.render(this.scene, this.camera);

        // 2. 更新 Scratch 皮肤 (关键步骤)
        if (this.threeSkin) {
            // 这里的 setContent 会调用 canvasSkin.js 中的优化逻辑 (texSubImage2D)
            this.threeSkin.setContent(this.tc);
        }
        
        // 3. 触发 Scratch 重绘 (如果需要)
        this.ext.runtime.requestRedraw();
    }
}

export default RenderEngine;