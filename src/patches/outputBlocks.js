/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * OUTPUT 块补丁
 *
 * Gandi/TurboWarp 的 BlockType 枚举没有 OUTPUT 类型，需要回退为标准类型并手动补回
 * outputShape/output/branchCount 字段。
 */

/**
 * @typedef {import('../core/main.js').default} Extension
 */

/**
 * 劫持 _convertBlockForScratchBlocks，适配 OUTPUT 类型块
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
            if (blockInfo.blockShape) {
                res.json.blockShape = blockInfo.blockShape
            }

            return res
        }
    })
}
