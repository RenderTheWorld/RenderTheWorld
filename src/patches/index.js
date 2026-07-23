/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * Scratch/Blockly 内部机制补丁入口
 *
 * 集中管理所有对 Scratch 内部方法的劫持，让 index.js 保持简洁。
 * 每个补丁都是独立函数，返回一个清理函数（便于卸载）。
 */

import { hookOutputBlocks } from './outputBlocks.js'
import {
    setupGandiFileTypes,
    setupGandiAssetMenus
} from './gandiAssets.js'
import { setupTextDropDowns } from './textDropDowns.js'
import { setupFillInShadowDraggable } from './fillInShadow.js'
import { setupHideNestedExtIcon } from './hideNestedIcon.js'

export { hookOutputBlocks, setupGandiFileTypes, setupGandiAssetMenus, setupTextDropDowns, setupFillInShadowDraggable, setupHideNestedExtIcon }

/**
 * @typedef {import('../core/main.js').default} Extension
 */

/**
 * 应用所有 Scratch/Blockly 补丁
 * @param {Extension} ext - 扩展核心组件
 * @returns {Array<() => void>} 清理函数数组
 */
export function applyPatches(ext) {
    const cleanup = []

    hookOutputBlocks(ext)

    if (ext.ScratchBlocks) {
        cleanup.push(setupFillInShadowDraggable(ext))
        cleanup.push(setupHideNestedExtIcon(ext))
        setupTextDropDowns(ext)
    }

    cleanup.push(setupGandiFileTypes(ext))
    setupGandiAssetMenus(ext)

    return cleanup
}
