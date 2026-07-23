/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * 文本下拉菜单补丁
 *
 * 允许下拉菜单支持直接输入文本。
 * 通过劫持 VM 的积木构建逻辑和 Blockly 的原型链，将 acceptText: true 的菜单
 * 转换为兼具文本输入框和下拉菜单特性的 field_textdropdown。
 */

import { chen_RenderTheWorld_extensionId } from '../assets/index.js'

/**
 * 为 ScratchBlocks 启用文本下拉菜单功能 (Text Dropdowns)
 *
 * @param {Object} ext - RenderTheWorld 实例（含 runtime 和 ScratchBlocks）
 * @returns {() => void} 清理函数
 */
export function setupTextDropDowns(ext) {
    const runtime = ext.runtime
    const ScratchBlocks = ext.ScratchBlocks
    if (!runtime || !ScratchBlocks) return

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

    ext.patcher.patch(runtime, '_buildMenuForScratchBlocks', {
        after: function (res, menuName, menuInfo) {
            if (menuInfo.acceptText) {
                res.json.colour = '#FFFFFF'
                res.json.colourSecondary = '#FFFFFF'
                res.json.colourTertiary = '#FFFFFF'
                res.json.args0[0].type = 'field_textdropdown'
                res.json.args0[0].check = 'number'
            }
        }
    })

    ext.patcher.patch(runtime, '_convertPlaceholders', {
        before: function (context, match, placeholder) {
            const argInfo = context.blockInfo.arguments[placeholder] || {}
            const menuInfo = context.categoryInfo.menuInfo[argInfo.menu]

            if (!argInfo.menu || !menuInfo.acceptText) {
                return undefined
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

    ext.patcher.patch(ScratchBlocks.FieldTextDropdown.prototype, 'init', {
        after: function () {
            if (!this.sourceBlock_.isShadow()) {
                this.arrow_.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'xlink:href',
                    `${ScratchBlocks.mainWorkspace.options.pathToMedia}dropdown-arrow.svg`
                )
            }
        }
    })

    ScratchBlocks.FieldTextDropdown.CHECKMARK_OVERHANG =
        ScratchBlocks.FieldDropdown.CHECKMARK_OVERHANG
    ScratchBlocks.FieldTextDropdown.prototype.CURSOR =
        ScratchBlocks.FieldTextInput.prototype.CURSOR

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
