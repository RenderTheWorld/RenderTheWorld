/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * scratchTools —— Scratch 环境工具集
 *
 * 包含：
 *   - hijack / getEventListener / getScratchBlocks / getVM: 从 runtime 获取 ScratchBlocks 和 VM（By FurryR）
 *   - hackFun: 注册 BlockType.XML 支持（By Nights）
 *   - refactoringVisualReport: 劫持 visualReport，让 RTW_Model_Box 显示自定义 HTML（By FurryR）
 *   - inMainWorkspace: 判断是否在主工作区
 */

import { RTW_Model_Box, Wrapper } from './RTWTools.js'
import { chen_RenderTheWorld_extensionId } from '../assets/index.js'

/**
 * 判断是否在主工作区（Gandi/Creator 编辑器）
 */
const inMainWorkspace = ext => {
    const ur1 = window.location.pathname
    const rege = /\/(?:gandi|creator)(?:\/|$)/
    return rege.test(ur1) && ext.ScratchBlocks?.getMainWorkspace?.() !== null
}

/**
 * By FurryR
 * 劫持 Function.prototype.apply，从事件监听器中提取对象
 */
function hijack(fn) {
    if (fn === undefined) return 0
    const _orig = Function.prototype.apply
    // eslint-disable-next-line no-extend-native
    Function.prototype.apply = thisArg => thisArg
    const result = fn()
    // eslint-disable-next-line no-extend-native
    Function.prototype.apply = _orig
    return result
}

function getEventListener(e) {
    return e instanceof Array ? e[e.length - 1] : e
}

/**
 * 从 runtime 或 window 获取 ScratchBlocks
 */
function getScratchBlocks(runtime) {
    return (
        hijack(/** @type {any} */ (getEventListener(runtime._events.EXTENSION_ADDED)))
            ?.ScratchBlocks ||
        runtime.scratchBlocks ||
        window.Blockly?.getMainWorkspace?.()?.getScratchBlocks?.() ||
        window.ScratchBlocks
    )
}

/**
 * 从 runtime 或 window 获取 VM
 */
function getVM(runtime) {
    return (
        hijack(/** @type {any} */ (getEventListener(runtime._events['QUESTION'])))?.props?.vm ||
        window.Scratch?.vm
    )
}

/**
 * By Nights: 支持 BlockType.XML
 * 注册 XML 块类型，用于在面板中显示预定义的 XML 块
 */
const hackFun = (ext, BlockType) => {
    if (!ext.runtime || /** @type {any} */ (hackFun).hacked) return
    /** @type {any} */ (hackFun).hacked = true

    if (!BlockType.XML) {
        BlockType.XML = 'XML'
        ext.patcher.patch(ext.runtime, '_convertForScratchBlocks', {
            before: function (blockInfo, categoryInfo) {
                if (blockInfo.blockType === BlockType.XML) {
                    return {
                        info: blockInfo,
                        xml: blockInfo.xml
                    }
                }
            }
        })
    }
}

/**
 * By FurryR: 自定义监视器/返回值显示
 * 让 RTW_Model_Box 在监视器和点击返回值时显示 HTML
 */
function show(ScratchBlocks, id, value, textAlign) {
    const workspace = ScratchBlocks.getMainWorkspace()
    const block = workspace.getBlockById(id)
    if (!block) return
    ScratchBlocks.DropDownDiv.hideWithoutAnimation()
    ScratchBlocks.DropDownDiv.clearContent()
    const contentDiv = ScratchBlocks.DropDownDiv.getContentDiv()
    const elem = document.createElement('div')
    elem.setAttribute('class', 'valueReportBox')
    elem.append(...value)
    elem.style.maxWidth = 'none'
    elem.style.maxHeight = 'none'
    elem.style.textAlign = textAlign
    elem.style.userSelect = 'none'
    contentDiv.appendChild(elem)
    ScratchBlocks.DropDownDiv.setColour(
        ScratchBlocks.Colours.valueReportBackground,
        ScratchBlocks.Colours.valueReportBorder
    )
    ScratchBlocks.DropDownDiv.showPositionedByBlock(workspace, block)
    return elem
}

const refactoringVisualReport = ext => {
    // 劫持 visualReport：makeMaterial 内联块不显示返回值
    ext.patcher.patch(ext.runtime.constructor.prototype, 'visualReport', {
        wrapper: function (original, blockId, value) {
            if (ext.vm.editingTarget) {
                const block = ext.vm.editingTarget.blocks.getBlock(blockId)
                if (
                    block !== undefined &&
                    block.opcode ===
                        chen_RenderTheWorld_extensionId + '_makeMaterial' &&
                    !block.topLevel
                )
                    return
            }
            original.call(this, blockId, value)
        }
    })

    const _visualReport = ext.runtime.visualReport
    ext.runtime.visualReport = (blockId, value) => {
        const unwrappedValue = Wrapper.unwrap(value)
        if (unwrappedValue instanceof RTW_Model_Box && ext.ScratchBlocks) {
            show(
                ext.ScratchBlocks,
                blockId,
                [unwrappedValue.getHTML()],
                'center'
            )
        } else {
            return _visualReport.call(ext.runtime, blockId, value)
        }
    }

    // 劫持 requestUpdateMonitor：监视器显示 RTW_Model_Box 的 HTML
    const _requestUpdateMonitor = ext.runtime.requestUpdateMonitor
    const monitorMap = new Map()
    if (!_requestUpdateMonitor) return

    const patchMonitorValue = (element, value) => {
        const unwrappedValue = Wrapper.unwrap(value)
        const valueElement = element.querySelector('[class*="value"]')
        if (!(valueElement instanceof HTMLElement)) return
        const internalInstance = Object.values(valueElement).find(
            v =>
                typeof v === 'object' &&
                v !== null &&
                Reflect.has(v, 'stateNode')
        )
        if (unwrappedValue instanceof RTW_Model_Box) {
            const inspector = unwrappedValue.getHTML(true)
            valueElement.style.textAlign = 'left'
            valueElement.style.backgroundColor = '#121C3D'
            valueElement.style.color = '#eeeeee'
            valueElement.style.border = '1px solid #4A76FF'
            while (valueElement.firstChild)
                valueElement.removeChild(valueElement.firstChild)
            valueElement.append(inspector)
        } else if (internalInstance) {
            valueElement.style.textAlign = ''
            valueElement.style.backgroundColor =
                internalInstance.memoizedProps?.style?.background ?? ''
            valueElement.style.color =
                internalInstance.memoizedProps?.style?.color ?? ''
            valueElement.style.border =
                internalInstance.memoizedProps?.style?.border ?? ''
            while (valueElement.firstChild)
                valueElement.removeChild(valueElement.firstChild)
            valueElement.append(String(value))
        }
    }

    const getMonitorById = id2 => {
        const elements = document.querySelectorAll(
            '[class*="monitor_monitor-container"]'
        )
        for (const element of Object.values(elements)) {
            const internalInstance = Object.values(element).find(
                v =>
                    typeof v === 'object' &&
                    v !== null &&
                    Reflect.has(v, 'children')
            )
            if (internalInstance) {
                const props = internalInstance?.children?.props
                if (id2 === props?.id) return element
            }
        }
        return null
    }

    ext.runtime.requestUpdateMonitor = state => {
        const id2 = state.get('id')
        if (typeof id2 === 'string') {
            const monitorValue = state.get('value')
            const unwrappedValue = Wrapper.unwrap(monitorValue)
            const monitorMode = state.get('mode')
            const monitorVisible = state.get('visible')
            const cache = monitorMap.get(id2)
            if (typeof monitorMode === 'string' && cache) {
                cache.mode = monitorMode
                cache.value = void 0
            } else if (monitorValue !== void 0) {
                if (unwrappedValue instanceof RTW_Model_Box) {
                    if (!cache || cache.value !== monitorValue) {
                        requestAnimationFrame(() => {
                            const monitor = getMonitorById(id2)
                            if (monitor)
                                patchMonitorValue(monitor, monitorValue)
                        })
                        if (!cache) {
                            monitorMap.set(id2, {
                                value: monitorValue,
                                mode: 'normal'
                            })
                        } else {
                            cache.value = monitorValue
                        }
                    }
                    return true
                } else if (monitorMap.has(id2)) {
                    const monitor = getMonitorById(id2)
                    if (monitor) patchMonitorValue(monitor, monitorValue)
                    monitorMap.delete(id2)
                }
            } else if (monitorVisible !== void 0) {
                if (!monitorVisible) monitorMap.delete(id2)
            }
        }
        return _requestUpdateMonitor.call(ext.runtime, state)
    }
}

export {
    refactoringVisualReport,
    inMainWorkspace,
    getScratchBlocks,
    getVM,
    hackFun
}
