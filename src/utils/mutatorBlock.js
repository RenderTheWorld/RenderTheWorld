/**
 * 下拉驱动型动态参数积木（Blockly Mutator）
 *
 * 优化版：
 *   - 完美支持 Undo / Redo（不打断外部 Event Group）
 *   - 异步触发 Validator，防止 Blockly 引擎死锁
 *   - 递归且安全的 VM 幽灵块清理
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */

import { getScratchBlocks } from './injector.js'

/** @type {Object<string, import('../blocks/BlockGroup.js').MutatorInfo>} */
const enabledMutatorBlocksInfo = {}
const PROXY_MARK = Symbol.for('MutatorProxyMark')

function getRuntimeFromWorkspace(workspace) {
    if (workspace?.target?.runtime) return workspace.target.runtime
    let ws = workspace
    while (ws) {
        if (ws.runtime) return ws.runtime
        if (ws.target?.runtime) return ws.target.runtime
        ws = ws.options?.parentWorkspace
    }
    const ScratchBlocks = /** @type {any} */ (window.ScratchBlocks)
    const mainWs = ScratchBlocks?.getMainWorkspace?.()
    return mainWs?.runtime || mainWs?.target?.runtime
}

function getTargetForBlock(runtime, blockId) {
    if (runtime.getTargetForBlock) return runtime.getTargetForBlock(blockId)
    return runtime?.targets?.find(target => target.blocks?._blocks[blockId])
}

function deleteBlockRecursive(target, blockId) {
    if (!target?.blocks?._blocks[blockId]) return
    const block = target.blocks._blocks[blockId]

    Object.values(block.inputs || {}).forEach(
        /** @type {any} */ input => {
            if (input.block) deleteBlockRecursive(target, input.block)
            if (input.shadow) deleteBlockRecursive(target, input.shadow)
        }
    )

    target.blocks.deleteBlock(blockId, {
        source: 'default',
        targetId: target.id
    })
}

function cleanInputs(runtime, block, keepArgNames) {
    if (!block || !block.workspace) return
    try {
        const workspaceRuntime =
            runtime || getRuntimeFromWorkspace(block.workspace)
        if (!workspaceRuntime) return

        const target =
            getTargetForBlock(workspaceRuntime, block.id) ||
            workspaceRuntime.getEditingTarget?.()
        if (!target?.blocks?._blocks[block.id]) return

        const vmBlock = target.blocks._blocks[block.id]
        Object.keys(vmBlock.inputs).forEach(name => {
            if (!keepArgNames.includes(name)) {
                const input = vmBlock.inputs[name]
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
    } catch (e) {
        console.warn('[cleanInputs] Error cleaning VM inputs:', e)
    }
}

function proxyBlocklyBlocksObject(ScratchBlocks, runtime) {
    if (!ScratchBlocks || ScratchBlocks[PROXY_MARK]) return
    ScratchBlocks[PROXY_MARK] = true

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
        }
    })
}

function buildShadowDom(type, defaultValue) {
    const typeMap = { n: 'math_number', s: 'text', b: 'logic_boolean' }
    const blockType = typeMap[type] || 'text'
    const shadow = document.createElement('shadow')
    shadow.setAttribute('type', blockType)

    const field = document.createElement('field')
    if (type === 'n') {
        field.setAttribute('name', 'NUM')
        field.textContent = String(defaultValue ?? 0)
    } else if (type === 's') {
        field.setAttribute('name', 'TEXT')
        field.textContent = String(defaultValue ?? '')
    } else if (type === 'b') {
        field.setAttribute('name', 'BOOL')
        field.textContent = String(defaultValue ?? 'FALSE')
    }

    shadow.appendChild(field)
    return shadow
}

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

function getShadowBlockValue(shadowBlock) {
    if (!shadowBlock) return null
    const type = shadowBlock.type
    if (type === 'math_number') return shadowBlock.getFieldValue('NUM')
    if (type === 'text') return shadowBlock.getFieldValue('TEXT')
    if (type === 'logic_boolean') return shadowBlock.getFieldValue('BOOL')
    return null
}

function isStillDefault(defaultValue, currentValue) {
    if (currentValue === null) return false
    return (
        String(currentValue).toLowerCase() ===
        String(defaultValue).toLowerCase()
    )
}

function attachShadow(block, input, type, defaultValue, ScratchBlocks) {
    if (!block.workspace || block.isInsertionMarker()) return
    const typeMap = { n: 'math_number', s: 'text', b: 'logic_boolean' }
    const blockType = typeMap[type] || 'text'

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
        shadowBlock.outputConnection.connect(input.connection)
    } catch {
        input.connection.setShadowDom(buildShadowDom(type, defaultValue))
    }
}

function initMutatorBlock(
    blockDefinition,
    mutatorInfo,
    ScratchBlocks,
    runtime
) {
    const { fieldName, defaultValue, argMap } = mutatorInfo
    const allArgNames = new Set()
    Object.values(argMap).forEach(args =>
        args.forEach(arg => allArgNames.add(arg.name))
    )

    const orgInit = blockDefinition.init
    blockDefinition.init = function () {
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
        if (!currentValue || !argMap[currentValue]) field.setValue(defaultValue)

        this._updateMutatorInputs()

        // 异步调用防死锁
        field.setValidator(function (newValue) {
            const sourceBlock = this.sourceBlock_
            if (
                sourceBlock &&
                !sourceBlock.mutatorUpdating_ &&
                newValue !== this.getValue()
            ) {
                setTimeout(() => {
                    if (!sourceBlock.workspace) return
                    const currentGroup = ScratchBlocks.Events.getGroup()
                    if (!currentGroup) ScratchBlocks.Events.setGroup(true)
                    sourceBlock._updateMutatorInputs()
                    if (!currentGroup) ScratchBlocks.Events.setGroup(false)
                }, 0)
            }
            return newValue
        })
    }

    blockDefinition.mutationToDom = function () {
        const container = document.createElement('mutation')
        container.setAttribute(
            fieldName,
            this.getFieldValue(fieldName) || defaultValue
        )
        return container
    }

    blockDefinition.domToMutation = function (xmlElement) {
        this.mutatorInfo_ = mutatorInfo
        this.mutatorFieldName_ = fieldName
        this.mutatorArgNames_ = allArgNames
        this.mutatorUpdating_ = false
        this.mutatorRuntime_ = runtime

        const value = xmlElement.getAttribute(fieldName) || defaultValue
        this.mutatorPreviousValue_ = value
        const field = this.getField(fieldName)
        if (field) field.setValue(value)
        this._updateMutatorInputs()
    }

    blockDefinition._updateMutatorInputs = function () {
        if (this.mutatorUpdating_) return
        this.mutatorUpdating_ = true

        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        let currentArgNames = []
        let value = defaultValue

        try {
            value = this.getFieldValue(fieldName) || defaultValue
            const argConfig = argMap[value] || argMap[defaultValue] || []
            currentArgNames = argConfig.map(a => a.name)

            const previousValue = this.mutatorPreviousValue_ || defaultValue
            const previousArgConfig =
                argMap[previousValue] || argMap[defaultValue] || []
            const previousDefaults = {}
            previousArgConfig.forEach(
                arg => (previousDefaults[arg.name] = arg.default)
            )

            const wasRendered = this.rendered
            this.rendered = false

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

            const inputsToRemove = []
            for (let i = 0; i < this.inputList.length; i++) {
                const input = this.inputList[i]
                if (allArgNames.has(input.name)) inputsToRemove.push(input)
            }
            inputsToRemove.forEach(input => input.dispose())
            this.inputList = this.inputList.filter(
                input => !allArgNames.has(input.name)
            )

            argConfig.forEach(arg => {
                const input = this.appendValueInput(arg.name)
                if (arg.label) input.appendField(arg.label)
                if (arg.type === 'b') input.setCheck('Boolean')

                const saved = connectionMap[arg.name]
                if (
                    saved &&
                    saved.block &&
                    isConnectionCompatible(
                        saved.block.outputConnection,
                        input.connection
                    )
                ) {
                    const shouldResetDefault =
                        saved.block.isShadow() &&
                        isStillDefault(
                            previousDefaults[arg.name],
                            getShadowBlockValue(saved.block)
                        )
                    if (shouldResetDefault) {
                        saved.block.dispose(false, false)
                        attachShadow(
                            this,
                            input,
                            arg.type,
                            arg.default,
                            ScratchBlocks
                        )
                    } else {
                        saved.block.outputConnection.connect(input.connection)
                        if (arg.type !== 'b') {
                            const shadowDom =
                                saved.shadow ||
                                buildShadowDom(arg.type, arg.default)
                            input.connection.setShadowDom(shadowDom)
                        }
                    }
                    connectionMap[arg.name] = null
                } else {
                    attachShadow(
                        this,
                        input,
                        arg.type,
                        arg.default,
                        ScratchBlocks
                    )
                }
            })

            Object.values(connectionMap).forEach(info => {
                if (info && info.block && info.block.isShadow())
                    info.block.dispose(false, false)
            })

            this.rendered = wasRendered
            if (wasRendered && !this.isInsertionMarker()) {
                this.initSvg()
                this.render()
            }
        } finally {
            const newMutationDom = this.mutationToDom()
            const newMutation =
                newMutationDom && ScratchBlocks.Xml.domToText(newMutationDom)
            if (
                oldMutation !== newMutation &&
                ScratchBlocks.Events.isEnabled()
            ) {
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
            this.mutatorPreviousValue_ = value
            this.mutatorUpdating_ = false

            setTimeout(
                () => cleanInputs(this.mutatorRuntime_, this, currentArgNames),
                0
            )
        }
    }
}

const patchSymbol = Symbol('mutatorPatch')

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
