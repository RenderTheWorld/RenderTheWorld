/* eslint-disable max-classes-per-file */

/**
 * RenderTheWorld —— 渲染世界扩展入口
 *
 * 职责：
 *   1. 环境检查与兼容实例创建
 *   2. 初始化核心组件（Extension / RenderEngine / ExtensionCore）
 *   3. 注册 Scratch 劫持（OUTPUT 块 / Gandi 菜单）
 *   4. 注册可扩展积木
 *   5. 对外提供 getInfo() 返回积木信息
 *
 * 架构：
 *   index.js (入口)
 *     ├── core/main.js (Extension 主对象)
 *     ├── core/renderengine.js (渲染引擎)
 *     ├── patches/index.js (Scratch 劫持)
 *     ├── blocks/index.js (积木聚合)
 *     ├── rendering/* (渲染工具)
 *     ├── scratch/* (Scratch 环境工具)
 *     ├── blockly/* (Blockly 增强)
 *     ├── platform/* (平台适配)
 *     └── common/* (通用工具)
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

import { createScratchInstance } from './scratch/instance.js'
import Logger from './common/logger.js'
import { loadBlocks } from './blocks/index.js'
import {
    hackFun,
    refactoringVisualReport,
    inMainWorkspace
} from './scratch/tools.js'
import { initExpandableBlocks } from './blockly/expandableBlock.js'
import { initMutatorBlocks } from './blockly/mutatorBlock.js'
import { setupNestedCategory } from './blockly/nestedCategory.js'
import { addRTWStyle } from './rendering/RTWTools.js'
import {
    hookOutputBlocks,
    setupGandiAssetMenus,
    setupGandiFileTypes,
    setupTextDropDowns,
    setupFillInShadowDraggable,
    setupHideNestedExtIcon
} from './patches/index.js'

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
            hackFun(extension, BlockType)
            // 2. 自定义监视器/返回值显示
            refactoringVisualReport(extension)
            // 3. OUTPUT 块自定义形状
            hookOutputBlocks(extension)
            // 4. 自定义文本下拉菜单
            setupTextDropDowns(extension)
            // 5. fillIn shadow 块可拖动补丁
            if (this.ScratchBlocks) {
                this._hookCleanups.push(setupFillInShadowDraggable(this))
                // 6. 嵌套同扩展积木图标动态隐藏
                this._hookCleanups.push(setupHideNestedExtIcon(this))
            }
            // 7. Gandi 自定义文件类型（OBJ/MTL/GLTF）注册到文件编辑器
            this._hookCleanups.push(setupGandiFileTypes(this))
            // 6. Gandi 资源文件动态菜单
            setupGandiAssetMenus(this)

            // ============== 主工作区集成 ==============
            if (inMainWorkspace(this)) {
                // 7. 可扩展积木
                initExpandableBlocks(
                    this,
                    rightButton,
                    leftButton,
                    rightSelectButton
                )
                // 9. 下拉驱动动态参数积木（如 mathUtils）
                initMutatorBlocks(this)
                // 10. 嵌套分类（工具栏父分类 + 子分类折叠）
                this._hookCleanups.push(
                    setupNestedCategory({
                        vm: extension.vm,
                        patcher: extension.patcher,
                        extId: chen_RenderTheWorld_extensionId,
                        extName: this.$formatMessage('name'),
                        menuIconURI: chen_RenderTheWorld_icon,
                        color1: color,
                        color2: color_secondary
                    })
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
            // apidocs 按钮放在 blocks 最前面（在所有分组 LABEL 之上）
            this.apidocs = () => {
                window.open(
                    extension.apiDocsURI,
                    '_blank',
                    'noopener,noreferrer'
                )
            }
            const blocks = [
                {
                    blockType: 'button',
                    text: this.$formatMessage('apidocs'),
                    func: 'apidocs'
                },
                ...extension.core.blocks
            ]
            return {
                id: chen_RenderTheWorld_extensionId,
                docsURI: extension.docsURI,
                name: this.$formatMessage('name'),
                blockIconURI: chen_RenderTheWorld_icon,
                menuIconURI: chen_RenderTheWorld_icon,
                color1: color,
                color2: color_secondary,
                color3: color_tertiary,
                blocks,
                menus: extension.core.menus
            }
        }

        /**
         * 扩展卸载时清理所有劫持与资源
         */
        dispose() {
            extension.patcher.unpatchAll()
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
