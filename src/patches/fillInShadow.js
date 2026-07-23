/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * fillIn shadow 块可拖动补丁
 *
 * 参考 test4.js 的 regenReporters 实现：
 * - TurboWarp 路径：Blockly 默认只允许 argument_reporter_boolean/string_number
 *   类型的 shadow 块可拖出，自定义 fillIn shadow 块需要 patch
 *   scratchBlocksUtils.isShadowArgumentReporter 才能拖出
 * - Gandi/PenguinMod 路径：原生支持 canDragDuplicate，无需 patch
 *
 * 本补丁仅在 TurboWarp 环境下劫持 isShadowArgumentReporter，
 * 将 RTW 扩展的 fillIn shadow 块加入允许列表。
 */

import { chen_RenderTheWorld_extensionId } from '../assets/index.js'

/**
 * 设置 fillIn shadow 块可拖动补丁
 *
 * @param {Object} ext - RenderTheWorld 实例
 * @returns {() => void} 清理函数
 */
export function setupFillInShadowDraggable(ext) {
    if (!ext.ScratchBlocks) return () => {}

    const SB = ext.ScratchBlocks
    const fillInOpcodes = [
        `${chen_RenderTheWorld_extensionId}_objectLoadingCompletedName`
    ]

    const cleanups = []

    // 检测是否为 TurboWarp 环境（Gandi/PenguinMod 原生支持 canDragDuplicate，无需 patch）
    // 如果 scratchBlocksUtils.isShadowArgumentReporter 存在，说明是 TurboWarp/Scratch 环境，需要 patch
    // 如果不存在，说明是 Gandi/PenguinMod 环境，原生支持 canDragDuplicate，不需要 patch
    if (SB.scratchBlocksUtils && typeof SB.scratchBlocksUtils.isShadowArgumentReporter === 'function') {
        const ogCheck = SB.scratchBlocksUtils.isShadowArgumentReporter
        SB.scratchBlocksUtils.isShadowArgumentReporter = function (block) {
            const result = ogCheck.call(this, block)
            if (result) return true
            return block.isShadow() && fillInOpcodes.includes(block.type)
        }
        cleanups.push(() => {
            SB.scratchBlocksUtils.isShadowArgumentReporter = ogCheck
        })
    }

    // 无论哪个环境，都确保 fillIn shadow 块在创建后被标记为可拖出
    // 这是通过 hook BlockSvg.initSvg 或 workspace 事件来实现的
    // 目前先依赖 canDragDuplicate 属性本身传递到 Blockly 层面

    return () => {
        cleanups.forEach(fn => {
            try { fn() } catch { /* 忽略 */ }
        })
    }
}
