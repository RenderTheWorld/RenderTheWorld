/**
 * 下拉驱动型动态参数积木（Blockly Mutator）
 *
 * 参考 extendableBlock.js 的优秀实践：
 *   - 通过 ScratchBlocks.Blocks 代理在积木定义注册时注入 mutator
 *   - 通过 patch extension.getInfo 收集 mutatorInfo
 *   - 严格分组 Blockly 事件，支持撤销/重做
 *   - 同步清理 VM 端残留输入与幽灵 shadow 块
 *   - 兼容 Gandi / TurboWarp 的 ScratchBlocks 获取方式
 *
 * 用法：
 *   在 BlockGroup.build() 的积木定义中加入 mutatorInfo：
 *     {
 *         opcode: 'mathUtils',
 *         arguments: { op: { type: AT.STRING, menu: 'mathUtilOp' } },
 *         mutatorInfo: {
 *             fieldName: 'op',
 *             defaultValue: 'lerp',
 *             argMap: {
 *                 lerp: [
 *                     { name: 'a', type: 'n', default: 0, label: 'a' },
 *                     { name: 'b', type: 'n', default: 1, label: 'b' },
 *                     { name: 'c', type: 'n', default: 1, label: 'c' }
 *                 ],
 *                 deg2rad: [{ name: 'a', type: 'n', default: 0, label: 'a' }]
 *             }
 *         }
 *     }
 *
 *   在 index.js 的 inMainWorkspace 中调用：
 *     initMutatorBlocks(this)
 *
 * 参数类型：
 *   - 'n': 数字（shadow: math_number）
 *   - 's': 字符串（shadow: text）
 *   - 'b': 布尔（shadow: logic_boolean）
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

import { getScratchBlocks } from './injector.js'

/** @type {Object<string, import('../blocks/BlockGroup.js').MutatorInfo>} */
const enabledMutatorBlocksInfo = {}

let proxingBlocklyBlocks = false

/**
 * 从工作区动态获取运行时，避免闭包引用过期。
 * 兼容 Gandi（workspace.target.runtime）与 TurboWarp（options.parentWorkspace 链）。
 * @param {any} workspace
 * @returns {any}
 */
function getRuntimeFromWorkspace(workspace) {
    // Gandi 环境
    if (workspace?.target?.runtime) return workspace.target.runtime

    // 尝试通过 workspace 自身或父工作区找到 runtime
    let ws = workspace
    while (ws) {
        if (ws.runtime) return ws.runtime
        if (ws.target?.runtime) return ws.target.runtime
        ws = ws.options?.parentWorkspace
    }

    // 兜底：主工作区
    const ScratchBlocks = /** @type {any} */ (window.ScratchBlocks)
    const mainWs = ScratchBlocks?.getMainWorkspace?.()
    return mainWs?.runtime || mainWs?.target?.runtime
}

/**
 * 根据积木 ID 精确查找所属 Target
 * @param {any} runtime
 * @param {string} blockId
 * @returns {any}
 */
function getTargetForBlock(runtime, blockId) {
    if (runtime.getTargetForBlock) return runtime.getTargetForBlock(blockId)
    return runtime?.targets?.find(
        target => target.blocks?._blocks[blockId]
    )
}

/**
 * 递归删除 VM 端指定积木（用于清理孤儿块）
 * @param {any} target
 * @param {string} blockId
 */
function deleteBlockRecursive(target, blockId) {
    if (!target?.blocks?._blocks[blockId]) return
    const block = target.blocks._blocks[blockId]

    // 先递归删除输入中的子块
    Object.values(block.inputs || {}).forEach(/** @type {any} */ input => {
        if (input.block) deleteBlockRecursive(target, input.block)
        if (input.shadow) deleteBlockRecursive(target, input.shadow)
    })

    target.blocks.deleteBlock(blockId, {
        source: 'default',
        targetId: target.id
    })
}

/**
 * 清理 VM 端残留的动态输入与幽灵 shadow 块。
 *
 * 注意：不要删除 input.block（用户积木）！当 Blockly 层移除输入并断开连接后，
 * 用户积木应变为孤儿块漂浮在工作区上，这是 Scratch/Blockly 的标准行为。
 * 本函数仅负责：
 *   1. 删除 VM 端残留 input.shadow（对应 Blockly 层已 dispose 的 shadow 块）
 *   2. 删除 VM 端残留 input 映射条目
 *   3. 通知 runtime 输入已删除
 *
 * @param {any} runtime
 * @param {any} block
 * @param {string[]} keepArgNames 需要保留的参数名
 */
function cleanInputs(runtime, block, keepArgNames) {
    const workspaceRuntime = runtime || getRuntimeFromWorkspace(block?.workspace)
    if (!workspaceRuntime) return

    const target =
        getTargetForBlock(workspaceRuntime, block.id) ||
        workspaceRuntime.getEditingTarget?.()
    if (!target?.blocks?._blocks[block.id]) return

    const vmBlock = target.blocks._blocks[block.id]
    Object.keys(vmBlock.inputs).forEach(name => {
        if (!keepArgNames.includes(name)) {
            const input = vmBlock.inputs[name]
            // 仅清理 shadow 块；用户积木在 Blockly 层 disconnect 后应保留为孤儿块
            if (input.shadow) deleteBlockRecursive(target, input.shadow)
            delete vmBlock.inputs[name]
            if (workspaceRuntime.emitTargetBlocksChanged) {
                workspaceRuntime.emitTargetBlocksChanged(target.id, [
                    'deleteInput',
                    { id: vmBlock.id, inputName: name }
                ])
            }
        }
    })
}

/**
 * 为 ScratchBlocks.Blocks 设置代理，在积木定义注册时自动注入 mutator 逻辑。
 * 使用 Proxy 包裹原对象，保留所有既有属性与方法，仅拦截 set。
 * @param {any} ScratchBlocks
 * @param {any} runtime
 */
function proxyBlocklyBlocksObject(ScratchBlocks, runtime) {
    if (proxingBlocklyBlocks) return
    proxingBlocklyBlocks = true
    if (!ScratchBlocks) return

    const originalBlocks = ScratchBlocks.Blocks
    ScratchBlocks.Blocks = new Proxy(originalBlocks, {
        get(target, prop, receiver) {
            return Reflect.get(target, prop, receiver)
        },
        set(target, opcode, blockDefinition) {
            if (
                typeof opcode === 'string' &&
                Object.prototype.hasOwnProperty.call(
                    enabledMutatorBlocksInfo,
                    opcode
                )
            ) {
                initMutatorBlock(
                    blockDefinition,
                    enabledMutatorBlocksInfo[opcode],
                    ScratchBlocks,
                    runtime
                )
            }
            return Reflect.set(target, opcode, blockDefinition)
        },
        ownKeys(target) {
            return Reflect.ownKeys(target)
        },
        getOwnPropertyDescriptor(target, prop) {
            return Reflect.getOwnPropertyDescriptor(target, prop)
        }
    })
}

/**
 * 构造 shadow 积木的 XML
 * @param {string} type 'n' | 's' | 'b'
 * @param {any} defaultValue
 * @returns {Element}
 */
function buildShadowDom(type, defaultValue) {
    const typeMap = { n: 'math_number', s: 'text', b: 'logic_boolean' }
    const blockType = typeMap[type] || 'text'
    const shadow = document.createElement('shadow')
    shadow.setAttribute('type', blockType)

    if (type === 'n') {
        const field = document.createElement('field')
        field.setAttribute('name', 'NUM')
        field.textContent = String(defaultValue ?? 0)
        shadow.appendChild(field)
    } else if (type === 's') {
        const field = document.createElement('field')
        field.setAttribute('name', 'TEXT')
        field.textContent = String(defaultValue ?? '')
        shadow.appendChild(field)
    } else if (type === 'b') {
        const field = document.createElement('field')
        field.setAttribute('name', 'BOOL')
        field.textContent = String(defaultValue ?? 'FALSE')
        shadow.appendChild(field)
    }
    return shadow
}

/**
 * 检查输出类型与输入类型是否兼容
 * @param {any} outputConnection
 * @param {any} inputConnection
 * @returns {boolean}
 */
function isConnectionCompatible(outputConnection, inputConnection) {
    if (!outputConnection || !inputConnection) return false
    if (!outputConnection.check_ && !inputConnection.check_) return true
    if (!outputConnection.check_ || !inputConnection.check_) return true
    const outputChecks = Array.isArray(outputConnection.check_)
        ? outputConnection.check_
        : [outputConnection.check_]
    const inputChecks = Array.isArray(inputConnection.check_)
        ? inputConnection.check_
        : [inputConnection.check_]
    return outputChecks.some(check => inputChecks.includes(check))
}

/**
 * 读取 shadow 积木的字段值
 * @param {any} shadowBlock
 * @returns {string|null}
 */
function getShadowBlockValue(shadowBlock) {
    if (!shadowBlock) return null
    const type = shadowBlock.type
    if (type === 'math_number') return shadowBlock.getFieldValue('NUM')
    if (type === 'text') return shadowBlock.getFieldValue('TEXT')
    if (type === 'logic_boolean') return shadowBlock.getFieldValue('BOOL')
    return null
}

/**
 * 比较默认值与当前 shadow 值（统一按字符串比较）
 * @param {any} defaultValue
 * @param {string|null} currentValue
 * @returns {boolean}
 */
function isStillDefault(defaultValue, currentValue) {
    if (currentValue === null) return false
    return String(currentValue).toLowerCase() === String(defaultValue).toLowerCase()
}

/**
 * 为单个输入附加 shadow 默认值
 * @param {any} block
 * @param {any} input
 * @param {string} type
 * @param {any} defaultValue
 * @param {any} ScratchBlocks
 */
function attachShadow(block, input, type, defaultValue, ScratchBlocks) {
    if (!block.workspace || block.isInsertionMarker()) return

    const typeMap = { n: 'math_number', s: 'text', b: 'logic_boolean' }
    const blockType = typeMap[type] || 'text'

    const eventsWereDisabled = !ScratchBlocks.Events.isEnabled()
    if (!eventsWereDisabled) ScratchBlocks.Events.disable()
    try {
        const shadowBlock = block.workspace.newBlock(blockType)

        if (type === 'n')
            shadowBlock.setFieldValue(String(defaultValue ?? 0), 'NUM')
        else if (type === 's')
            shadowBlock.setFieldValue(String(defaultValue ?? ''), 'TEXT')
        else if (type === 'b')
            shadowBlock.setFieldValue(String(defaultValue ?? 'FALSE'), 'BOOL')

        shadowBlock.setShadow(true)
        if (!block.isInsertionMarker()) {
            shadowBlock.initSvg()
            shadowBlock.render(false)
        }

        if (!eventsWereDisabled && ScratchBlocks.Events.isEnabled()) {
            ScratchBlocks.Events.fire(
                new ScratchBlocks.Events.BlockCreate(shadowBlock)
            )
        }
        shadowBlock.outputConnection.connect(input.connection)
    } catch {
        // shadow 块创建失败时回退到仅设置 DOM
        input.connection.setShadowDom(buildShadowDom(type, defaultValue))
    } finally {
        if (!eventsWereDisabled) ScratchBlocks.Events.enable()
    }
}

/**
 * 为单个积木定义注入下拉驱动 mutator
 * @param {any} blockDefinition
 * @param {import('../blocks/BlockGroup.js').MutatorInfo} mutatorInfo
 * @param {any} ScratchBlocks
 * @param {any} runtime
 */
function initMutatorBlock(blockDefinition, mutatorInfo, ScratchBlocks, runtime) {
    const { fieldName, defaultValue, argMap } = mutatorInfo

    /** @type {Set<string>} */
    const allArgNames = new Set()
    Object.values(argMap).forEach(args => {
        args.forEach(arg => allArgNames.add(arg.name))
    })

    const orgInit = blockDefinition.init
    blockDefinition.init = /** @this {any} */ function () {
        if (orgInit) orgInit.call(this)

        this.mutatorInfo_ = mutatorInfo
        this.mutatorFieldName_ = fieldName
        this.mutatorArgNames_ = allArgNames
        this.mutatorUpdating_ = false
        this.mutatorRuntime_ = runtime
        this.mutatorPreviousValue_ = null

        const field = this.getField(fieldName)
        if (!field) return

        const currentValue = field.getValue()
        if (!currentValue || !argMap[currentValue]) {
            field.setValue(defaultValue)
        }

        this._updateMutatorInputs()

        // 使用 field validator 响应下拉变化，比 setOnChange 更直接可靠
        field.setValidator(/** @this {any} */ function (newValue) {
            const sourceBlock = this.sourceBlock_
            if (sourceBlock && !sourceBlock.mutatorUpdating_) {
                ScratchBlocks.Events.setGroup(true)
                sourceBlock._updateMutatorInputs()
                ScratchBlocks.Events.setGroup(false)
            }
            return newValue
        })

        // setOnChange 作为兜底，处理撤销/重做等事件
        this.setOnChange(/** @this {any} */ function (event) {
            if (!event || this.mutatorUpdating_ || this.isInFlyout) return

            const isFieldChange =
                ((event.type === ScratchBlocks.Events.CHANGE ||
                    event.type === ScratchBlocks.Events.BLOCK_CHANGE) &&
                    event.element === 'field' &&
                    event.name === fieldName) ||
                (event.type === ScratchBlocks.Events.BLOCK_CHANGE &&
                    event.name === fieldName)

            if (isFieldChange) {
                ScratchBlocks.Events.setGroup(true)
                this._updateMutatorInputs()
                ScratchBlocks.Events.setGroup(false)
            }
        })
    }

    blockDefinition.mutationToDom = /** @this {any} */ function () {
        const container = document.createElement('mutation')
        container.setAttribute(
            fieldName,
            this.getFieldValue(fieldName) || defaultValue
        )
        return container
    }

    blockDefinition.domToMutation = /** @this {any} */ function (xmlElement) {
        this.mutatorInfo_ = mutatorInfo
        this.mutatorFieldName_ = fieldName
        this.mutatorArgNames_ = allArgNames
        this.mutatorUpdating_ = false
        this.mutatorRuntime_ = runtime

        const value = xmlElement.getAttribute(fieldName) || defaultValue
        this.mutatorPreviousValue_ = value
        const field = this.getField(fieldName)
        if (field) {
            field.setValue(value)
        }
        this._updateMutatorInputs()
    }

    blockDefinition._updateMutatorInputs = /** @this {any} */ function () {
        if (this.mutatorUpdating_) return
        this.mutatorUpdating_ = true

        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        /** @type {string[]} */
        let currentArgNames = []
        /** @type {string} */
        let value = defaultValue
        const eventsWereEnabled = ScratchBlocks.Events.isEnabled()

        if (eventsWereEnabled) ScratchBlocks.Events.disable()

        try {
            value = this.getFieldValue(fieldName) || defaultValue
            const argConfig = argMap[value] || argMap[defaultValue] || []
            currentArgNames = argConfig.map(a => a.name)

            // 记录上一次选项的默认值，用于判断是否需要重置为新的默认值
            const previousValue = this.mutatorPreviousValue_ || defaultValue
            const previousArgConfig =
                argMap[previousValue] || argMap[defaultValue] || []
            /** @type {Object<string, any>} */
            const previousDefaults = {}
            previousArgConfig.forEach(arg => {
                previousDefaults[arg.name] = arg.default
            })

            const wasRendered = this.rendered
            this.rendered = false

            // 1. 断开并保存所有动态输入上的连接块（同 extendableBlock.js 模式）
            /** @type {Object<string, {block: any, shadow: Element|null}>} */
            const connectionMap = {}
            for (let i = 0; i < this.inputList.length; i++) {
                const input = this.inputList[i]
                if (allArgNames.has(input.name) && input.connection) {
                    const targetBlock = input.connection.targetBlock()
                    connectionMap[input.name] = {
                        block: targetBlock,
                        shadow: input.connection.getShadowDom()
                    }
                    input.connection.setShadowDom(null)
                    if (targetBlock) input.connection.disconnect()
                }
            }

            // 2. 移除旧动态输入（dispose 会修改 inputList，需从后向前遍历并重建列表）
            const inputsToRemove = []
            for (let i = 0; i < this.inputList.length; i++) {
                const input = this.inputList[i]
                if (allArgNames.has(input.name)) inputsToRemove.push(input)
            }
            inputsToRemove.forEach(input => input.dispose())
            this.inputList = this.inputList.filter(
                input => !allArgNames.has(input.name)
            )

            // 3. 根据当前选项添加新输入并尝试复用旧块
            argConfig.forEach(arg => {
                const input = this.appendValueInput(arg.name)
                if (arg.label) {
                    input.appendField(arg.label)
                }
                // 'n' 不设置 setCheck，允许任意圆形积木接入（符合 Scratch 标准行为），
                // 运行时再用 cast.toNumber 转换
                if (arg.type === 'b') input.setCheck('Boolean')

                const saved = connectionMap[arg.name]
                if (
                    saved &&
                    saved.block &&
                    isConnectionCompatible(saved.block.outputConnection, input.connection)
                ) {
                    // 若该参数仍保留上一次选项的默认值，则重置为当前选项的默认值
                    const shouldResetDefault =
                        saved.block.isShadow() &&
                        isStillDefault(
                            previousDefaults[arg.name],
                            getShadowBlockValue(saved.block)
                        )

                    if (shouldResetDefault) {
                        saved.block.dispose(false, false)
                        attachShadow(this, input, arg.type, arg.default, ScratchBlocks)
                    } else {
                        saved.block.outputConnection.connect(input.connection)
                        if (arg.type !== 'b') {
                            const shadowDom =
                                saved.shadow || buildShadowDom(arg.type, arg.default)
                            input.connection.setShadowDom(shadowDom)
                        }
                    }
                    // 标记为已复用
                    connectionMap[arg.name] = null
                } else {
                    attachShadow(this, input, arg.type, arg.default, ScratchBlocks)
                }
            })

            // 4. 删除未被复用的 Shadow 块（用户块保持漂浮，符合 Blockly 惯例）
            // 使用 dispose(false, false) 禁用动画与堆栈愈合，保持和 extendableBlock.js 一致
            Object.values(connectionMap).forEach(info => {
                if (info && info.block && info.block.isShadow()) {
                    info.block.dispose(false, false)
                }
            })

            this.rendered = wasRendered
            if (wasRendered && !this.isInsertionMarker()) {
                this.initSvg()
                this.render()
            }
        } catch (err) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('[mutatorBlock] update failed', this.id || this.type, err)
            }
        } finally {
            if (eventsWereEnabled) ScratchBlocks.Events.enable()

            const newMutationDom = this.mutationToDom()
            const newMutation =
                newMutationDom && ScratchBlocks.Xml.domToText(newMutationDom)
            if (oldMutation !== newMutation && ScratchBlocks.Events.isEnabled()) {
                ScratchBlocks.Events.fire(
                    new ScratchBlocks.Events.BlockChange(
                        this,
                        'mutation',
                        null,
                        oldMutation,
                        newMutation
                    )
                )
            }
            // 记录本次选项值，供下一次切换时判断默认值是否需要重置
            this.mutatorPreviousValue_ = value
            this.mutatorUpdating_ = false

            // 5. 异步清理 VM 端残留输入（参考 extendableBlock.js）
            setTimeout(() => {
                cleanInputs(this.mutatorRuntime_, this, currentArgNames)
            }, 0)
        }
    }
}

const patchSymbol = Symbol('mutatorPatch')

/**
 * 初始化指定扩展的下拉驱动 mutator 积木
 * @param {{runtime?: any, ScratchBlocks?: any, getInfo?: () => any}} extension
 */
function initMutatorBlocks(extension) {
    const runtime = extension.runtime
    const ScratchBlocks = extension.ScratchBlocks || getScratchBlocks(runtime)
    proxyBlocklyBlocksObject(ScratchBlocks, runtime)

    if (extension[patchSymbol]) return
    extension[patchSymbol] = true

    const origGetInfo = extension.getInfo
    extension.getInfo = function () {
        const info = origGetInfo.call(this)
        if (info && Array.isArray(info.blocks)) {
            info.blocks.forEach(b => {
                if (b && b.mutatorInfo && b.opcode) {
                    enabledMutatorBlocksInfo[`${info.id}_${b.opcode}`] =
                        b.mutatorInfo
                }
            })
        }
        return info
    }
}

export { initMutatorBlocks }
