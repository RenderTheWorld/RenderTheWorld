/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * Hooks —— Scratch 内部机制劫持
 *
 * 集中管理所有对 Scratch 内部方法的劫持，让 index.js 保持简洁：
 *   1. hookOutputBlocks: 补回 OUTPUT 块的 outputShape/output/branchCount 字段
 *   2. setupHatParameterColor: objectLoadingCompleted 的 ccw_hat_parameter 颜色修复
 *   3. setupGandiAssetMenus: Gandi 资源文件动态菜单
 *
 * 设计原则：
 *   - 每个劫持都是独立函数，返回一个清理函数（便于卸载）
 *   - 劫持逻辑集中在一处，便于维护和调试
 */

import { chen_RenderTheWorld_extensionId } from '../assets/index.js'
import { addFileType } from '../utils/gandiAssetTools.js'

/**
 * 劫持 _convertBlockForScratchBlocks，适配 OUTPUT 类型块
 *
 * Gandi/TurboWarp 的 BlockType 枚举都没有 OUTPUT 类型，需要回退为标准类型：
 *
 * 适配策略（兼容 Gandi 和 TurboWarp）：
 *   - branchCount=0 的 OUTPUT 块 → 回退为 COMMAND，删除 previousStatement/nextStatement，手动覆盖 output
 *     这样块只有 output 连接（无上下连接），呈现为方形 reporter 块
 *   - branchCount>0 的 OUTPUT 块 → 回退为 CONDITIONAL，手动覆盖 output
 *     CONDITIONAL 提供 C 块分支 + 方形外观，手动添加 output 实现输出连接（如 makeMaterial）
 *
 * @param {Extension} ext - 扩展核心组件
 */
export function hookOutputBlocks(ext) {
    // 重新实现“output”和“outputShape”块参数
    ext.patcher.patch(ext.runtime, '_convertBlockForScratchBlocks', {
        after: function (res, blockInfo, categoryInfo) {
            if (blockInfo.outputShape) {
                if (!res.json.outputShape)
                    res.json.outputShape = blockInfo.outputShape
            }
            if (blockInfo.output) {
                if (!res.json.output) res.json.output = blockInfo.output
            }
            if (!res.json.branchCount)
                res.json.branchCount = blockInfo.branchCount

            return res
        }
    })
}

/**
 * 设置 objectLoadingCompleted 事件帽的 ccw_hat_parameter 颜色
 *
 * Gandi 中 ccw_hat_parameter 默认颜色与 RTW 扩展不协调，
 * 需要将其颜色修改为 RTW 主题色。
 *
 * @param {Object} extension - RenderTheWorld 实例
 * @param {Object} ScratchBlocks
 */
export function setupHatParameterColor(extension, ScratchBlocks) {
    extension._RTW_hat_parameters = new Set()

    extension.objectLoadingCompletedUpdate = () => {
        const ws = ScratchBlocks.getMainWorkspace()
        if (!ws) return
        ;[...ws.getAllBlocks(), ...ws.getFlyout().getWorkspace().getAllBlocks()]
            .filter(block => block.type === 'ccw_hat_parameter')
            .forEach(hatParameter => {
                const textEls =
                    hatParameter.svgGroup_?.getElementsByTagName('text')
                if (!textEls || textEls[0]?.textContent !== 'name') return

                let flag =
                    hatParameter['is_RTW_hat_parameter'] === true ||
                    extension._RTW_hat_parameters.has(hatParameter.id)

                let parent = hatParameter.parentBlock_
                while (!flag && parent !== null) {
                    extension._RTW_hat_parameters.add(hatParameter.id)
                    if (
                        parent.type ===
                        chen_RenderTheWorld_extensionId +
                            '_objectLoadingCompleted'
                    ) {
                        flag = true
                        break
                    }
                    parent = parent.parentBlock_
                }

                if (flag) {
                    hatParameter['is_RTW_hat_parameter'] = true
                    hatParameter.colour_ = hatParameter.svgPath_.style.fill =
                        '#121C3D'
                    hatParameter.colourTertiary_ =
                        hatParameter.svgPath_.style.stroke = '#4A76FF'
                }
            })

        // 清理已删除的 hat_parameter id
        extension._RTW_hat_parameters.forEach(id => {
            if (ScratchBlocks.getMainWorkspace().getBlockById(id) === null) {
                extension._RTW_hat_parameters.delete(id)
            }
        })
    }

    const runtime = extension.runtime
    const vm = extension.vm
    runtime.on(
        'TOOLBOX_EXTENSIONS_NEED_UPDATE',
        extension.objectLoadingCompletedUpdate
    )
    runtime.on('TARGET_BLOCKS_CHANGED', extension.objectLoadingCompletedUpdate)

    setTimeout(() => {
        extension.objectLoadingCompletedUpdate()
    }, 1000)

    return () => {
        runtime.off(
            'TOOLBOX_EXTENSIONS_NEED_UPDATE',
            extension.objectLoadingCompletedUpdate
        )
        runtime.off(
            'TARGET_BLOCKS_CHANGED',
            extension.objectLoadingCompletedUpdate
        )
    }
}

/**
 * 注册 Gandi 自定义文件类型（OBJ/MTL/GLTF）到文件编辑器
 *
 * 使 Gandi 文件编辑器支持上传和管理这些 3D 模型文件格式。
 * 同时监听 GANDI_ASSET_UPDATE 事件，确保文件上传后 assetType 正确赋值。
 *
 * @param {Object} extension - RenderTheWorld 实例
 * @returns {() => void} 清理函数
 */
export function setupGandiFileTypes(extension) {
    const runtime = extension.runtime
    if (!runtime?.gandi || !runtime?.storage) return () => {}

    extension.gandi = runtime.gandi

    // 注册自定义文件类型
    addFileType(extension, 'OBJ', 'obj')
    addFileType(extension, 'MTL', 'mtl')
    addFileType(extension, 'GLTF', 'gltf')

    // 监听资源更新事件：确保 OBJ/MTL/GLTF 文件的 assetType 正确赋值
    const onAssetUpdate = ({ data }) => {
        const assetType = runtime.storage.AssetType
        const formats = [
            assetType.OBJ?.runtimeFormat,
            assetType.MTL?.runtimeFormat,
            assetType.GLTF?.runtimeFormat
        ].filter(Boolean)
        if (!formats.includes(data?.dataFormat)) return

        try {
            runtime.getGandiAssetsFileList().forEach(file => {
                if (file.dataFormat === assetType.OBJ.runtimeFormat) {
                    const f = runtime.getGandiAssetFile(file.fullName)
                    f.assetType = f.asset.assetType = assetType.OBJ
                } else if (file.dataFormat === assetType.MTL.runtimeFormat) {
                    const f = runtime.getGandiAssetFile(file.fullName)
                    f.assetType = f.asset.assetType = assetType.MTL
                } else if (file.dataFormat === assetType.GLTF.runtimeFormat) {
                    const f = runtime.getGandiAssetFile(file.fullName)
                    f.assetType = f.asset.assetType = assetType.GLTF
                }
            })
        } catch {
            /* 忽略 */
        }
    }

    runtime.on('GANDI_ASSET_UPDATE', onAssetUpdate)

    return () => {
        runtime.off('GANDI_ASSET_UPDATE', onAssetUpdate)
    }
}

/**
 * 设置 Gandi 资源文件动态菜单
 *
 * scratch-vm 动态菜单 items 为字符串时，会调用 extension[methodName]()。
 * 空列表时返回占位项，避免 scratch-vm 报错。
 *
 * 与旧版一致：obj/mtl/gltf 列表同时包含对应格式和 json 格式的文件。
 *
 * @param {Object} extension - RenderTheWorld 实例
 */
export function setupGandiAssetMenus(extension) {
    // 空列表占位项（与旧版一致：text=翻译文本, value='fileListEmpty'）
    const getPlaceholder = () => {
        const text =
            typeof extension.$formatMessage === 'function'
                ? extension.$formatMessage('fileListEmpty')
                : '没有文件'
        return [{ text, value: 'fileListEmpty' }]
    }

    /**
     * 按多个扩展名获取文件列表（与旧版 _gandiAssetsFileList 逻辑一致）
     * @param {string[]} names - 扩展名数组（如 ['obj', 'json']）
     * @returns {Array}
     */
    const getFileList = names => {
        const runtime = extension.runtime
        if (!runtime?.getGandiAssetsFileList) return getPlaceholder()
        let list = []
        names.forEach(name => {
            try {
                // 优先使用带扩展名参数的调用方式（与旧版一致）
                const items = runtime
                    .getGandiAssetsFileList(name)
                    .map(item => ({
                        text: item.fullName,
                        value: item.fullName
                    }))
                list = list.concat(items)
            } catch {
                /* 忽略个别扩展名查询失败 */
            }
        })
        return list.length > 0 ? list : getPlaceholder()
    }

    extension.__gandiAssetsObjFileList = () => getFileList(['obj', 'json'])
    extension.__gandiAssetsMtlFileList = () => getFileList(['mtl', 'json'])
    extension.__gandiAssetsGltfFileList = () => getFileList(['gltf', 'json'])
}

/**
 * 为 ScratchBlocks 启用文本下拉菜单功能 (Text Dropdowns)
 *
 * 允许下拉菜单支持直接输入文本。
 * 通过劫持 VM 的积木构建逻辑和 Blockly 的原型链，将 acceptText: true 的菜单
 * 转换为兼具文本输入框和下拉菜单特性的 field_textdropdown。
 *
 * @param {Object} ext - RenderTheWorld 实例
 * @param {Object} ScratchBlocks - Blockly/ScratchBlocks 全局对象
 * @returns {() => void} 清理函数
 */
export function setupTextDropDowns(ext) {
    const runtime = ext.runtime
    const ScratchBlocks = ext.ScratchBlocks
    if (!runtime || !ScratchBlocks) return

    // 内部用到的 XML 转义工具
    const xmlEscape = unsafe => {
        if (typeof unsafe !== 'string') return unsafe
        return unsafe.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<':
                    return '&lt;'
                case '>':
                    return '&gt;'
                case '&':
                    return '&amp;'
                case "'":
                    return '&apos;'
                case '"':
                    return '&quot;'
                default:
                    return c
            }
        })
    }

    // 1. Patch VM 端的菜单构建
    ext.patcher.patch(runtime, '_buildMenuForScratchBlocks', {
        after: function (res, menuName, menuInfo) {
            if (menuInfo.acceptText) {
                // 修改积木颜色为白色，使其看起来像文本输入框
                res.json.colour = '#FFFFFF'
                res.json.colourSecondary = '#FFFFFF'
                res.json.colourTertiary = '#FFFFFF'
                // 将原本的下拉菜单类型替换为自定义的 field_textdropdown
                res.json.args0[0].type = 'field_textdropdown'
                res.json.args0[0].check = 'number'
            }
        }
    })

    // 2. Patch VM 端的 XML 占位符转换
    ext.patcher.patch(runtime, '_convertPlaceholders', {
        before: function (context, match, placeholder) {
            const argInfo = context.blockInfo.arguments[placeholder] || {}
            const menuInfo = context.categoryInfo.menuInfo[argInfo.menu]

            if (!argInfo.menu || !menuInfo.acceptText) {
                return undefined // 退出不处理
            }

            const argJSON = { type: '', name: placeholder }
            const defaultValue =
                typeof argInfo.defaultValue === 'undefined'
                    ? ''
                    : String(argInfo.defaultValue)

            let valueName, shadowType, fieldName

            if (menuInfo.acceptReporters) {
                argJSON.type = 'input_value'
                valueName = placeholder
                shadowType = this._makeExtensionMenuId(
                    argInfo.menu,
                    context.categoryInfo.id
                )
                fieldName = argInfo.menu
            } else {
                argJSON.type = 'field_textdropdown'
                argJSON.options = this._convertMenuItems(menuInfo.items)
                valueName = null
                shadowType = null
                fieldName = placeholder
            }

            if (valueName) {
                context.inputList.push(
                    `<value name="${xmlEscape(placeholder)}">`
                )
            }
            if (shadowType) {
                context.inputList.push(
                    `<shadow type="${xmlEscape(shadowType)}">`
                )
            }
            if (defaultValue !== null && fieldName) {
                context.inputList.push(
                    `<field name="${xmlEscape(fieldName)}">${xmlEscape(defaultValue)}</field>`
                )
            }
            if (shadowType) context.inputList.push('</shadow>')
            if (valueName) context.inputList.push('</value>')

            const argsName = 'args' + context.outLineNum
            const blockArgs = (context.blockJSON[argsName] =
                context.blockJSON[argsName] || [])
            if (argJSON) blockArgs.push(argJSON)

            const argNum = blockArgs.length
            context.argsMap[placeholder] = argNum
            return '%' + argNum
        }
    })

    // 3. Patch ScratchBlocks (Blockly) 端的外观与交互
    ext.patcher.patch(ScratchBlocks.FieldTextDropdown.prototype, 'init', {
        after: function () {
            if (!this.sourceBlock_.isShadow()) {
                // 使用浅色 arrow
                this.arrow_.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'xlink:href',
                    `${ScratchBlocks.mainWorkspace.options.pathToMedia}dropdown-arrow.svg`
                )
            }
        }
    })

    // 绑定基础样式常量
    ScratchBlocks.FieldTextDropdown.CHECKMARK_OVERHANG =
        ScratchBlocks.FieldDropdown.CHECKMARK_OVERHANG
    ScratchBlocks.FieldTextDropdown.prototype.CURSOR =
        ScratchBlocks.FieldTextInput.prototype.CURSOR

    // 劫持 setText，使手动输入文本时同步下拉菜单的 value_ 值
    ext.patcher.patch(ScratchBlocks.FieldTextInput.prototype, 'setText', {
        before: function (newValue) {
            const extInfo = runtime._blockInfo?.find(
                b => b.id === chen_RenderTheWorld_extensionId
            )
            const blockInfo = extInfo?.blocks?.find(
                b =>
                    `${chen_RenderTheWorld_extensionId}_${b.info.opcode}` ===
                    this.sourceBlock_?.parentBlock_?.type
            )
            if (
                Object.prototype.hasOwnProperty.call(this, 'value_') &&
                typeof newValue === 'string'
            ) {
                const argIndex =
                    this.sourceBlock_?.parentBlock_?.childBlocks_?.indexOf(
                        this.sourceBlock_
                    ) + 2
                const argName = blockInfo?.json?.args0?.[argIndex]?.name
                const argType = blockInfo?.info?.arguments?.[argName]?.type
                if (argType === 'number' && isNaN(Number(newValue))) {
                    return ext.patcher.constructor.UNDEFINED
                }
                this.setValue(newValue)
            }
        }
    })

    // 继承原生 Dropdown 的行为方法
    ScratchBlocks.FieldTextDropdown.prototype.selectedItem =
        ScratchBlocks.FieldDropdown.prototype.selectedItem
    ScratchBlocks.FieldTextDropdown.prototype.value_ =
        ScratchBlocks.FieldDropdown.prototype.value_
    ScratchBlocks.FieldTextDropdown.prototype.onItemSelected =
        ScratchBlocks.FieldDropdown.prototype.onItemSelected
    ScratchBlocks.FieldTextDropdown.prototype.getOptions =
        ScratchBlocks.FieldDropdown.prototype.getOptions
    ScratchBlocks.FieldTextDropdown.prototype.getValue =
        ScratchBlocks.FieldDropdown.prototype.getValue
    ScratchBlocks.FieldTextDropdown.prototype.setValue =
        ScratchBlocks.FieldDropdown.prototype.setValue
    ScratchBlocks.FieldTextDropdown.prototype.isEqual =
        ScratchBlocks.FieldDropdown.prototype.isEqual
    ScratchBlocks.FieldTextDropdown.prototype.isOptionListDynamic =
        ScratchBlocks.FieldDropdown.prototype.isOptionListDynamic
}
