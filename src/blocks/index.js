/**
 * 积木聚合入口
 *
 * 通过分组加载机制（BlockGroup）注册所有积木：
 *   1. 实例化每个分组
 *   2. 调用 registerMenus() 注册菜单
 *   3. 调用 register() 注册积木（含 LABEL 分隔、'---' 分割线）
 *   4. 收集 l10n() 提供给 l10n 模块
 *
 * 支持的块类型：
 *   - COMMAND/REPORTER/BOOLEAN/HAT/BUTTON/LABEL：标准块
 *   - OUTPUT：自定义形状输出块（配合 output/outputShape/branchCount，需劫持 _convertBlockForScratchBlocks）
 *   - XML：面板预定义块（需 hackFun 注册 BlockType.XML）
 *   - EVENT：事件块（配合 isEdgeActivated/shouldRestartExistingThreads）
 *
 * 可扩展积木（dynamicArgsInfo）需配合 initExpandableBlocks 使用
 */

import BlockGroup from './BlockGroup.js'

// 各积木分组（顺序即面板显示顺序）
import InitGroup from './groups/initGroup.js'
import MaterialGroup from './groups/materialGroup.js'
import ModelGroup from './groups/modelGroup.js'
import HierarchyGroup from './groups/hierarchyGroup.js'
import TransformGroup from './groups/transformGroup.js'
import AnimationGroup from './groups/animationGroup.js'
import LightingGroup from './groups/lightingGroup.js'
import CameraGroup from './groups/cameraGroup.js'
import ControlsGroup from './groups/controlsGroup.js'
import FogGroup from './groups/fogGroup.js'

const groupClasses = [
    InitGroup,
    MaterialGroup,
    ModelGroup,
    HierarchyGroup,
    TransformGroup,
    AnimationGroup,
    LightingGroup,
    CameraGroup,
    ControlsGroup,
    FogGroup
]

/**
 * 规范化 BlockType —— 强制使用小写标准字符串值。
 * 不同环境（Gandi/TurboWarp）的 BlockType 枚举值大小写不一致
 * （例如 Gandi 的 BOOLEAN 是大写 "Boolean"），
 * 而 Blockly 内部只认小写。这里统一映射为小写。
 *
 * 对于 OUTPUT/XML 等非标准类型，优先使用原始 Scratch.BlockType 中的值
 * （Gandi 环境的 scratch-vm 能识别这些值），如果没有则使用回退值。
 *
 * @param {Object} [originalBlockType] - 来自 Scratch.BlockType 的原始枚举
 * @returns {Object}
 */
function normalizeBlockType(originalBlockType) {
    const orig = originalBlockType || {}
    return {
        COMMAND: 'command',
        REPORTER: 'reporter',
        // scratch-vm 的 BlockType.BOOLEAN 值是 'Boolean'（大写 B），必须保持一致
        // 否则 _convertBlockForScratchBlocks 走默认分支渲染成 HAT
        BOOLEAN: orig.BOOLEAN || 'Boolean',
        HAT: 'hat',
        BUTTON: 'button',
        LABEL: 'label',
        CONDITIONAL: 'conditional',
        LOOP: 'loop',
        EVENT: 'event',
        // OUTPUT/XML 是非标准类型，使用环境原始值以确保 scratch-vm 能识别
        OUTPUT: orig.OUTPUT || 'output',
        XML: orig.XML || 'XML'
    }
}

/**
 * 规范化 ArgumentType —— 强制使用小写标准字符串值（与 BlockType 同理）。
 * @returns {Object}
 */
function normalizeArgumentType() {
    return {
        ANGLE: 'angle',
        COLOR: 'color',
        NUMBER: 'number',
        STRING: 'string',
        BOOLEAN: 'Boolean',
        MATRIX: 'matrix',
        NOTE: 'note',
        IMAGE: 'image',
        CCW_HAT_PARAMETER: 'ccw_hat_parameter'
    }
}

/**
 * 从 BlockDef 提取传递给 scratch-vm 的标准属性
 * @param {BlockDef} b - 积木定义
 * @param {Object} renderTheWorldInstance - 扩展实例（挂载 handler/onClick）
 * @param {Object} BT - 规范化的 BlockType
 * @returns {Object} scratch-vm 格式的积木定义
 */
function buildScratchBlockDef(b) {
    const blockDef = {
        opcode: b.opcode,
        blockType: b.blockType,
        text: b.text,
        arguments: b.arguments || {}
    }

    // 可选标准属性
    if (b.hideFromPalette !== undefined)
        blockDef.hideFromPalette = b.hideFromPalette
    if (b.disableInternalArgument !== undefined)
        blockDef.disableInternalArgument = b.disableInternalArgument
    if (b.disableMonitor !== undefined)
        blockDef.disableMonitor = b.disableMonitor
    if (b.isTerminal !== undefined) blockDef.isTerminal = b.isTerminal
    if (b.tooltip !== undefined) blockDef.tooltip = b.tooltip

    // OUTPUT 块自定义形状属性（需劫持 _convertBlockForScratchBlocks）
    if (b.output !== undefined) blockDef.output = b.output
    if (b.outputShape !== undefined) blockDef.outputShape = b.outputShape
    if (b.branchCount !== undefined) blockDef.branchCount = b.branchCount

    // EVENT 块属性
    if (b.isEdgeActivated !== undefined)
        blockDef.isEdgeActivated = b.isEdgeActivated
    if (b.shouldRestartExistingThreads !== undefined)
        blockDef.shouldRestartExistingThreads = b.shouldRestartExistingThreads

    // XML 块
    if (b.xml !== undefined) blockDef.xml = b.xml

    // 可扩展积木配置（由 initExpandableBlocks 处理）
    if (b.dynamicArgsInfo !== undefined)
        blockDef.dynamicArgsInfo = b.dynamicArgsInfo

    return blockDef
}

/**
 * 加载所有积木到 core
 * @param {Object} ext - Extension 主对象
 * @param {Object} renderTheWorldInstance - RenderTheWorld 实例（用于挂载 opcode 方法）
 * @param {ExtensionCore} core - 扩展核心
 * @param {Object} BlockType - BlockType 枚举（原始）
 * @param {Object} ArgumentType - ArgumentType 枚举（原始）
 * @param {(key: string) => string} translate - 翻译函数
 * @returns {BlockGroup[]} 已注册的分组实例数组
 */
export function loadBlocks(
    ext,
    renderTheWorldInstance,
    core,
    BlockType,
    ArgumentType,
    translate
) {
    core.cleanBlocks()
    core.cleanMenus()

    const BT = normalizeBlockType(BlockType)
    const AT = normalizeArgumentType()

    const ctx = { ext, core, BlockType: BT, ArgumentType: AT, translate }
    const instances = groupClasses.map(Cls => new Cls(ctx))

    // 1. 先注册所有菜单（菜单可能被多个分组复用）
    instances.forEach(g => {
        try {
            g.registerMenus()
        } catch (e) {
            ext.logger?.warn(`注册菜单失败 (${g.constructor.name}):`, e)
        }
    })

    // 2. 注册积木
    instances.forEach(g => {
        try {
            const blocks = g.build()
            if (g.label) {
                core.registerBlock({
                    blockType: BT.LABEL,
                    text: g.label
                })
            }
            blocks.forEach(b => {
                // 分割线
                if (b === '---') {
                    core.registerBlock('---')
                    return
                }

                // LABEL 块（无 opcode）
                if (b.blockType === BT.LABEL) {
                    core.registerBlock({ blockType: BT.LABEL, text: b.text })
                    return
                }

                // BUTTON 块（无 handler，有 onClick）
                if (b.blockType === BT.BUTTON) {
                    const blockDef = {
                        opcode: b.opcode,
                        blockType: BT.BUTTON,
                        text: b.text
                    }
                    if (typeof b.onClick === 'function') {
                        renderTheWorldInstance[b.opcode] = b.onClick
                        blockDef.onClick = b.opcode
                    } else if (typeof b.onClick === 'string') {
                        blockDef.onClick = b.onClick
                    }
                    core.registerBlock(blockDef)
                    return
                }

                // XML 块（面板预定义块，无 handler）
                if (b.blockType === BT.XML) {
                    core.registerBlock(buildScratchBlockDef(b))
                    return
                }

                // 有 handler 的块（COMMAND/REPORTER/BOOLEAN/HAT/OUTPUT/EVENT）
                if (b.handler) {
                    renderTheWorldInstance[b.opcode] = b.handler
                    core.registerBlock(buildScratchBlockDef(b))
                } else if (b.opcode) {
                    // 有 opcode 但无 handler（纯定义）
                    core.registerBlock(buildScratchBlockDef(b))
                } else {
                    core.registerBlock(b)
                }
            })
        } catch (e) {
            ext.logger?.warn(`注册积木分组失败 (${g.constructor.name}):`, e)
        }
    })

    return instances
}

/**
 * 收集所有分组的 l10n 数据
 * @returns {Object} 形如 { 'key': { 'zh-cn': '...', 'en': '...' } }
 */
export function collectL10n() {
    const ctx = {
        ext: null,
        core: null,
        BlockType: {},
        ArgumentType: {},
        translate: k => k
    }
    const merged = {}
    groupClasses.forEach(Cls => {
        try {
            const inst = new Cls(ctx)
            const data = inst.l10n() || {}
            Object.assign(merged, data)
        } catch {
            // ignore
        }
    })
    return merged
}

export { BlockGroup }
