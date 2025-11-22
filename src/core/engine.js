import FormatMessager from './format.js';
import * as THREE from 'three';

import { Skins } from '../utils/canvasSkin';
import { color, color_secondary } from '../assets/index.js'


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
        console.log(
            `%c RTW Developer %c ${this.inMainWorkspace() ? '🔓ON' : '🔒OFF'} `,
            `padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: ${color}; font-weight: bold; height: 100%;`,
            `padding: 2px 1px; border-radius: 0 3px 3px 0; color: #fff; background: ${this.inMainWorkspace() ? color_secondary : color}; font-weight: bold; height: 100%;`,
        );

    }

    init(color, sizex, sizey, ed, shadowMapType) {

    }

    render() {

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
