import * as THREE from 'three';

import { ExtensionCore, RenderEngine } from './engine';


class Extension {
    /**
     * @param {import('scratch-vm').Runtime} _runtime
     */
    constructor(_runtime, vm, ScratchBlocks, Scratch) {
        /** @type {import('scratch-vm').Runtime} */
        this.runtime = _runtime ?? Scratch?.vm?.runtime;
        /** @type {import('scratch-vm')} */
        this.vm = vm;
        /** @type {import('scratch-blocks')} */
        this.ScratchBlocks = ScratchBlocks;

        /** @type {Scratch} */
        this.Scratch = Scratch;

        /** @type {ExtensionCore} */
        this._core;
        /** @type {RenderEngine} */
        this.render_engine;
    }

    /**
     * 兼容性检查
     * @param {object} args
     */
    isWebGLAvailable() {
        this.isWebglAvailable = (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
            } catch(e) {
                return false;
            }
        })();
    }

    /**
     * 兼容性
     * @param {object} args
     * @returns {boolean}
     */
    _isWebGLAvailable() {
        return this.isWebglAvailable;
    }

    /**
     * 初始化
     * @param {object} args
     * @param {number} args.color  背景颜色
     * @param {number} args.sizey  Y轴大小（px）
     * @param {number} args.sizex  X轴大小（px）
     * @param {string} args.ed  是否启用抗锯齿
     * @param {THREE.BasicShadowMap || THREE.PCFShadowMap || THREE.PCFSoftShadowMap || THREE.VSMShadowMap} args.shadowMapType  阴影类型
     */
    init({ color, sizex, sizey, ed, shadowMapType }) {
        this.render_engine.init(this.Scratch.Cast.toNumber(color),
            sizex, sizey,
            this.Scratch.Cast.toString(ed) == 'enable' ? true : false,
            shadowMapType
        );
    }
}

export { Extension };
