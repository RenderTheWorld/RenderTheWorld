/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/**
 * 嵌套同扩展积木的图标动态隐藏补丁
 *
 * 当 RTW 扩展的积木嵌套在另一个 RTW 扩展积木的参数槽中时，
 * 子积木的扩展图标和分割线是冗余的（父积木已展示扩展标识）。
 *
 * 实现：
 *   1. Hook BlockSvg.prototype.render
 *   2. 子积木 render 时检查是否嵌套在 RTW 父积木内 → 按需移除/恢复图标
 *   3. 父积木 render 时，遍历其 input 子积木，触发子积木 icon 调整
 *      （因为子积木连接到父积木后不会再自动 render，getParent() 始终为 null）
 */

import { chen_RenderTheWorld_extensionId } from '../assets/index.js'

/**
 * RTW 扩展 ID 前缀
 */
const EXT_PREFIX = `${chen_RenderTheWorld_extensionId}_`

/**
 * 防止 render 递归的标志
 */
let isAdjusting = false

/**
 * 返回 RTW_Model_Box 包装对象的积木 opcode 后缀列表
 * 包括 Object3D（模型/Group）、Light、Camera、OrbitControls、材质、纹理等
 */
const WRAPPER_BLOCK_OPCODES = [
    // 模型 / Group
    'getObjectByName',
    'cubeModel',
    'sphereModel',
    'planeModel',
    'objModel',
    'gltfModel',
    'groupModel',
    'getScene',
    'getChildrenInObject',
    'getChildrenInObjectByName',
    // 光源
    'pointLight',
    'directionalLight',
    'spotLight',
    'rectAreaLight',
    // 相机
    'getCamera',
    'perspectiveCamera',
    'orthographicCamera',
    // 控制器
    'createOrbitControls',
    // 纹理
    'createTexture',
    'createTextureFromCostume'
]

/**
 * 接受 Wrapper 对象参数的积木-参数映射
 * key = opcode 后缀, value = 接受 Wrapper 对象的参数名数组
 */
const WRAPPER_PARAM_MAP = {
    // 模型
    importModel: ['model'],
    cubeModel: ['material'],
    sphereModel: ['material'],
    planeModel: ['material'],
    objModel: ['material'],
    gltfModel: ['material'],
    // 纹理
    setMaterialMap: ['texture'],
    setTextureRepeat: ['texture'],
    setTextureOffset: ['texture'],
    setTextureRotation: ['texture'],
    disposeTexture: ['texture']
}

/**
 * 生成模型对象形状的 SVG path（参考 test4.js 的 makeShape）
 * 圆角矩形 + 中间缺口
 *
 * @param {number} width - 积木宽度
 * @returns {string} SVG path d 属性
 */
function makeModelShape(width) {
    width -= 35
    return `m20 0h${width}C${width + 30} 0 ${width + 30} 4 ${width + 30} 12c0 0 2 0 3 0 1 0 3 2 3 3 0 1 0 8 0 10 0 2-1 3-3 3-2 0-3 0-3 0C${width + 30} 37 ${width + 30} 40 ${width + 20} 40h${(width + 10) * -1}C5 40 5 36 4 28c0 0-1 0-2 0-2 0-3-1-3-3l0-10c0 0 0-3 4-3 0 0 1 0 1 0C5 4 5 0 10 0z`
}

/**
 * 获取积木 opcode 后缀（去掉扩展 ID 前缀）
 */
function getOpcodeSuffix(type) {
    if (!type || !type.startsWith(EXT_PREFIX)) return ''
    return type.slice(EXT_PREFIX.length)
}

/**
 * 判断积木是否为 Wrapper 对象返回块
 */
function isWrapperBlock(type) {
    return WRAPPER_BLOCK_OPCODES.includes(getOpcodeSuffix(type))
}

/**
 * 获取积木中接受 Wrapper 对象的参数名列表
 */
function getWrapperParamNames(type) {
    return WRAPPER_PARAM_MAP[getOpcodeSuffix(type)] || []
}

/**
 * 设置嵌套同扩展积木图标动态隐藏
 *
 * @param {Object} ext - RenderTheWorld 实例
 * @returns {() => void} 清理函数
 */
export function setupHideNestedExtIcon(ext) {
    if (!ext.ScratchBlocks) return () => {}

    const SB = ext.ScratchBlocks
    const ogRender = SB.BlockSvg.prototype.render

    SB.BlockSvg.prototype.render = function (...args) {
        const result = ogRender.apply(this, args)

        if (isAdjusting) return result

        try {
            adjustBlock(this, SB, ogRender)
            applyModelStyle(this)
        } catch (e) {
            // ignore
        }

        return result
    }

    return () => {
        SB.BlockSvg.prototype.render = ogRender
    }
}

/**
 * 调整单个积木及其子积木的图标可见性
 *
 * @param {Object} block - BlockSvg 实例
 * @param {Object} SB - ScratchBlocks 对象
 * @param {Function} ogRender - 原始 render 方法
 */
function adjustBlock(block, SB, ogRender) {
    if (!block.type || !block.type.startsWith(EXT_PREFIX)) return

    // === 子积木自身检查 ===
    if (block.outputConnection) {
        adjustOwnIcon(block, SB, ogRender)
    }

    // === 父积木传播：遍历 input 子积木，触发它们的 icon 调整 ===
    if (block.inputList) {
        for (const input of block.inputList) {
            const child = input.connection?.targetBlock?.()
            if (child && child.type && child.type.startsWith(EXT_PREFIX)) {
                adjustBlock(child, SB, ogRender)
            }
        }
    }
}

/**
 * 调整积木自身的图标可见性
 *
 * @param {Object} block - BlockSvg 实例（有 output 连接）
 * @param {Object} SB - ScratchBlocks 对象
 * @param {Function} ogRender - 原始 render 方法
 */
function adjustOwnIcon(block, SB, ogRender) {
    const parent = block.getParent()
    const isNested = !!(parent && parent.type && parent.type.startsWith(EXT_PREFIX))
    const iconRemoved = !!block._rtw_removedIconFields

    if (isNested && !iconRemoved) {
        // 嵌套在 RTW 父积木内 → 移除图标，重新 render
        const removed = removeIconFields(block, SB)
        if (removed) {
            isAdjusting = true
            ogRender.call(block)
            isAdjusting = false
            // ogRender 会重置 SVG 路径为默认形状，需要重新应用自定义样式
            applyModelStyle(block)
        }
    } else if (!isNested && iconRemoved) {
        // 不再嵌套 → 恢复图标，重新 render
        restoreIconFields(block, SB)
        isAdjusting = true
        ogRender.call(block)
        isAdjusting = false
        // 同理，恢复图标后也需要重新应用自定义样式
        applyModelStyle(block)
    }
}

/**
 * 判断字段是否为 FieldImage（扩展图标或分割线）
 * Gandi 环境中 constructor.name 可能被混淆，改用属性特征判断
 *
 * @param {Object} field - 字段对象
 * @returns {boolean}
 */
function isFieldImage(field) {
    return field &&
        typeof field === 'object' &&
        'src_' in field &&
        'height_' in field &&
        'width_' in field
}

/**
 * 从积木的 fieldRow 中移除图标和分割线字段
 */
function removeIconFields(block, SB) {
    if (!block.inputList || block.inputList.length === 0) return null

    for (let i = 0; i < block.inputList.length; i++) {
        const input = block.inputList[i]
        if (!input.fieldRow) continue
        if (input.fieldRow.length < 2) continue

        let firstIdx = -1
        for (let j = 0; j < input.fieldRow.length; j++) {
            if (isFieldImage(input.fieldRow[j])) {
                firstIdx = j
                break
            }
        }
        if (firstIdx === -1) continue
        // 确保后面还有至少一个字段（分隔线）
        if (firstIdx + 1 >= input.fieldRow.length) continue

        const removed = input.fieldRow.splice(firstIdx, 2)

        // 从 DOM 中移除 SVG group
        for (const field of removed) {
            if (field.fieldGroup_ && field.fieldGroup_.parentNode) {
                field.fieldGroup_.parentNode.removeChild(field.fieldGroup_)
            }
        }

        block._rtw_removedIconFields = removed
        return removed
    }

    return null
}

/**
 * 恢复之前移除的图标和分割线字段
 */
function restoreIconFields(block, SB) {
    if (!block._rtw_removedIconFields) return
    if (!block.inputList || block.inputList.length === 0) return

    const fields = block._rtw_removedIconFields
    block._rtw_removedIconFields = null

    const firstInput = block.inputList[0]
    if (!firstInput.fieldRow) return

    firstInput.fieldRow.splice(0, 0, ...fields)

    for (const field of fields) {
        field.fieldGroup_ = null
        field.imageElement_ = null
        field.sourceBlock_ = block
        field.visible_ = true
        field.init()
    }
}

/**
 * 为 Wrapper 对象积木和参数槽应用自定义 SVG 外观
 * 参考 test4.js 的 makeShape 实现
 *
 * @param {Object} block - BlockSvg 实例
 */
function applyModelStyle(block) {
    if (!block.type || !block.type.startsWith(EXT_PREFIX)) return
    const suffix = getOpcodeSuffix(block.type)
    if (!suffix) return

    // === 返回 Wrapper 对象的积木：整体使用自定义形状 ===
    if (isWrapperBlock(block.type) && block.svgPath_) {
        block.svgPath_.setAttribute(
            'transform',
            `scale(1, ${block.height / 40})`
        )
        block.svgPath_.setAttribute('d', makeModelShape(block.width))
    }

    // === 接受 Wrapper 对象的参数槽：内部 shadow / 嵌套 Wrapper 块使用自定义形状 ===
    const wrapperParams = getWrapperParamNames(block.type)
    if (wrapperParams.length > 0 && block.inputList) {
        for (const paramName of wrapperParams) {
            const input = block.inputList.find(i => i.name === paramName)
            if (!input?.connection) continue
            const child = input.connection.targetBlock()
            if (!child?.svgPath_) continue
            // text shadow 块 或 嵌套的 Wrapper 对象块 都需要自定义形状
            if (child.type === 'text' || isWrapperBlock(child.type)) {
                child.svgPath_.setAttribute(
                    'transform',
                    `scale(1, ${child.height / 40})`
                )
                child.svgPath_.setAttribute('d', makeModelShape(child.width))
            }
        }
    }
}
