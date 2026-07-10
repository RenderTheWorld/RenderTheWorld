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
 * @param {Object} runtime - Scratch runtime
 */
export function hookOutputBlocks(runtime) {
    const original = runtime._convertBlockForScratchBlocks.bind(runtime)

    runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
        if (blockInfo.blockType !== 'output') {
            return original(blockInfo, categoryInfo)
        }

        const branchCount = blockInfo.branchCount || 0
        const output = blockInfo.output

        if (branchCount > 0) {
            // C 块 + 返回值（如 makeMaterial）：回退为 conditional
            const effectiveBlockInfo = Object.assign({}, blockInfo, {
                blockType: 'conditional',
                branchCount: branchCount
            })
            delete effectiveBlockInfo.output
            delete effectiveBlockInfo.outputShape
            const res = original(effectiveBlockInfo, categoryInfo)
            // conditional 不设置 output，手动覆盖以添加输出连接
            if (output !== undefined) {
                res.json.output = output
            }
            return res
        }

        // 普通返回值块：回退为 command，然后删除上下连接，只保留 output
        const effectiveBlockInfo = Object.assign({}, blockInfo, {
            blockType: 'command'
        })
        delete effectiveBlockInfo.output
        delete effectiveBlockInfo.outputShape
        delete effectiveBlockInfo.branchCount
        const res = original(effectiveBlockInfo, categoryInfo)
        // 删除 COMMAND 的上下连接，让块只有 output 连接（方形 reporter）
        delete res.json.previousStatement
        delete res.json.nextStatement
        // 手动添加 output 实现输出连接
        if (output !== undefined) {
            res.json.output = output
        }
        return res
    }

    return () => {
        runtime._convertBlockForScratchBlocks = original
    }
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

        ws.getAllBlocks()
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
    runtime.on('PROJECT_LOADED', extension.objectLoadingCompletedUpdate)
    runtime.on('BLOCK_DRAG_UPDATE', extension.objectLoadingCompletedUpdate)
    runtime.on('BLOCKSINFO_UPDATE', extension.objectLoadingCompletedUpdate)

    return () => {
        runtime.off('PROJECT_LOADED', extension.objectLoadingCompletedUpdate)
        runtime.off('BLOCK_DRAG_UPDATE', extension.objectLoadingCompletedUpdate)
        runtime.off('BLOCKSINFO_UPDATE', extension.objectLoadingCompletedUpdate)
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
