import FormatMessager from './format.js';


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

export default ExtensionCore;
