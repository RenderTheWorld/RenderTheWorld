/* eslint-disable no-unused-vars */
/**
 * Extension —— 渲染世界扩展主对象
 *
 * 持有运行时、虚拟机、ScratchBlocks、渲染引擎、日志等核心组件引用，
 * 作为各积木分组访问扩展能力的统一入口。
 */

// 类型导入仅用于 JSDoc 类型注解，运行时无需导入
import { chen_RenderTheWorld_extensionId } from '../assets/index.js'

/**
 * @typedef {import('./renderengine.js').default} RenderEngine
 * @typedef {import('./extcore.js').default} ExtensionCore
 */

class Extension {
    constructor() {
        this.$version = 'Alpha 0.1.0'

        /** @type {import('scratch-vm').Runtime} */
        this.runtime = null
        /** @type {import('scratch-vm')} */
        this.vm = null
        /** @type {any} */
        this.ScratchBlocks = null

        /** @type {Scratch} */
        this.Scratch = null

        /** @type {ExtensionCore} */
        this.core = null
        /** @type {RenderEngine} */
        this.renderEngine = null

        /** @type {import('../utils/logger.js').default} */
        this.logger = null

        /** @type {{toNumber: (v: any) => number, toString: (v: any) => string, toBoolean: (v: any) => boolean}} Cast 工具（数值/字符串/布尔转换） */
        this.cast = null

        /** 使用教程地址（docsURI，显示在扩展库的"文档"按钮） */
        this.docsURI =
            'https://learn.ccw.site/article/0d8196d6-fccf-4d92-91b8-ee918a733237'

        /** API 文档地址（所有积木 API 接口讲解，作为扩展面板首个按钮显示） */
        this.apiDocsURI =
            'https://learn.ccw.site/article/aa0cf6d0-6758-447a-96f5-8e5dfdbe14d6'
    }

    /**
     * 初始化扩展
     * @param {Object} Scratch - Scratch 全局对象（含 vm/runtime/ScratchBlocks 等）
     */
    $initExtension(Scratch) {
        this.runtime = Scratch.runtime
        this.vm = Scratch.vm
        this.ScratchBlocks = Scratch.ScratchBlocks
        this.Scratch = Scratch
        // patchOwner: false 确保补丁只打在 runtime 实例上，不影响其他扩展/运行时
        this.patcher = new Scratch.Patcher(chen_RenderTheWorld_extensionId, {
            patchOwner: false
        })
        // Cast 工具：用于积木参数类型转换
        this.cast = Scratch.Cast || {
            toNumber: v => Number(v) || 0,
            toString: v => String(v),
            toBoolean: v => Boolean(v) || v === 'true'
        }
    }

    /**
     * 是否在主工作区（用于开启开发者调试全局变量）
     */
    $inMainWorkspace() {
        return !!this.ScratchBlocks?.getMainWorkspace?.()
    }

    /**
     * 打开 API 文档
     */
    openDocs() {
        const a = document.createElement('a')
        a.href = this.docsURI
        a.rel = 'noopener noreferrer'
        a.target = '_blank'
        a.click()
    }
}

export default Extension
