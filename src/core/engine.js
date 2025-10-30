import FormatMessager from './format.js';
import * as THREE from 'three';

import { Skins } from '../utils/canvasSkin';


class ExtensionCore {
    constructor(ext, vm, ScratchBlocks) {
        this.ext = ext;
        this.vm = vm;
        this.ScratchBlocks = ScratchBlocks;
        this._format = new FormatMessager();
        this._blocks = [];
        this._menus = {};
    }

    get blocks() {
        return this._blocks;
    }

    get menus() {
        return this._menus;
    }

    cleanBlocks() {
        this._blocks = [];
    }

    cleanMenus() {
        this._menus = {};
    }

    registerBlock(block) {
        this._blocks.push(block);
        return this;
    }

    registerBlankLine() {
        this._blocks.push("---");
        return this;
    }


    registerMenu(meunid, menu) {
        this._menus[meunid] = menu;
        return this;
    }

    registerBlockFinish(func) {
        this._blocks.forEach(func);
    }

    translate(key, lang) {
        return this._format.translate(key, lang);
    }

    loadformat(l10n = {}) {
        this._format.load(l10n);
    }
}

class RenderEngine {
    constructor(ext) {
        this.ext = ext;
        console.log('RTW', this.inMainWorkspace());
        if (this.inMainWorkspace()) {
            // 重新实现“output”和“outputShape”块参数
            const cbfsb = this.ext.runtime._convertBlockForScratchBlocks.bind(
                this.ext.runtime,
            );
            this.ext.runtime._convertBlockForScratchBlocks = function (
                blockInfo,
                categoryInfo,
            ) {
                const res = cbfsb(blockInfo, categoryInfo);
                if (blockInfo.outputShape) {
                    if (!res.json.outputShape)
                        res.json.outputShape = blockInfo.outputShape;
                }
                if (blockInfo.output) {
                    if (!res.json.output) res.json.output = blockInfo.output;
                }
                if (!res.json.branchCount)
                    res.json.branchCount = blockInfo.branchCount;
                return res;
            };
        }

        this.ext.isWebGLAvailable();
        if (!this.ext.isWebglAvailable) {
            window.alert(
                'RenderTheWorld:\nYour graphics card does not seem to support WebGL 2',
            );
        }

        // 渲染器
        /** @type {THREE.WebGLRenderer} */
        this.renderer = null;
        // 场景
        /** @type {THREE.Scene} */
        this.scene = null;

        // 相机配置
        this.fov = 75;
        this.aspect = 2;
        this.near = 0.1;
        this.far = 5;
        /** @type {THREE.Camera} */
        this.camera = null;

        // 环境光
        /** @type {THREE.AmbientLight} */
        this.ambient_light = null;
        // 半球光
        /** @type {THREE.HemisphereLight} */
        this.hemisphere_light = null;

        // 物体
        this.objects = {};

        // 动画
        this.animations = {};

        // 渲染canvas
        /** @type {HTMLDivElement} */
        this.tc = document.createElement('canvas');
        this.tc.className = 'RenderTheWorld';
        this.isTcShow = false;
        this.NullCanvas = document.createElement('canvas');

        // threejs skin
        let index = this.ext.runtime.renderer._groupOrdering.indexOf('video');
        this.ext.runtime.renderer._groupOrdering.splice(
            index + 1,
            0,
            'RenderTheWorld',
        );
        this.ext.runtime.renderer._layerGroups['RenderTheWorld'] = {
            groupIndex: 0,
            drawListOffset: this.ext.runtime.renderer._layerGroups['video'].drawListOffset,
        };
        for (let i = 0; i < this.ext.runtime.renderer._groupOrdering.length; i++) {
            this.ext.runtime.renderer._layerGroups[
                this.ext.runtime.renderer._groupOrdering[i]
            ].groupIndex = i;
        }

        // Create drawable and skin
        this.threeSkinId = this.ext.runtime.renderer._nextSkinId++;
        let SkinsClass = new Skins(this.ext.runtime);
        this.threeSkin = new SkinsClass.CanvasSkin(
            this.threeSkinId,
            this.ext.runtime.renderer,
        );
        this.threeSkin.setContent(this.NullCanvas);
        // this.threeSkin.setContent(this.NullCanvas); // 修复一加载扩展物体就显示画布的问题
        this.ext.runtime.renderer._allSkins[this.threeSkinId] = this.threeSkin;

        // threejs drawable layer
        this.threeDrawableId =
            this.ext.runtime.renderer.createDrawable('RenderTheWorld');
        this.ext.runtime.renderer.updateDrawableSkinId(
            this.threeDrawableId,
            this.threeSkinId,
        );
    }

    init(color, sizex, sizey, ed, shadowMapType) {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.tc,
            antialias: ed,
            // context: this.tc.getContext('webgl2'),
        });
        this.renderer.setClearColor("#000000");
        this.camera = new THREE.PerspectiveCamera(this.fov, this.aspect, this.near, this.far);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(color);

        this.renderer.setAnimationLoop(this.render);
        this.render();
    }

    render() {
        if (this.isTcShow) {
            this.renderer.render(this.scene, this.camera);
            this.threeSkin.setContent(this.tc);
            this.ext.runtime.requestRedraw();
        } else {
            this.threeSkin.setContent(this.NullCanvas);
            this.ext.runtime.requestRedraw();
        }
    }

    /**
     * 改编自系统工具
     */
    inMainWorkspace() {
        const ur1 = window.location.pathname;
        const rege = /\/(?:gandi|creator)(?:\/|$)/;
        return rege.test(ur1) && this.ext.ScratchBlocks.getMainWorkspace() !== null;
    };
}

export { ExtensionCore, RenderEngine };
