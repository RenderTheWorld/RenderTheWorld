/* eslint-disable max-classes-per-file */

/**
 * RenderTheWorld —— 渲染世界扩展入口
 *
 * 职责：
 *   1. 环境检查与兼容实例创建
 *   2. 初始化核心组件（Extension / RenderEngine / ExtensionCore）
 *   3. 注册 Scratch 劫持（OUTPUT 块 / hat_parameter 颜色 / Gandi 菜单）
 *   4. 注册可扩展积木
 *   5. 对外提供 getInfo() 返回积木信息
 *
 * 架构：
 *   index.js (入口)
 *     ├── core/main.js (Extension 主对象)
 *     ├── core/renderengine.js (渲染引擎)
 *     ├── core/hooks.js (Scratch 劫持)
 *     ├── blocks/index.js (积木聚合)
 *     └── utils/* (工具类)
 */

import {
    color,
    color_secondary,
    color_tertiary,
    chen_RenderTheWorld_extensionId,
    chen_RenderTheWorld_picture,
    chen_RenderTheWorld_icon,
    leftButton,
    rightButton,
    rightSelectButton
} from './assets/index.js'

import l10nInit from './l10n/index.js'
import RenderEngine from './core/renderengine.js'
import ExtensionCore from './core/extcore.js'
import Extension from './core/main.js'

import { createScratchInstance } from './utils/scratch-instance.js'
import Logger from './utils/logger.js'
import { loadBlocks } from './blocks/index.js'
import {
    hackFun,
    refactoringVisualReport,
    inMainWorkspace
} from './utils/scratchTools.js'
import { initExpandableBlocks } from './utils/extendableBlock.js'
import { addRTWStyle } from './utils/RTWTools.js'
import {
    hookOutputBlocks,
    setupHatParameterColor,
    setupGandiAssetMenus,
    setupGandiFileTypes
} from './core/hooks.js'

// 可扩展积木按钮样式
addRTWStyle(`
    .RTW-blockbutton {
        cursor: pointer;
    }
    .RTW-blockbutton:hover {
        filter: brightness(150%);
    }
`)

;(function (Scratch) {
    'use strict'

    // ============== 环境检查 ==============
    if (!Scratch.extensions.unsandboxed) {
        throw new Error('RenderTheWorld must be run unsandboxed')
    }
    if (!Scratch.vm?.runtime) {
        throw new Error('RenderTheWorld requires Scratch Runtime')
    }

    // ============== 兼容实例创建 ==============
    const scratchInstance = createScratchInstance(Scratch)
    const { BlockType, ArgumentType, translate, extensions, vm } =
        scratchInstance
    const logger = new Logger(vm.runtime)

    // ============== 核心组件初始化 ==============
    const extension = new Extension()
    extension.$initExtension(scratchInstance)

    /**
     * RenderTheWorld 扩展主类
     */
    class RenderTheWorld {
        constructor() {
            if (!extension.runtime) return

            this.version = extension.$version
            this.runtime = extension.runtime
            this.vm = extension.vm
            this.ScratchBlocks = extension.ScratchBlocks

            // 核心组件
            extension.core = l10nInit(new ExtensionCore(extension))
            extension.renderEngine = new RenderEngine(extension)
            extension.logger = logger

            // ============== Scratch 劫持 ==============
            // 收集清理函数，扩展卸载时统一调用
            /** @type {(() => void)[]} */
            this._hookCleanups = []

            // 1. BlockType.XML 支持
            hackFun(this.runtime, Scratch)
            // 2. 自定义监视器/返回值显示
            refactoringVisualReport(this)
            // 3. OUTPUT 块自定义形状
            this._hookCleanups.push(hookOutputBlocks(this.runtime))
            // 4. Gandi 自定义文件类型（OBJ/MTL/GLTF）注册到文件编辑器
            this._hookCleanups.push(setupGandiFileTypes(this))
            // 5. Gandi 资源文件动态菜单
            setupGandiAssetMenus(this)

            // ============== 主工作区集成 ==============
            if (inMainWorkspace(this)) {
                // 6. hat_parameter 颜色修复
                this._hookCleanups.push(
                    setupHatParameterColor(this, this.ScratchBlocks)
                )
                // 7. 可扩展积木
                initExpandableBlocks(
                    this,
                    rightButton,
                    leftButton,
                    rightSelectButton
                )
            }
        }

        /**
         * 翻译积木文本
         */
        $formatMessage(id) {
            return extension.core.translate(id, translate.language)
        }

        /**
         * 加载并注册所有积木分组
         */
        $loadBlocks() {
            loadBlocks(
                extension,
                this,
                extension.core,
                BlockType,
                ArgumentType,
                this.$formatMessage.bind(this)
            )
        }

        getInfo() {
            this.$loadBlocks()
            return {
                id: chen_RenderTheWorld_extensionId,
                docsURI: extension.docsURI,
                name: this.$formatMessage('name'),
                blockIconURI: chen_RenderTheWorld_icon,
                menuIconURI: chen_RenderTheWorld_icon,
                color1: color,
                color2: color_secondary,
                color3: color_tertiary,
                blocks: extension.core.blocks,
                menus: extension.core.menus
            }
        }

        /**
         * 扩展卸载时清理所有劫持与资源
         */
        dispose() {
            // 清理 hooks 劫持
            this._hookCleanups?.forEach(cleanup => {
                try {
                    cleanup()
                } catch {
                    /* 忽略 */
                }
            })
            this._hookCleanups = []
            // 清理渲染引擎
            extension.renderEngine?.destroy()
        }
    }

    // ============== 注册扩展 ==============
    const extensionInstance = new RenderTheWorld()
    extensions.register(extensionInstance)

    // 保留原有注册信息
    window.IIFEExtensionInfoList = window.IIFEExtensionInfoList || [{}]
    const targetInfo = window.IIFEExtensionInfoList.find(
        info => info.extensionInstance === extensionInstance
    )
    const extensionObject = {
        Extension: RenderTheWorld,
        info: {
            name: 'RenderTheWorld.name',
            description: 'RenderTheWorld.descp',
            extensionId: chen_RenderTheWorld_extensionId,
            iconURL: chen_RenderTheWorld_picture,
            insetIconURL: chen_RenderTheWorld_icon,
            featured: true,
            disabled: false,
            collaborator: 'xiaochen004hao @ CCW',
            collaboratorURL:
                'https://www.ccw.site/student/643bb84051bc32279f0c3fa0',
            collaboratorList: [
                {
                    collaborator: 'xiaochen004hao @ CCW',
                    collaboratorURL:
                        'https://www.ccw.site/student/643bb84051bc32279f0c3fa0'
                },
                {
                    collaborator: 'Fath11 @ Cocrea',
                    collaboratorURL: 'https://cocrea.world/@Fath11'
                }
            ],
            tags: ['developing']
        },
        l10n: {
            'zh-cn': {
                'RenderTheWorld.name': '渲染世界',
                'RenderTheWorld.descp': '积木渲染世界'
            },
            en: {
                'RenderTheWorld.name': 'Render The World',
                'RenderTheWorld.descp': 'Render the world using blocks'
            }
        }
    }
    if (targetInfo) {
        targetInfo.extensionObject = extensionObject
    } else {
        window.IIFEExtensionInfoList[0].extensionObject = extensionObject
    }
    // eslint-disable-next-line no-undef
})(Scratch)
