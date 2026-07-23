import FormatMessager from '../l10n/format.js'

class ExtensionCore {
    /**
     * @param {import('./main.js').default} ext
     */
    constructor(ext) {
        this.ext = ext
        this.vm = ext.vm
        this.ScratchBlocks = ext.ScratchBlocks
        this._format = new FormatMessager()
        /** @type {any[]} */
        this._blocks = []
        /** @type {{[key: string]: any}} */
        this._menus = {}
    }

    get blocks() {
        return this._blocks
    }

    get menus() {
        return this._menus
    }

    cleanBlocks() {
        this._blocks = []
    }

    cleanMenus() {
        this._menus = {}
    }

    /**
     * @param {any} block
     */
    registerBlock(block) {
        this._blocks.push(block)
        return this
    }

    registerBlankLine() {
        this._blocks.push('---')
        return this
    }

    /**
     * @param {string} meunid
     * @param {any} menu
     */
    registerMenu(meunid, menu) {
        this._menus[meunid] = menu
        return this
    }

    /**
     * @param {(block: any) => void} func
     */
    registerBlockFinish(func) {
        this._blocks.forEach(func)
    }

    /**
     * @param {string} key
     * @param {string} [lang]
     */
    translate(key, lang) {
        return this._format.translate(key, lang)
    }

    /**
     * @param {Object} [l10n]
     */
    loadformat(l10n = {}) {
        this._format.load(l10n)
    }
}

export default ExtensionCore
