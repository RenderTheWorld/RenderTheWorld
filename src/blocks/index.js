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
import SettingsGroup from './groups/settingsGroup.js'
import MaterialGroup from './groups/materialGroup.js'
import ModelGroup from './groups/modelGroup.js'
import HierarchyGroup from './groups/hierarchyGroup.js'
import TransformGroup from './groups/transformGroup.js'
import AnimationGroup from './groups/animationGroup.js'
import LightingGroup from './groups/lightingGroup.js'
import CameraGroup from './groups/cameraGroup.js'
import ControlsGroup from './groups/controlsGroup.js'
import FogGroup from './groups/fogGroup.js'
import SkyGroup from './groups/skyGroup.js'
import EffectsGroup from './groups/effectsGroup.js'
import TextureGroup from './groups/textureGroup.js'
import MathGroup from './groups/mathGroup.js'

const groupClasses = [
    SettingsGroup,
    MaterialGroup,
    ModelGroup,
    HierarchyGroup,
    TransformGroup,
    AnimationGroup,
    LightingGroup,
    CameraGroup,
    ControlsGroup,
    FogGroup,
    // AI编写，还有问题，稍后修改
    MathGroup,
    // SkyGroup,
    // EffectsGroup,
    // TextureGroup,
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
 * @param {any} [originalBlockType] - 来自 Scratch.BlockType 的原始枚举
 * @returns {import('./BlockGroup.js').BlockType}
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
 * @returns {import('./BlockGroup.js').ArgumentType}
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
 * 加载所有积木到 core
 * @param {import('../core/main.js').default} ext - Extension 主对象
 * @param {{[key: string]: any}} renderTheWorldInstance - RenderTheWorld 实例（用于挂载 opcode 方法）
 * @param {import('../core/extcore.js').default} core - 扩展核心
 * @param {import('./BlockGroup.js').BlockType} BlockType - BlockType 枚举（原始）
 * @param {import('./BlockGroup.js').ArgumentType} ArgumentType - ArgumentType 枚举（原始）
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

    // 2. 注册积木（由 BlockGroup 统一处理 LABEL、handler 挂载、BUTTON 等细节）
    instances.forEach(g => {
        try {
            g.register(renderTheWorldInstance)
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
    const ctx = /** @type {import('./BlockGroup.js').BlockGroupContext} */ ({
        ext: null,
        core: null,
        BlockType: {},
        ArgumentType: {},
        translate: (/** @type {string} */ k) => k
    })
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
