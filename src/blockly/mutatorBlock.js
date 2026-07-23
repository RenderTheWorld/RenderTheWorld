/**
 * mutatorBlock.js - 下拉驱动型动态参数积木（Blockly Mutator）
 * ====================================================================
 * 【使用教程】
 * 在扩展的 getInfo() 注册积木时，配置 `mutatorInfo` 属性。
 *
 * 🟢 简单用法（单组，最常用）：
 * mutatorInfo: {
 *     fieldName: 'OP',          // 必填：触发下拉变化的 Blockly 字段名
 *     defaultValue: 'A',        // 必填：该下拉菜单的默认选项值
 *     afterArg: 'OP',          // 选填：新生成的参数紧跟在哪个已有的参数名之后（不填则默认加在末尾）
 *     argMap: {                 // 必填：下拉选项对应要生成的参数列表
 *         'A': [
 *             { name: 'X', type: 'n', default: 0, label: '坐标X' }
 *         ],
 *         'B': [
 *             { name: 'X', type: 'n', default: 0, label: '坐标X' },
 *             { name: 'Y', type: 'n', default: 0, label: '坐标Y' }
 *         ]
 *     }
 * }
 *
 * 🔴 高级用法（多组并发）：
 * 如果一个积木有2个下拉菜单，分别控制两拨参数，直接传入数组即可！
 * mutatorInfo: [
 *     { fieldName: 'MODE1', defaultValue: 'A', argMap: { ... } },
 *     { fieldName: 'MODE2', defaultValue: 'C', argMap: { ... } }
 * ]
 *
 * 【支持的参数类型】
 *  n:数字 | s:文本 | b:布尔 | c:C型分支槽 | color:颜色 | angle:角度
 *
 * 【运行时取值】
 * Scratch 会直接以 `argMap` 中定义的 `name` (如上文的 args.X) 传给你的执行函数。
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
// @ts-nocheck

import { getScratchBlocks } from '../scratch/injector.js'

const enabledMutatorBlocksInfo = {}
const PROXY_MARK = Symbol.for('MutatorProxyMark')

// 严谨兼容的类型映射表，修正了 angle 的字段名
// const TYPE_TABLE = {
//     n: { shadow: 'math_number', field: 'NUM', check: 'Number' },
//     s: { shadow: 'text', field: 'TEXT', check: null },
//     l: { shadow: 'text', field: 'TEXT', check: null },
//     b: { shadow: 'logic_boolean', field: 'BOOL', check: 'Boolean' },
//     color: { shadow: 'colour_picker', field: 'COLOUR', check: null },
//     angle: { shadow: 'math_angle', field: 'NUM', check: 'Number' },
//     c: { shadow: null, field: null, check: null }
// }
// check 全部为 null，不限制输入类型，允许 RTW 扩展积木连接
const TYPE_TABLE = {
    n: { shadow: 'math_number', field: 'NUM', check: null },
    s: { shadow: 'text', field: 'TEXT', check: null },
    l: { shadow: 'text', field: 'TEXT', check: null },
    b: { shadow: 'logic_boolean', field: 'BOOL', check: null },
    color: { shadow: 'colour_picker', field: 'COLOUR', check: null },
    angle: { shadow: 'math_angle', field: 'NUM', check: null },
    c: { shadow: null, field: null, check: null }
}

function getRuntimeFromWorkspace(workspace) {
    if (workspace?.target?.runtime) return workspace.target.runtime
    let ws = workspace
    while (ws) {
        if (ws.runtime) return ws.runtime
        if (ws.target?.runtime) return ws.target.runtime
        ws = ws.options?.parentWorkspace
    }
    const ScratchBlocks =
        typeof window !== 'undefined' ? window.ScratchBlocks : null
    const mainWs = ScratchBlocks?.getMainWorkspace?.()
    return mainWs?.runtime || mainWs?.target?.runtime
}

/**
 * 清除 VM 端多余的槽位和幽灵积木（参考 extendableBlock 实现）
 */
function cleanInputs(runtime, block, keepArgNames, allArgNames) {
    if (!block || !block.workspace) return
    try {
        const rt = runtime || getRuntimeFromWorkspace(block.workspace)
        if (!rt) return
        const target =
            rt.getTargetForBlock?.(block.id) || rt.getEditingTarget?.()
        if (!target?.blocks?._blocks[block.id]) return

        const vmBlock = target.blocks._blocks[block.id]
        Object.keys(vmBlock.inputs).forEach(name => {
            if (allArgNames.has(name) && !keepArgNames.includes(name)) {
                const input = vmBlock.inputs[name]
                // 安全移除幽灵积木，避免递归引发崩溃
                if (input.shadow) {
                    target.blocks.deleteBlock(input.shadow, {
                        source: 'default',
                        targetId: target.id
                    })
                }
                delete vmBlock.inputs[name]
                if (rt.emitTargetBlocksChanged) {
                    rt.emitTargetBlocksChanged(target.id, [
                        'deleteInput',
                        { id: vmBlock.id, inputName: name }
                    ])
                }
            }
        })
    } catch (e) {
        console.warn('[Mutator] VM Cleanup Failed:', e)
    }
}

function proxyBlocklyBlocksObject(ScratchBlocks, runtime) {
    if (!ScratchBlocks || ScratchBlocks[PROXY_MARK]) return
    ScratchBlocks[PROXY_MARK] = true

    ScratchBlocks.Blocks = new Proxy(ScratchBlocks.Blocks, {
        set(target, opcode, blockDefinition) {
            if (
                typeof opcode === 'string' &&
                enabledMutatorBlocksInfo[opcode]
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
    const info = TYPE_TABLE[type] || TYPE_TABLE.s
    if (!info.shadow) return null

    const shadow = document.createElement('shadow')
    shadow.setAttribute('type', info.shadow)

    if (info.field) {
        const f = document.createElement('field')
        f.setAttribute('name', info.field)
        f.textContent =
            type === 'b'
                ? defaultValue
                    ? 'TRUE'
                    : 'FALSE'
                : String(
                      defaultValue ??
                          (type === 'n' || type === 'angle' ? 0 : '')
                  )
        shadow.appendChild(f)
    }
    return shadow
}

// 修改后的 attachShadow 函数
function attachShadow(block, input, type, defaultValue, ScratchBlocks) {
    // 【增加防御】如果是影子积木或插入标记，直接跳出，防止连环触发游离
    if (!block.workspace || block.isInsertionMarker() || block.isShadow())
        return

    const info = TYPE_TABLE[type] || TYPE_TABLE.s
    if (!info.shadow) return

    const eventsEnabled = ScratchBlocks.Events.isEnabled()
    if (eventsEnabled) ScratchBlocks.Events.disable()
    let sb
    try {
        sb = block.workspace.newBlock(info.shadow)
        if (info.field) {
            const val =
                type === 'b'
                    ? defaultValue
                        ? 'TRUE'
                        : 'FALSE'
                    : String(
                          defaultValue ??
                              (type === 'n' || type === 'angle' ? 0 : '')
                      )
            sb.setFieldValue(val, info.field)
        }
        sb.setShadow(true)

        // 建立连接
        if (sb.outputConnection) sb.outputConnection.connect(input.connection)
        else if (sb.previousConnection)
            sb.previousConnection.connect(input.connection)

        // 【关键修复】对齐 expandableBlock.js，创建后立即初始化 SVG！
        // 不要依赖于最后的统一遍历，立即渲染才能被 Blockly 的事件流正确捕获
        if (!block.isInsertionMarker()) {
            sb.initSvg()
            sb.render(false)
        }
    } catch (e) {
        if (eventsEnabled) ScratchBlocks.Events.enable()
        const dom = buildShadowDom(type, defaultValue)
        if (dom) input.connection.setShadowDom(dom)
        return
    }
    if (eventsEnabled) ScratchBlocks.Events.enable()

    if (ScratchBlocks.Events.isEnabled()) {
        const ev = new ScratchBlocks.Events.BlockCreate(sb)
        ev.recordUndo = false
        ScratchBlocks.Events.fire(ev)
    }
}

function getShadowBlockValue(shadowBlock) {
    if (!shadowBlock) return null
    const type = shadowBlock.type
    if (type === 'math_number' || type === 'math_angle')
        return (
            shadowBlock.getFieldValue('NUM') ||
            shadowBlock.getFieldValue('ANGLE')
        )
    if (type === 'text') return shadowBlock.getFieldValue('TEXT')
    if (type === 'logic_boolean') return shadowBlock.getFieldValue('BOOL')
    if (type === 'colour_picker') return shadowBlock.getFieldValue('COLOUR')
    return null
}

function isStillDefault(defaultValue, currentValue) {
    if (currentValue === null || currentValue === undefined) return false
    return (
        String(currentValue).toLowerCase() ===
        String(defaultValue).toLowerCase()
    )
}

function isConnectionCompatible(outConn, inConn) {
    if (!outConn || !inConn) return false
    const oc = outConn.getCheck ? outConn.getCheck() : outConn.check_
    const ic = inConn.getCheck ? inConn.getCheck() : inConn.check_
    if (!oc && !ic) return true
    if (!oc || !ic) return true
    const oArr = Array.isArray(oc) ? oc : [oc]
    const iArr = Array.isArray(ic) ? ic : [ic]
    return oArr.some(c => iArr.includes(c))
}

function initMutatorBlock(
    blockDefinition,
    mutatorInfoParam,
    ScratchBlocks,
    runtime
) {
    const groups = Array.isArray(mutatorInfoParam)
        ? mutatorInfoParam
        : mutatorInfoParam.groups || [mutatorInfoParam]

    const allArgNames = new Set()
    groups.forEach(g =>
        Object.values(g.argMap).forEach(args =>
            args.forEach(a => allArgNames.add(a.name))
        )
    )

    const orgInit = blockDefinition.init

    blockDefinition.init = function () {
        if (orgInit) orgInit.call(this)
        this.mutatorGroups_ = groups
        this.mutatorUpdating_ = false
        this.mutatorRuntime_ = runtime
        this.mutatorPrevSnapshot_ = null

        groups.forEach(g => {
            const field = this.getField(g.fieldName)
            if (field) {
                if (!field.getValue() || !g.argMap[field.getValue()]) {
                    field.setValue(g.defaultValue)
                }
                field.setValidator(function (newValue) {
                    const src = this.sourceBlock_
                    if (
                        src &&
                        !src.mutatorUpdating_ &&
                        !src.isInFlyout &&
                        newValue !== this.getValue()
                    ) {
                        const oldDom = src.mutationToDom()
                        const oldXml = oldDom
                            ? ScratchBlocks.Xml.domToText(oldDom)
                            : null

                        const group = ScratchBlocks.Events.getGroup()
                        if (!group) ScratchBlocks.Events.setGroup(true)

                        // 【核心修复】恢复微任务，避开 Field 同步 DOM 更新冲突
                        queueMicrotask(() => {
                            if (!src.workspace) return
                            src.updateDisplay_(oldXml)
                            if (!group) ScratchBlocks.Events.setGroup(false)

                            // 【关键补充】在微任务结束后，抛出宏任务强制 Workspace 重绘
                            // 彻底解决“异步修改后 Blockly 不重绘”的问题
                            setTimeout(() => {
                                if (src.workspace) {
                                    if (src.workspace.requestMeasureBlock) {
                                        src.workspace.requestMeasureBlock(src)
                                    } else if (src.workspace.resize) {
                                        src.workspace.resize()
                                    }
                                }
                            }, 0)
                        })
                    }
                    return newValue
                })
            }
        })
        this.updateDisplay_()
    }

    blockDefinition.mutationToDom = function () {
        const container = document.createElement('mutation')
        const state = {}
        groups.forEach(
            g =>
                (state[g.fieldName] =
                    this.getFieldValue(g.fieldName) || g.defaultValue)
        )
        container.setAttribute('mutator_state', JSON.stringify(state))
        return container
    }

    blockDefinition.domToMutation = function (xmlElement) {
        const stateStr = xmlElement.getAttribute('mutator_state')
        if (stateStr) {
            try {
                const state = JSON.parse(stateStr)
                this.mutatorUpdating_ = true
                Object.keys(state).forEach(key => {
                    const f = this.getField(key)
                    if (f) f.setValue(state[key])
                })
                this.mutatorUpdating_ = false
            } catch (e) {
                console.warn('[Mutator] JSON parse error:', e)
            }
        }
        this.updateDisplay_()
    }

    blockDefinition.updateDisplay_ = function (providedOldXml) {
        if (this.isInsertionMarker()) {
            return
        }
        if (this.mutatorUpdating_) return
        this.mutatorUpdating_ = true

        const oldXml =
            providedOldXml !== undefined
                ? providedOldXml
                : this.mutationToDom()
                  ? ScratchBlocks.Xml.domToText(this.mutationToDom())
                  : null

        let currentArgNames = []

        const group = ScratchBlocks.Events.getGroup()
        if (!group) ScratchBlocks.Events.setGroup(true)

        try {
            const targetArgs = []
            groups.forEach(g => {
                // 微任务执行时，Field 的值已经更新，直接读取即可
                const cfg =
                    g.argMap[
                        this.getFieldValue(g.fieldName) || g.defaultValue
                    ] || []
                cfg.forEach(a =>
                    targetArgs.push({ ...a, _afterArg: g.afterArg })
                )
            })
            currentArgNames = targetArgs.map(a => a.name)

            const prevDefaults = {}
            if (this.mutatorPrevSnapshot_) {
                this.mutatorPrevSnapshot_.forEach(a => {
                    prevDefaults[a.name] = a.default
                })
            }

            const wasRendered = this.rendered
            this.rendered = false

            // 保存并断开原有连接
            const connectionMap = {}
            this.inputList.slice().forEach(input => {
                if (allArgNames.has(input.name) && input.connection) {
                    const target = input.connection.targetBlock()
                    connectionMap[input.name] = {
                        block: target,
                        shadow: input.connection.getShadowDom()
                    }
                    input.connection.setShadowDom(null)
                    if (target) input.connection.disconnect()
                }
            })

            // 直接调用 removeInput 清理
            this.inputList.slice().forEach(input => {
                if (allArgNames.has(input.name)) {
                    this.removeInput(input.name)
                }
            })

            // 重建按序插入
            targetArgs.forEach(arg => {
                const info = TYPE_TABLE[arg.type] || TYPE_TABLE.s
                const input =
                    arg.type === 'c'
                        ? this.appendStatementInput(arg.name)
                        : this.appendValueInput(arg.name)

                if (arg.label) input.appendField(arg.label)
                if (info.check) input.setCheck(info.check)

                const saved = connectionMap[arg.name]
                if (
                    saved &&
                    saved.block &&
                    isConnectionCompatible(
                        arg.type === 'c'
                            ? saved.block.previousConnection
                            : saved.block.outputConnection,
                        input.connection
                    )
                ) {
                    const shouldReset =
                        saved.block.isShadow() &&
                        isStillDefault(
                            prevDefaults[arg.name],
                            getShadowBlockValue(saved.block)
                        )

                    if (shouldReset) {
                        if (ScratchBlocks.Events.isEnabled()) {
                            const ev = new ScratchBlocks.Events.BlockDelete(
                                saved.block
                            )
                            ev.recordUndo = false
                            ScratchBlocks.Events.fire(ev)
                        }
                        saved.block.dispose(false, false)
                        attachShadow(
                            this,
                            input,
                            arg.type,
                            arg.default,
                            ScratchBlocks
                        )
                    } else {
                        const conn =
                            arg.type === 'c'
                                ? saved.block.previousConnection
                                : saved.block.outputConnection
                        conn.connect(input.connection)
                        if (arg.type !== 'c') {
                            input.connection.setShadowDom(
                                saved.shadow ||
                                    buildShadowDom(arg.type, arg.default)
                            )
                        }
                    }
                    delete connectionMap[arg.name]
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

            // 排版重定位
            groups.forEach(g => {
                if (!g.afterArg) return
                const afterIdx = this.inputList.findIndex(
                    i => i.name === g.afterArg
                )
                if (afterIdx !== -1) {
                    const groupArgs = targetArgs.filter(
                        a => a._afterArg === g.afterArg
                    )
                    let insertBefore =
                        afterIdx + 1 < this.inputList.length
                            ? this.inputList[afterIdx + 1].name
                            : null
                    groupArgs.forEach(a => {
                        if (insertBefore !== a.name) {
                            this.moveInputBefore(a.name, insertBefore)
                        }
                    })
                }
            })

            // 清理无用的积木
            Object.values(connectionMap).forEach(info => {
                if (info && info.block) {
                    if (info.block.isShadow() || !info.block.getParent()) {
                        if (ScratchBlocks.Events.isEnabled()) {
                            const ev = new ScratchBlocks.Events.BlockDelete(
                                info.block
                            )
                            ev.recordUndo = false
                            ScratchBlocks.Events.fire(ev)
                        }
                        info.block.dispose(false, false)
                    }
                }
            })

            this.rendered = wasRendered

            // 【核心修复】完全对齐 expandableBlock.js，清除尺寸缓存并强制重绘
            if (wasRendered && !this.isInsertionMarker()) {
                // 重置尺寸缓存，逼迫 Blockly 重新计算高度和宽度
                this.height = 0
                this.width = 0
                this.initSvg()
                this.render()
                this.bumpNeighbours_()
            }

            this.mutatorPrevSnapshot_ = targetArgs
        } finally {
            if (!group) ScratchBlocks.Events.setGroup(false)
            const newDom = this.mutationToDom()
            const newXml = newDom ? ScratchBlocks.Xml.domToText(newDom) : null
            if (oldXml !== newXml && ScratchBlocks.Events.isEnabled()) {
                ScratchBlocks.Events.fire(
                    new ScratchBlocks.Events.BlockChange(
                        this,
                        'mutation',
                        null,
                        oldXml,
                        newXml
                    )
                )
            }
            this.mutatorUpdating_ = false
            setTimeout(
                () =>
                    cleanInputs(
                        this.mutatorRuntime_,
                        this,
                        currentArgNames,
                        allArgNames
                    ),
                0
            )
        }
    }
}

export function initMutatorBlocks(extension) {
    const runtime = extension.runtime
    const ScratchBlocks = extension.ScratchBlocks || getScratchBlocks(runtime)
    proxyBlocklyBlocksObject(ScratchBlocks, runtime)

    const origGetInfo = extension.getInfo
    extension.getInfo = function () {
        const info = origGetInfo.call(this)
        info?.blocks?.forEach(b => {
            if (b?.mutatorInfo && b.opcode) {
                enabledMutatorBlocksInfo[`${info.id}_${b.opcode}`] =
                    b.mutatorInfo
            }
        })
        return info
    }
}
