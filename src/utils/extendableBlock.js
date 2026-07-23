/**
 * expandableBlock.js - 按钮驱动型动态可扩展积木
 * ====================================================================
 * 【使用教程】
 * 在扩展的 getInfo() 注册积木时，配置 `dynamicArgsInfo` 属性。
 *
 * 🟢 简单用法（单组，99%的情况直接这么写）：
 * dynamicArgsInfo: {
 *     groupId: 'ARGS',          // 选填：组ID，默认 'ARGS'，多组时必须指定
 *     types: ['s', 'n'],        // 选填：允许添加的参数类型。如果填了多个，点击加号时会自动弹出供用户选择！默认 ['s']
 *     min: 1,                   // 选填：最少保留几个参数（默认1）
 *     max: 10,                  // 选填：最多添加几个参数（默认无限）
 *     defaultValues: ['A'],     // 选填：默认值数组。第N个参数取第N个值，超出的取最后一个值
 *     preText: '拼接',           // 选填：第一个动态参数前面的文字
 *     joinCh: '和',             // 选填：动态参数之间的文字连接符
 *     endText: '结束',           // 选填：最后一个动态参数后面的文字
 *     afterArg: 'SOME_INPUT'    // 选填：新参数插在哪个固定的参数接口之后
 * }
 *
 * 🔴 高级用法（多组并发）：
 * 如果一个积木需要两拨完全不同且独立的 +/- 按钮（比如一拨加参数，一拨加C型分支），直接传数组：
 * dynamicArgsInfo: [
 *     { groupId: 'ARGS', types: ['s'], preText: 'with' },
 *     { groupId: 'BRANCH', types: ['c'], preText: 'do', min: 0 }
 * ]
 *
 * 【支持的类型】
 *  n:数字 | s:文本 | b:布尔 | c:C型分支槽 | color:颜色 | angle:角度
 *
 * 【如何在 execute 函数中获取用户填入的值？】
 * import { getDynamicArgs } from './expandableBlock.js';
 * execute(args) {
 *     // 返回一个数组，按顺序包含所有被动态添加的参数值
 *     // 如果你在高级用法中指定了 groupId，只需传入第二个参数：getDynamicArgs(args, 'BRANCH')
 *     const values = getDynamicArgs(args);
 * }
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */

const INPUT_TYPES_OPTIONS_LABEL = {
    s: 'ADD_TEXT_PARAMETER',
    n: 'ADD_NUM_PARAMETER',
    b: 'ADD_BOOL_PARAMETER',
    c: 'ADD_BRANCH_PARAMETER',
    color: 'ADD_COLOR_PARAMETER',
    angle: 'ADD_ANGLE_PARAMETER'
}

const leftArrow =
    'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNi4zMzU2MSIgaGVpZ2h0PSI0Ni42NjgzOSIgdmlld0JveD0iMCwwLDI2LjMzNTYxLDQ2LjY2ODM5Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzA2LjgzMjIsLTE1Ni42NjU4KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6IG5vcm1hbCI+PHBhdGggZD0iTTMyOC4wNDY4LDIwMi40NTcyNWwtMjAuMzM1NSwtMjAuMzM3Yy0wLjU2Mjg3LC0wLjU2MjY0IC0wLjg3OTExLC0xLjMyNTg5IC0wLjg3OTExLC0yLjEyMTc1YzAsLTAuNzk1ODYgMC4zMTYyNCwtMS41NTkxMSAwLjg3OTExLC0yLjEyMTc1bDIwLjMzNTUsLTIwLjMzMjVjMC44NTc5OCwtMC44NTc3MiAyLjE0ODExLC0xLjExNDI3IDMuMjY4OTYsLTAuNjUwMDNjMS4xMjA4NSwwLjQ2NDIzIDEuODUxNzgsMS41NTc4NSAxLjg1MjA0LDIuNzcxMDN2NDAuNjY5NWMtMC4wMDAyNiwxLjIxMzE5IC0wLjczMTE4LDIuMzA2OCAtMS44NTIwNCwyLjc3MTAzYy0xLjEyMDg1LDAuNDY0MjMgLTIuNDEwOTgsMC4yMDc2OSAtMy4yNjg5NiwtMC42NTAwM3oiLz48L2c+PC9nPjwvc3ZnPg=='
const rightArrow =
    'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNi4zMzU2MSIgaGVpZ2h0PSI0Ni42NjgzOSIgdmlld0JveD0iMCwwLDI2LjMzNTYxLDQ2LjY2ODM5Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzA2LjgzMjE5LC0xNTYuNjY1ODEpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGw9IiNmZmZmZmYiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMzExLjk1MzE5LDIwMi40NTU3NWMtMC44NTc5OCwwLjg1NzcyIC0yLjE0ODExLDEuMTE0MjYgLTMuMjY4OTYsMC42NTAwM2MtMS4xMjA4NiwtMC40NjQyMyAtMS44NTE3OCwtMS41NTc4NCAtMS44NTIwNCwtMi43NzEwM3YtNDAuNjY5NWMwLjAwMDI2LC0xLjIxMzE4IDAuNzMxMTksLTIuMzA2OCAxLjg1MjA0LC0yLjc3MTAzYzEuMTIwODUsLTAuNDY0MjQgMi40MTA5OCwtMC4yMDc2OSAzLjI2ODk2LDAuNjUwMDNsMjAuMzM1NSwyMC4zMzI1YzAuNTYyODcsMC41NjI2NCAwLjg3OTExLDEuMzI1ODkgMC44NzkxMSwyLjEyMTc1YzAsMC43OTU4NiAtMC4zMTYyNCwxLjU1OTExIC0wLjg3OTExLDIuMTIxNzVsLTIwLjMzNTUsMjAuMzM3eiIgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aW5kZXhmcXVvdDs6bnVsbH0iLz48L2c+PC9nPjwvc3ZnPg=='
const minusButton =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAw' +
    'MC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPS' +
    'JNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAw' +
    'IDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K'
const plusButton =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC' +
    '9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMT' +
    'ggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNz' +
    'FjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MW' +
    'MwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS' +
    '44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg=='
const defaultPlusSelectImage =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTQiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA1NCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSI1MyIgaGVpZ2h0PSIzMSIgcng9IjE1LjUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS1vcGFjaXR5PSIwLjIiLz4KPHBhdGggZD0iTTE3Ljk5OTggMTAuMTY0MVYyMS44MzA3TTEyLjE2NjUgMTUuOTk3NEgyMy44MzMyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNjY2NjciIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMzkuNzYzOCAxOC44Mzg2QzM5LjMyNTQgMTkuMjE4MiAzOC42NzQ2IDE5LjIxODIgMzguMjM2MiAxOC44Mzg2TDM1LjMwMzMgMTYuMjk4NkMzNC40ODY4IDE1LjU5MTQgMzQuOTg2OSAxNC4yNSAzNi4wNjcxIDE0LjI1TDQxLjkzMjkgMTQuMjVDNDMuMDEzMSAxNC4yNSA0My41MTMyIDE1LjU5MTQgNDIuNjk2NyAxNi4yOTg2TDM5Ljc2MzggMTguODM4NloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='

const enabledDynamicArgBlocksInfo = {}
const extInfo = {}
let proxingBlocklyBlocks = false

/**
 * 清除 VM 端多余的槽位和幽灵积木
 */
function cleanInputs(runtime, target, blockId, dynamicArgumentIds) {
    if (!target?.blocks?._blocks[blockId]) return
    const block = target.blocks._blocks[blockId]

    Object.keys(block.inputs).forEach(name => {
        if (
            /^DYNAMIC_ARGS\d+$/.test(name) &&
            !dynamicArgumentIds.includes(name)
        ) {
            if (block.inputs[name].shadow) {
                target.blocks.deleteBlock(block.inputs[name].shadow, {
                    source: 'default',
                    targetId: target.id
                })
            }
            delete block.inputs[name]
            if (runtime.emitTargetBlocksChanged) {
                runtime.emitTargetBlocksChanged(target.id, [
                    'deleteInput',
                    { id: block.id, inputName: name }
                ])
            }
        }
    })
}

function isMutableBlock(block) {
    return block && typeof block.dynamicArgumentTypes_ !== 'undefined'
}

function setLocales(ScratchBlocks) {
    Object.assign(ScratchBlocks.ScratchMsgs.locales.en, {
        ADD_TEXT_PARAMETER: 'Add Text Parameter',
        ADD_NUM_PARAMETER: 'Add Num Parameter',
        ADD_BOOL_PARAMETER: 'Add Bool Parameter',
        ADD_BRANCH_PARAMETER: 'Add Branch Parameter',
        ADD_COLOR_PARAMETER: 'Add Color Parameter',
        ADD_ANGLE_PARAMETER: 'Add Angle Parameter',
        DELETE_DYNAMIC_PARAMETER: 'Delete Parameter'
    })
    Object.assign(ScratchBlocks.ScratchMsgs.locales['zh-cn'], {
        ADD_TEXT_PARAMETER: '添加文本参数',
        ADD_NUM_PARAMETER: '添加数字参数',
        ADD_BOOL_PARAMETER: '添加布尔值参数',
        ADD_BRANCH_PARAMETER: '添加分支参数',
        ADD_COLOR_PARAMETER: '添加颜色参数',
        ADD_ANGLE_PARAMETER: '添加角度参数',
        DELETE_DYNAMIC_PARAMETER: '删除参数'
    })
}

function translate(ScratchBlocks, key) {
    return ScratchBlocks.ScratchMsgs.translate(key)
}

function createButtons(
    ScratchBlocks,
    plusImage = rightArrow,
    minusImage = leftArrow,
    plusSelectImage = defaultPlusSelectImage
) {
    let w = 25,
        h = 47,
        size = 0.35

    if (plusImage === '+') {
        plusImage = plusButton
        w = 18
        h = 18
        size = 0.7
    }

    if (plusSelectImage === '+ ▾') {
        plusSelectImage = defaultPlusSelectImage
        w = 54
        h = 18
        size = 0.7
    }

    if (minusImage === '-') {
        minusImage = minusButton
        w = 18
        h = 18
        size = 0.7
    }

    class FieldButton extends ScratchBlocks.FieldImage {
        constructor(
            src,
            isSelectButton = false,
            width = w * size,
            height = h * size,
            padding = 4
        ) {
            if (isSelectButton) {
                width = (width / 35) * 91
                height = (height / 35) * 91
            }
            super(src, width, height, undefined, false)
            this.padding = padding
            this.EDITABLE = true // 开启原生可编辑态
        }

        init() {
            if (this.fieldGroup_) return
            super.init()

            this.mouseDownWrapper_ = ScratchBlocks.bindEventWithChecks_(
                this.getSvgRoot(),
                'mousedown',
                this,
                e => {
                    this._lastEvent = e
                    if (this.onMouseDown_) this.onMouseDown_(e)
                }
            )

            const svgRoot = this.getSvgRoot()
            if (svgRoot) {
                svgRoot.style.cursor = 'pointer'
                for (const _img of svgRoot.getElementsByTagName('image')) {
                    _img.classList.add('RTW-blockbutton')
                }
            }
        }

        showEditor_() {
            if (
                !this.sourceBlock_?.workspace ||
                this.sourceBlock_.workspace.isDragging() ||
                this.sourceBlock_.isInFlyout
            )
                return
            this.onClick(this._lastEvent)
        }

        getSize() {
            if (!this.size_.width) this.render_()
            const sepSpace = ScratchBlocks.BlockSvg
                ? ScratchBlocks.BlockSvg.SEP_SPACE_X
                : 5
            return {
                width: Math.max(1, this.size_.width - sepSpace + this.padding),
                height: this.size_.height
            }
        }

        dispose() {
            if (this.mouseDownWrapper_) {
                ScratchBlocks.unbindEvent_(this.mouseDownWrapper_)
                this.mouseDownWrapper_ = null
            }
            super.dispose()
        }

        onClick(e) {}
    }

    class PlusSelectButton extends FieldButton {
        constructor() {
            super(plusSelectImage, true, undefined, undefined, 4)
        }

        onClick(e) {
            if (e && e.button !== 0) return
            const menuOptions = this.sourceBlock_.dynamicArgOptionalTypes_.map(
                i => ({
                    text: translate(
                        ScratchBlocks,
                        INPUT_TYPES_OPTIONS_LABEL[i]
                    ),
                    enabled: true,
                    callback: () => this.sourceBlock_.addDynamicArg(i)
                })
            )
            ScratchBlocks.ContextMenu.show(e, menuOptions, false)
        }
    }

    class PlusButton extends FieldButton {
        constructor() {
            super(plusImage, false, undefined, undefined, 4)
        }

        onClick(e) {
            if (e && e.button !== 0) return
            this.sourceBlock_.addDynamicArg(
                this.sourceBlock_.dynamicArgOptionalTypes_[0]
            )
        }
    }

    class MinusButton extends FieldButton {
        constructor() {
            super(minusImage, false, undefined, undefined, 4)
        }

        onClick(e) {
            if (e && e.button !== 0) return
            const { dynamicArgumentIds_ } = this.sourceBlock_
            if (dynamicArgumentIds_.length > 0) {
                this.sourceBlock_.removeDynamicArg(
                    dynamicArgumentIds_[dynamicArgumentIds_.length - 1]
                )
            }
        }
    }

    return { PlusSelectButton, PlusButton, MinusButton }
}

function proxyBlocklyBlocksObject(runtime, ScratchBlocks) {
    if (proxingBlocklyBlocks) return
    proxingBlocklyBlocks = true
    if (!ScratchBlocks) return

    setLocales(ScratchBlocks)

    ScratchBlocks.Blocks = new Proxy(ScratchBlocks.Blocks, {
        set(target, opcode, blockDefinition) {
            if (
                Object.prototype.hasOwnProperty.call(
                    enabledDynamicArgBlocksInfo,
                    opcode
                )
            ) {
                initExpandableBlock(
                    runtime,
                    blockDefinition,
                    enabledDynamicArgBlocksInfo[opcode],
                    ScratchBlocks
                )
            }
            return Reflect.set(target, opcode, blockDefinition)
        }
    })
}

/**
 * 初始化可扩展积木，支持多组并发参数
 */
function initExpandableBlock(
    runtime,
    blockDefinition,
    dynamicArgInfo,
    ScratchBlocks
) {
    // 将 dynamicArgInfo 统一为数组形式，以支持多组并发
    const dynamicArgGroups = Array.isArray(dynamicArgInfo)
        ? dynamicArgInfo
        : [{ groupId: 'ARGS', ...dynamicArgInfo }]

    // 确保每个组都有 groupId，如果没有则默认为 'ARGS'
    dynamicArgGroups.forEach(group => {
        if (!group.groupId) group.groupId = 'ARGS'
    })

    // 从第一组获取 extInfo（假设所有组共享相同的按钮配置）
    const { PlusSelectButton, PlusButton, MinusButton } =
        dynamicArgGroups[0].extInfo

    function getValue(value, i, defaultValue, valueWhenOutOfRange) {
        if (value === undefined) return defaultValue
        if (Array.isArray(value)) {
            if (i < value.length) return value[i]
            if (valueWhenOutOfRange !== undefined) return valueWhenOutOfRange
            return value[value.length - 1]
        }
        return typeof value === 'function' ? value(i) : value
    }

    function getParamsIncPerClick(i, group) {
        return getValue(
            group.paramsIncrement || this.dynamicArgInfo_.paramsIncrement,
            i,
            1,
            0
        )
    }

    function getParamsGroupindexes(num, group) {
        let sum = 0,
            i = 0,
            inc = 0
        while (sum < num) {
            inc = getParamsIncPerClick.call(this, i, group)
            if (inc === 0) break
            sum += inc
            i++
        }
        sum -= inc
        return Array.from({ length: inc }, (_, j) => sum + j + 1)
    }

    function getNextParamInc(group) {
        let sum = 0,
            i = 0
        const currentGroupArgs = this.dynamicArgumentTypes_.filter(
            (_, idx) => this.dynamicArgumentGroups_[idx] === group.groupId
        )
        while (sum < currentGroupArgs.length) {
            const inc = getParamsIncPerClick.call(this, i, group)
            if (inc === 0) break
            sum += inc
            i++
        }
        return getParamsIncPerClick.call(this, i, group)
    }

    const reorderInputs = function () {
        // 为每个组分别重新排序
        this.dynamicArgGroups_.forEach(group => {
            const { afterArg } = group
            let insertBeforeName = null

            if (afterArg) {
                const afterInputIdx = this.inputList.findIndex(
                    i => i.name === afterArg
                )
                if (afterInputIdx !== -1) {
                    for (
                        let i = afterInputIdx + 1;
                        i < this.inputList.length;
                        i++
                    ) {
                        const name = this.inputList[i].name
                        if (
                            !name.startsWith(`${group.groupId}_DYNAMIC_ARGS`) &&
                            ![
                                `${group.groupId}_ENDTEXT`,
                                `${group.groupId}_MINUS`,
                                `${group.groupId}_PLUS`
                            ].includes(name)
                        ) {
                            insertBeforeName = name
                            break
                        }
                    }
                }
            }

            const groupArgIds = this.dynamicArgumentIds_.filter(id =>
                id.startsWith(`${group.groupId}_DYNAMIC_ARGS`)
            )

            groupArgIds.forEach(id => {
                if (this.getInput(id))
                    this.moveInputBefore(id, insertBeforeName)
            })

            if (this.getInput(`${group.groupId}_ENDTEXT`))
                this.moveInputBefore(
                    `${group.groupId}_ENDTEXT`,
                    insertBeforeName
                )
            if (this.getInput(`${group.groupId}_MINUS`))
                this.moveInputBefore(`${group.groupId}_MINUS`, insertBeforeName)
            if (this.getInput(`${group.groupId}_PLUS`))
                this.moveInputBefore(`${group.groupId}_PLUS`, insertBeforeName)
        })
    }

    const updateButton = function () {
        this.dynamicArgGroups_.forEach(group => {
            const plusInputName = `${group.groupId}_PLUS`
            const minusInputName = `${group.groupId}_MINUS`
            const currentGroupArgs = this.dynamicArgumentTypes_.filter(
                (_, idx) => this.dynamicArgumentGroups_[idx] === group.groupId
            )

            // 更新加号按钮可见性（考虑 max 限制）
            const plusVisible =
                getNextParamInc.call(this, group) > 0 &&
                (!group.max || currentGroupArgs.length < group.max)
            if (this.getInput(plusInputName)) {
                this.getInput(plusInputName).setVisible(plusVisible)
            }

            // 更新减号按钮可见性（考虑 min 限制）
            const minusVisible = currentGroupArgs.length > (group.min || 0)
            if (minusVisible) {
                if (!this.getInput(minusInputName)) {
                    this.appendDummyInput(minusInputName).appendField(
                        new MinusButton()
                    )
                }
            } else {
                this.removeInput(minusInputName, true)
            }
        })
        reorderInputs.call(this)
    }

    const orgInit = blockDefinition.init

    blockDefinition.init = /** @this {any} */ function () {
        orgInit.call(this)

        // 初始化多组状态
        this.dynamicArgumentIds_ = []
        this.dynamicArgumentTypes_ = []
        this.dynamicArgumentGroups_ = [] // 存储每个参数所属的 groupId
        this.dynamicArgInfo_ = dynamicArgGroups[0] // 兼容旧代码
        this.dynamicArgGroups_ = dynamicArgGroups

        // 为每个组初始化可选类型
        this.dynamicArgOptionalTypes_ = dynamicArgGroups[0].dynamicArgTypes

        // 为每个组创建按钮
        this.dynamicArgGroups_.forEach(group => {
            this[`${group.groupId}_plusButton_`] =
                group.dynamicArgTypes.length > 1
                    ? new PlusSelectButton()
                    : new PlusButton()
        })

        if (!this.getInput) return

        // 为每个组创建初始文本和按钮
        this.dynamicArgGroups_.forEach(group => {
            const { endText } = group
            const endTxt = getValue(endText, 0, '')
            if (endTxt !== '') {
                this.appendDummyInput(`${group.groupId}_ENDTEXT`).appendField(
                    endTxt,
                    `${group.groupId}_ENDTEXT`
                )
            }

            this.appendDummyInput(`${group.groupId}_PLUS`).appendField(
                this[`${group.groupId}_plusButton_`]
            )
        })

        // 更新前文本（如果存在）
        this.dynamicArgGroups_.forEach(group => {
            updatePreText(this, 0, group)
        })

        reorderInputs.call(this)
    }

    blockDefinition.customContextMenu = /** @this {any} */ function (
        contextMenu
    ) {
        if (this.isInFlyout) return

        let separator_ = true

        // 为每个组添加上下文菜单项
        this.dynamicArgGroups_.forEach(group => {
            // 添加参数选项
            group.dynamicArgTypes.forEach(i => {
                const _text = document.createElement('div')
                _text.classList.add('keyboard-shortcuts-item')
                const ltext = document.createElement('span')
                ltext.textContent = translate(
                    ScratchBlocks,
                    INPUT_TYPES_OPTIONS_LABEL[i]
                )
                const rtext = document.createElement('span')
                rtext.classList.add('keyboard-shortcuts')
                rtext.textContent = `+ (${group.groupId})`
                _text.appendChild(ltext)
                _text.appendChild(rtext)

                contextMenu.splice(-1, 0, {
                    text: _text,
                    enabled: true,
                    separator: separator_,
                    callback: () => this.addDynamicArg(i, group.groupId)
                })
                separator_ = false
            })

            // 删除参数选项 - 恢复原有的一组联动删除逻辑
            const groupArgIds = this.dynamicArgumentIds_.filter(id =>
                id.startsWith(`${group.groupId}_DYNAMIC_ARGS`)
            )

            const len = groupArgIds.length
            let sum = 0,
                i = 0,
                inc = 0
            const args = []

            // 按照每次点击的增量(paramsIncrement)对参数进行分组
            while (sum < len) {
                inc = getParamsIncPerClick.call(this, i, group)
                if (inc === 0) break
                sum += inc
                if (sum <= len) args.push(groupArgIds[sum - 1])
                i++
            }

            args.forEach((id, idx) => {
                const element = document.createElement('div')
                element.classList.add('keyboard-shortcuts-item')
                const ltext = document.createElement('span')
                ltext.textContent = `${translate(
                    ScratchBlocks,
                    'DELETE_DYNAMIC_PARAMETER'
                )} ${group.groupId} ${idx + 1}`
                const rtext = document.createElement('span')
                rtext.classList.add('keyboard-shortcuts')
                rtext.textContent = '-'
                element.appendChild(ltext)
                element.appendChild(rtext)

                // 提取后缀数字，兼容多组并发的 ID 格式
                const match = id.match(/^(.*?)(\d+)$/)
                if (!match) return
                const name = match[1]
                const j = Number(match[2])

                // 计算属于这一拨的参数有哪些
                const ids = getParamsGroupindexes
                    .call(this, j, group)
                    .map(it => `${name}${it}`)
                const elems = []

                this.inputList
                    .filter(it => ids.includes(it.name))
                    .forEach(input => {
                        const pathElement = input.connection.targetConnection
                            ? input.connection.targetConnection.sourceBlock_
                                  .svgPath_
                            : input.outlinePath
                        // 鼠标悬浮高亮联动
                        element.addEventListener('mouseenter', () => {
                            const replacementGlowFilterId =
                                this.workspace.options
                                    .replacementGlowFilterId ||
                                'blocklyReplacementGlowFilter'
                            pathElement.setAttribute(
                                'filter',
                                `url(#${replacementGlowFilterId})`
                            )
                        })
                        element.addEventListener('mouseleave', () =>
                            pathElement.removeAttribute('filter')
                        )
                        elems.push(pathElement)
                    })

                if (separator_) {
                    setTimeout(() => {
                        // 安全拦截，防止 Scratch DOM 改变导致的异常
                        if (element.parentElement?.parentElement) {
                            element.parentElement.parentElement.style.borderStyle =
                                'dashed'
                        }
                    }, 0)
                }

                contextMenu.splice(-1, 0, {
                    text: element,
                    enabled: true,
                    separator: separator_,
                    callback: () => {
                        elems.forEach(it => it.removeAttribute('filter'))
                        this.removeDynamicArg(id)
                    }
                })
                separator_ = false
            })

            // 组与组之间重置分割线状态，保证下一组添加时有虚线
            separator_ = true
        })
    }

    blockDefinition.attachShadow_ = /** @this {any} */ function (
        input,
        argumentType,
        defaultValue = ''
    ) {
        const typeMap = {
            n: 'math_number',
            b: 'logic_boolean',
            s: 'text',
            l: 'text',
            c: 'control_if', // C型分支槽使用条件积木作为影子
            color: 'colour_picker',
            angle: 'math_angle'
        }
        const blockType = typeMap[argumentType] || 'text'

        ScratchBlocks.Events.disable()
        const newBlock = this.workspace.newBlock(blockType)

        try {
            if (argumentType === 'n')
                newBlock.setFieldValue(defaultValue, 'NUM')
            else if (argumentType === 's' || argumentType === 'l')
                newBlock.setFieldValue(defaultValue, 'TEXT')
            else if (argumentType === 'color')
                newBlock.setFieldValue(defaultValue, 'COLOUR')
            else if (argumentType === 'angle')
                newBlock.setFieldValue(defaultValue, 'ANGLE')
            newBlock.setShadow(true)
            if (!this.isInsertionMarker()) {
                newBlock.initSvg()
                newBlock.render(false)
            }
        } finally {
            ScratchBlocks.Events.enable()
        }

        if (ScratchBlocks.Events.isEnabled()) {
            ScratchBlocks.Events.fire(
                new ScratchBlocks.Events.BlockCreate(newBlock)
            )
        }

        // C型分支槽使用语句连接
        if (argumentType === 'c') {
            if (newBlock.previousConnection)
                newBlock.previousConnection.connect(input.connection)
        } else {
            if (newBlock.outputConnection)
                newBlock.outputConnection.connect(input.connection)
        }
    }

    blockDefinition.mutationToDom = /** @this {any} */ function () {
        const container = document.createElement('mutation')
        container.setAttribute(
            'dynamicargids',
            JSON.stringify(this.dynamicArgumentIds_)
        )
        container.setAttribute(
            'dynamicargtypes',
            JSON.stringify(this.dynamicArgumentTypes_)
        )
        container.setAttribute(
            'dynamicarggroups',
            JSON.stringify(this.dynamicArgumentGroups_)
        )
        return container
    }

    blockDefinition.domToMutation = /** @this {any} */ function (xmlElement) {
        this.dynamicArgumentIds_ =
            JSON.parse(xmlElement.getAttribute('dynamicargids')) || []
        this.dynamicArgumentTypes_ =
            JSON.parse(xmlElement.getAttribute('dynamicargtypes')) || []
        this.dynamicArgumentGroups_ =
            JSON.parse(xmlElement.getAttribute('dynamicarggroups')) || []
        this.updateDisplay_()
    }

    blockDefinition.addDynamicArg = /** @this {any} */ function (
        type,
        groupId
    ) {
        // 如果没有提供 groupId，则使用第一个组的 groupId
        if (!groupId) groupId = this.dynamicArgGroups_[0].groupId

        const group = this.dynamicArgGroups_.find(g => g.groupId === groupId)
        if (!group) return

        // 检查是否达到最大数量限制
        const currentGroupArgs = this.dynamicArgumentTypes_.filter(
            (_, idx) => this.dynamicArgumentGroups_[idx] === groupId
        )
        if (group.max && currentGroupArgs.length >= group.max) return

        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        ScratchBlocks.Events.setGroup(true)

        // 强健的 ID 防碰撞逻辑：找寻最大的后缀数字
        let maxIndex = 0
        this.dynamicArgumentIds_.forEach(id => {
            const match = id.match(/(\d+)$/)
            if (match) maxIndex = Math.max(maxIndex, parseInt(match[0], 10))
        })

        const cnt = getNextParamInc.call(this, group)

        for (let i = 0; i < cnt; i++) {
            const argId = `${groupId}_DYNAMIC_ARGS${maxIndex + i + 1}`
            this.dynamicArgumentIds_.push(argId)
            this.dynamicArgumentTypes_.push(type)
            this.dynamicArgumentGroups_.push(groupId)
        }

        this.updateDisplay_()

        const newMutationDom = this.mutationToDom()
        const newMutation =
            newMutationDom && ScratchBlocks.Xml.domToText(newMutationDom)

        if (oldMutation !== newMutation) {
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
        ScratchBlocks.Events.setGroup(false)
    }

    blockDefinition.removeDynamicArg = /** @this {any} */ function (id) {
        // 从 id 中提取 groupId
        const match = id.match(/^([^_]+)_/)
        if (!match) return
        const groupId = match[1]

        const group = this.dynamicArgGroups_.find(g => g.groupId === groupId)
        if (!group) return

        // 检查是否低于最小数量限制
        const currentGroupArgs = this.dynamicArgumentIds_.filter(argId =>
            argId.startsWith(`${groupId}_DYNAMIC_ARGS`)
        )
        if (group.min && currentGroupArgs.length <= group.min) return

        ScratchBlocks.Events.setGroup(true)
        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        const indexToRem = Number(id.match(/(\d+)$/)[0])
        const paramsToRemove = getParamsGroupindexes.call(
            this,
            indexToRem,
            group
        )

        paramsToRemove.forEach(it => {
            const curId = `${groupId}_DYNAMIC_ARGS${it}`
            const idx = this.dynamicArgumentIds_.indexOf(curId)
            if (idx !== -1) {
                this.dynamicArgumentIds_.splice(idx, 1)
                this.dynamicArgumentTypes_.splice(idx, 1)
                this.dynamicArgumentGroups_.splice(idx, 1)
                // 静默移除，规避 Scratch 积木弹开/跳动的碰撞检测
                this.removeInput(curId, true)
            }
        })

        this.updateDisplay_()

        const newMutationDom = this.mutationToDom()
        const newMutation =
            newMutationDom && ScratchBlocks.Xml.domToText(newMutationDom)

        if (oldMutation !== newMutation) {
            ScratchBlocks.Events.fire(
                new ScratchBlocks.Events.BlockChange(
                    this,
                    'mutation',
                    null,
                    oldMutation,
                    newMutation
                )
            )
            // 异步后台平滑清理，彻底杜绝跳动
            setTimeout(() => {
                const target = runtime.getEditingTarget()
                if (target)
                    cleanInputs(
                        runtime,
                        target,
                        this.id,
                        this.dynamicArgumentIds_
                    )
            }, 0)
        }
        ScratchBlocks.Events.setGroup(false)
    }

    blockDefinition.updateDisplay_ = /** @this {any} */ function () {
        const wasRendered = this.rendered
        this.rendered = false

        const connectionMap = this.disconnectDynamicArgBlocks_()
        this.removeAllDynamicArgInputs_()
        this.createAllDynamicArgInputs_(connectionMap)
        this.deleteShadows_(connectionMap)

        this.rendered = wasRendered
        if (wasRendered && !this.isInsertionMarker()) {
            this.initSvg()
            this.render()
        }
    }

    blockDefinition.disconnectDynamicArgBlocks_ =
        /** @this {any} */ function () {
            const connectionMap = {}

            for (let i = 0; i < this.inputList.length; i++) {
                const input = this.inputList[i]
                if (
                    input.connection &&
                    /^([A-Z]+)_DYNAMIC_ARGS\d+$/.test(input.name)
                ) {
                    const target = input.connection.targetBlock()
                    connectionMap[input.name] = {
                        shadow: input.connection.getShadowDom(),
                        block: target
                    }
                    input.connection.setShadowDom(null)
                    if (target) input.connection.disconnect()
                }
            }
            return connectionMap
        }

    blockDefinition.removeAllDynamicArgInputs_ =
        /** @this {any} */ function () {
            const list = /** @type {any} */ (this.inputList)
            if (!list) return
            const inputList = []

            for (let i = 0; i < list.length; i++) {
                const input = list[i]
                if (!input) continue
                if (/^([A-Z]+)_DYNAMIC_ARGS\d+$/.test(input.name))
                    input.dispose()
                else inputList.push(input)
            }
            this.inputList = inputList
        }

    function updatePreText(block, num, group) {
        const { preText, afterArg } = group
        if (!preText) return

        const txt = getValue(preText, num, '')
        let input

        if (afterArg) {
            input = block.inputList.find(i => i.name === afterArg)
        } else {
            // 零内存分配的高效安全查找
            for (let i = block.inputList.length - 1; i >= 0; i--) {
                const it = block.inputList[i]
                if (
                    ![
                        `${group.groupId}_PLUS`,
                        `${group.groupId}_MINUS`,
                        `${group.groupId}_ENDTEXT`
                    ].includes(it.name)
                ) {
                    input = it
                    break
                }
            }
        }

        if (input) {
            for (let i = input.fieldRow.length - 1; i >= 0; i--) {
                const field = input.fieldRow[i]
                if (field instanceof ScratchBlocks.FieldLabel) {
                    field.setText(txt)
                    break
                }
            }
        }
    }

    blockDefinition.createAllDynamicArgInputs_ = /** @this {any} */ function (
        connectionMap
    ) {
        const num = this.dynamicArgumentTypes_.length

        // 为每个组创建输入
        this.dynamicArgGroups_.forEach(group => {
            const { endText, joinCh, afterArg } = group

            // 更新前文本
            updatePreText(this, num, group)

            // 创建该组的动态参数输入
            for (let i = 0; i < num; i++) {
                if (this.dynamicArgumentGroups_[i] !== group.groupId) continue

                const argumentType = this.dynamicArgumentTypes_[i]
                const id = this.dynamicArgumentIds_[i]
                let input

                // 根据类型创建不同的输入
                if (argumentType === 'c') {
                    input = this.appendStatementInput(id)
                } else {
                    input = this.appendValueInput(id)
                    // 严谨兼容的类型限制
                    if (argumentType === 'b') input.setCheck('Boolean')
                    else if (argumentType === 'n') input.setCheck('Number')
                    else if (argumentType === 'color') input.setCheck('Colour')
                    else if (argumentType === 'angle') input.setCheck('Angle')
                    // 's' 和 'l' 文本输入在 Scratch 中允许任意类型的块塞入，因此不设 Check
                }

                if (joinCh && (i !== 0 || afterArg)) {
                    input.appendField(getValue(joinCh, i, ''))
                }

                this.populateArgument_(
                    argumentType,
                    connectionMap,
                    id,
                    input,
                    i,
                    group
                )
            }

            // 处理结束文本
            const txt = getValue(endText, num, '')
            if (txt === '') {
                this.removeInput(`${group.groupId}_ENDTEXT`, true)
            } else {
                const field = this.getField(`${group.groupId}_ENDTEXT`)
                if (field) field.setValue(txt)
                else
                    this.appendDummyInput(
                        `${group.groupId}_ENDTEXT`
                    ).appendField(txt, `${group.groupId}_ENDTEXT`)
            }
        })

        updateButton.call(this)
    }

    blockDefinition.populateArgument_ = /** @this {any} */ function (
        type,
        connectionMap,
        id,
        input,
        i,
        group
    ) {
        let oldBlock = null,
            oldShadow = null

        if (connectionMap && id in connectionMap) {
            const saveInfo = connectionMap[id]
            oldBlock = saveInfo.block
            oldShadow = saveInfo.shadow
        }

        const getDefaultValue = (id, idx) => {
            const { defaultValues } = group
            if (typeof defaultValues === 'function')
                return defaultValues(idx, id)
            if (Array.isArray(defaultValues)) {
                const len = defaultValues.length
                if (idx < len - 1) return defaultValues[idx]
                if (idx === len - 1) return defaultValues[len - 1]
                return `${defaultValues[len - 1]}${idx - len + 2}`
            }
            return defaultValues
        }

        if (connectionMap && oldBlock) {
            connectionMap[input.name] = null
            // C型分支槽使用 previousConnection
            if (type === 'c') {
                if (oldBlock.previousConnection)
                    oldBlock.previousConnection.connect(input.connection)
            } else {
                if (oldBlock.outputConnection)
                    oldBlock.outputConnection.connect(input.connection)
            }

            if (type !== 'b' && type !== 'c') {
                const shadowDom = oldShadow || this.buildShadowDom_(type, group)
                input.connection.setShadowDom(shadowDom)
            }
        } else {
            this.attachShadow_(input, type, getDefaultValue(id, i))
        }
    }

    blockDefinition.deleteShadows_ =
        ScratchBlocks.ScratchBlocks.ProcedureUtils.deleteShadows_

    blockDefinition.buildShadowDom_ = /** @this {any} */ function (
        type,
        group
    ) {
        const shadowDom = document.createElement('shadow')
        let blockType = 'text'
        let fieldName = 'TEXT'
        let defaultValue = ''

        if (type === 'n') {
            blockType = 'math_number'
            fieldName = 'NUM'
            defaultValue = group?.defaultNumberValue || '0'
        } else if (type === 'b') {
            blockType = 'logic_boolean'
            fieldName = 'BOOL'
            defaultValue = 'false'
        } else if (type === 'color') {
            blockType = 'colour_picker'
            fieldName = 'COLOUR'
            defaultValue = '#000000'
        } else if (type === 'angle') {
            blockType = 'math_angle'
            fieldName = 'ANGLE'
            defaultValue = '0'
        } else if (type === 'c') {
            blockType = 'control_if'
            fieldName = 'CONDITION'
            defaultValue = ''
        }

        shadowDom.setAttribute('type', blockType)
        const fieldDom = document.createElement('field', null)
        fieldDom.setAttribute('name', fieldName)
        fieldDom.textContent = defaultValue
        shadowDom.appendChild(fieldDom)
        return shadowDom
    }
}

const patchSymbol = Symbol('patch')

function initExpandableBlocks(
    extension,
    plusImage = rightArrow,
    minusImage = leftArrow,
    rightSelectButton = defaultPlusSelectImage
) {
    const { runtime, ScratchBlocks } = extension
    const { PlusSelectButton, PlusButton, MinusButton } = createButtons(
        ScratchBlocks,
        plusImage,
        minusImage,
        rightSelectButton
    )

    proxyBlocklyBlocksObject(runtime, ScratchBlocks)

    if (extension[patchSymbol]) return
    extension[patchSymbol] = true

    const origGetInfo = extension.getInfo

    extension.getInfo = function () {
        const info = origGetInfo.call(this)
        const { id, blocks: blocksInfo } = info

        extInfo[id] = { id, PlusSelectButton, PlusButton, MinusButton }

        blocksInfo.forEach(i => {
            if (i.dynamicArgsInfo) {
                // 确保是数组形式
                const dynamicArgsInfo = Array.isArray(i.dynamicArgsInfo)
                    ? i.dynamicArgsInfo
                    : [i.dynamicArgsInfo]

                // 为每个组添加默认 groupId 和 extInfo
                dynamicArgsInfo.forEach(group => {
                    if (!group.groupId) group.groupId = 'ARGS'
                    group.dynamicArgTypes = group.dynamicArgTypes || ['s']
                    group.extInfo = extInfo[id]
                })

                // 如果只有一个组，保持兼容性
                if (dynamicArgsInfo.length === 1) {
                    i.dynamicArgsInfo = dynamicArgsInfo[0]
                } else {
                    i.dynamicArgsInfo = dynamicArgsInfo
                }

                enabledDynamicArgBlocksInfo[`${id}_${i.opcode}`] =
                    i.dynamicArgsInfo
            }
        })

        return info
    }
}

/**
 * 提取并智能排序扩展积木传入的所有动态参数。
 * 当出现中间断层时（例如 [1, 3]），将在执行层自动补位为 [第1项, 第2项]，杜绝数据截断。
 * 支持按 groupId 过滤参数。
 * @param {Object} args - 积木参数对象
 * @param {string} [groupId] - 可选的组ID，用于多组并发时筛选特定组的参数
 * @returns {Array} 按顺序包含所有被动态添加的参数值
 */
function getDynamicArgs(args, groupId) {
    // 如果没有提供 groupId，则返回所有动态参数（向后兼容）
    if (!groupId) {
        return Object.keys(args)
            .filter(key => /^([A-Z]+)_DYNAMIC_ARGS\d+$/.test(key))
            .sort((a, b) => {
                const numA = parseInt(a.match(/(\d+)$/)[0], 10)
                const numB = parseInt(b.match(/(\d+)$/)[0], 10)
                return numA - numB
            })
            .map(key => args[key])
    }

    // 如果提供了 groupId，则只返回该组的参数
    const groupPrefix = `${groupId}_DYNAMIC_ARGS`
    return Object.keys(args)
        .filter(key => key.startsWith(groupPrefix))
        .sort((a, b) => {
            const numA = parseInt(a.match(/(\d+)$/)[0], 10)
            const numB = parseInt(b.match(/(\d+)$/)[0], 10)
            return numA - numB
        })
        .map(key => args[key])
}

export { getDynamicArgs, initExpandableBlocks, isMutableBlock, cleanInputs }
