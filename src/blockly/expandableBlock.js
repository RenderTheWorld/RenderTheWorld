/**
 * expandableBlock.js - 按钮驱动型动态可扩展积木
 * ====================================================================
 * 【使用教程】
 * 在扩展的 getInfo() 注册积木时，配置 `dynamicArgsInfo` 属性。
 *
 * 🟢 简单用法（单组，99%的情况直接这么写）：
 * dynamicArgsInfo: {
 *     groupId: 'ARGS',           // 选填：组ID，默认 'ARGS'，多组时必须指定
 *     name: '数据',              // 选填：组名称，用于右键删除菜单显示（默认为 groupId）
 *     types: ['s', 'n'],        // 选填：允许添加的参数类型。默认 ['s']
 *                                // 支持类型：n(数字), s(文本), b(布尔), c(C型分支), color(颜色), angle(角度)
 *     menuText: {                // 选填：自定义右键菜单/加号弹窗的显示文字
 *         s: '添加文本参数',
 *         n: '添加数字参数'
 *     },
 *     // menuText 支持多种格式：
 *     // 1. 对象：{ s: '添加文本', n: '添加数字' }
 *     // 2. 函数：(type) => `添加${type}参数`
 *     // 3. 字符串：'添加自定义参数'（适用于单类型）
 *     min: 1,                    // 选填：最少保留几个参数（默认1）
 *     max: 10,                   // 选填：最多添加几个参数（默认无限）
 *     defaultValues: ['A'],      // 选填：默认值数组。第N个参数取第N个值，超出的取最后一个值
 *     preText: '拼接',           // 选填：第一个动态参数前面的文字
 *     joinCh: '和',              // 选填：动态参数之间的文字连接符
 *     endText: '结束',           // 选填：最后一个动态参数后面的文字
 *     afterArg: 'SOME_INPUT'     // 选填：新参数插在哪个固定的参数接口之后
 * }
 *
 * 🔴 高级用法（多组并发）：
 * 如果一个积木需要两拨完全不同且独立的 +/- 按钮，直接传数组：
 * dynamicArgsInfo: [
 *     { groupId: 'ARGS', name: '变量', types: ['s'], menuText: '添加变量参数' },
 *     { groupId: 'BRANCH', name: '分支', types: ['c'], menuText: '添加分支参数', min: 0 }
 * ]
 *
 * 📝 关键配置说明：
 * 1. afterArg 与 joinCh 的关系：
 *    - 如果设置了 afterArg，joinCh 会出现在 afterArg 与第一个动态参数之间
 *    - joinCh 也会出现在后续动态参数之间
 *    - 示例：afterArg = 'BASE', joinCh = '+'
 *      结果：[BASE] [+] [参数1] [+] [参数2] ... [endText]
 *
 * 2. 多组并发时的布局：
 *    - 每组有自己的 +/- 按钮和独立的参数序列
 *    - 组与组之间通过 afterArg 链式挂载
 *    - 示例：组A的 afterArg = 'BASE', 组B的 afterArg = 'A_ENDTEXT'
 *      结果：[BASE] [组A参数...] [组A_ENDTEXT] [组B参数...] [组B_ENDTEXT]
 *
 * 3. 参数类型与Shadow积木：
 *    - n(数字): math_number, 字段名 NUM, 默认值 '0'
 *    - s(文本): text, 字段名 TEXT, 默认值 ''
 *    - b(布尔): 无Shadow, 空槽
 *    - c(C型分支): 无Shadow, 空槽
 *    - color(颜色): colour_picker, 字段名 COLOUR, 默认值 '#000000'
 *    - angle(角度): math_angle, 字段名 NUM(注意不是ANGLE), 默认值 '0'
 *
 * 4. 右键菜单结构：
 *    - 添加菜单：所有组的添加选项集中显示，用虚线分割线隔开
 *    - 删除菜单：所有组的删除选项集中显示，用虚线分割线隔开
 *    - 悬停高亮：鼠标悬停时高亮对应参数块
 *
 * 【技术要点】
 * - 子积木（Shadow）在主积木渲染后统一初始化SVG，防止游离坐标(0,0)
 * - 使用 setShadowDom() 建立数据连接，不提前生成SVG
 * - 角度积木字段名是 NUM 而非 ANGLE（已修复警告）
 * - 多组并发支持，每组独立管理参数和按钮
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

// 提取公用映射表，避免在方法中重复生成
const SHADOW_TYPE_DEFS = {
    n: { shadowType: 'math_number', shadowField: 'NUM', shadowDefault: '0' },
    s: { shadowType: 'text', shadowField: 'TEXT', shadowDefault: '' },
    l: { shadowType: 'text', shadowField: 'TEXT', shadowDefault: '' },
    b: { shadowType: null, shadowField: null, shadowDefault: null },
    color: {
        shadowType: 'colour_picker',
        shadowField: 'COLOUR',
        shadowDefault: '#000000'
    },
    angle: { shadowType: 'math_angle', shadowField: 'NUM', shadowDefault: '0' },
    c: { shadowType: null, shadowField: null, shadowDefault: null }
}

const leftArrow =
    'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNi4zMzU2MSIgaGVpZ2h0PSI0Ni42NjgzOSIgdmlld0JveD0iMCwwLDI2LjMzNTYxLDQ2LjY2ODM5Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzA2LjgzMjIsLTE1Ni42NjU4KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6IG5vcm1hbCI+PHBhdGggZD0iTTMyOC4wNDY4LDIwMi40NTcyNWwtMjAuMzM1NSwtMjAuMzM3Yy0wLjU2Mjg3LC0wLjU2MjY0IC0wLjg3OTExLC0xLjMyNTg5IC0wLjg3OTExLC0yLjEyMTc1YzAsLTAuNzk1ODYgMC4zMTYyNCwtMS41NTkxMSAwLjg3OTExLC0yLjEyMTc1bDIwLjMzNTUsLTIwLjMzMjVjMC44NTc5OCwtMC44NTc3MiAyLjE0ODExLC0xLjExNDI3IDMuMjY4OTYsLTAuNjUwMDNjMS4xMjA4NSwwLjQ2NDIzIDEuODUxNzgsMS41NTc4NSAxLjg1MjA0LDIuNzcxMDN2NDAuNjY5NWMtMC4wMDAyNiwxLjIxMzE5IC0wLjczMTE4LDIuMzA2OCAtMS44NTIwNCwyLjc3MTAzYy0xLjEyMDg1LDAuNDY0MjMgLTIuNDEwOTgsMC4yMDc2OSAtMy4yNjg5NiwtMC42NTAwM3oiLz48L2c+PC9nPjwvc3ZnPg=='
const rightArrow =
    'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNi4zMzU2MSIgaGVpZ2h0PSI0Ni42NjgzOSIgdmlld0JveD0iMCwwLDI2LjMzNTYxLDQ2LjY2ODM5Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzA2LjgzMjE5LC0xNTYuNjY1ODEpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGw9IiNmZmZmZmYiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMzExLjk1MzE5LDIwMi40NTU3NWMtMC44NTc5OCwwLjg1NzcyIC0yLjE0ODExLDEuMTE0MjYgLTMuMjY4OTYsMC42NTAwM2MtMS4xMjA4NiwtMC40NjQyMyAtMS44NTE3OCwtMS41NTc4NCAtMS44NTIwNCwtMi43NzEwM3YtNDAuNjY5NWMwLjAwMDI2LC0xLjIxMzE4IDAuNzMxMTksLTIuMzA2OCAxLjg1MjA0LC0yLjc3MTAzYzEuMTIwODUsLTAuNDY0MjQgMi40MTA5OCwtMC4yMDc2OSAzLjI2ODk2LDAuNjUwMDNsMjAuMzM1NSwyMC4zMzI1YzAuNTYyODcsMC41NjI2NCAwLjg3OTExLDEuMzI1ODkgMC44NzkxMSwyLjEyMTc1YzAsMC43OTU4NiAtMC4zMTYyNCwxLjU1OTExIC0wLjg3OTExLDIuMTIxNzVsLTIwLjMzNTUsMjAuMzM3eiIgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aW5kZXhmcXVvdDs6bnVsbH0iLz48L2c+PC9nPjwvc3ZnPg=='
const minusButton =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggMTFoLTEyYy0xLjEwNCAwLTIgLjg5Ni0yIDJzLjg5NiAyIDIgMmgxMmMxLjEwNCAwIDItLjg5NiAyLTJzLS44OTYtMi0yLTJ6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K'
const plusButton =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTggMTBoLTR2LTRjMC0xLjEwNC0uODk2LTItMi0ycy0yIC44OTYtMiAybC4wNzEgNGgtNC4wNzFjLTEuMTA0IDAtMiAuODk2LTIgMnMuODk2IDIgMiAybDQuMDcxLS4wNzEtLjA3MSA0LjA3MWMwIDEuMTA0Ljg5NiAyIDIgMnMyLS44OTYgMi0ydi00LjA3MWw0IC4wNzFjMS4xMDQgMCAyLS44OTYgMi0ycy0uODk2LTItMi0yeiIgZmlsbD0id2hpdGUiIC8+PC9zdmc+Cg=='
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
        // [修复] 支持任意 groupId 前缀的正则表达式匹配
        if (
            /^(.*?)_DYNAMIC_ARGS\d+$/.test(name) &&
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
    // [修复] 防止环境在早期加载时对象不存在导致报错
    ScratchBlocks.ScratchMsgs.locales.en =
        ScratchBlocks.ScratchMsgs.locales.en || {}
    Object.assign(ScratchBlocks.ScratchMsgs.locales.en, {
        ADD_TEXT_PARAMETER: 'Add Text Parameter',
        ADD_NUM_PARAMETER: 'Add Num Parameter',
        ADD_BOOL_PARAMETER: 'Add Bool Parameter',
        ADD_BRANCH_PARAMETER: 'Add Branch Parameter',
        ADD_COLOR_PARAMETER: 'Add Color Parameter',
        ADD_ANGLE_PARAMETER: 'Add Angle Parameter',
        DELETE_DYNAMIC_PARAMETER: 'Delete Parameter'
    })

    ScratchBlocks.ScratchMsgs.locales['zh-cn'] =
        ScratchBlocks.ScratchMsgs.locales['zh-cn'] || {}
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
        size = 0.45

    if (plusImage === '+') {
        plusImage = plusButton
        w = 18
        h = 18
        size = 0.9
    }

    if (plusSelectImage === '+ ▾') {
        plusSelectImage = defaultPlusSelectImage
        w = 54
        h = 18
        size = 0.9
    }

    if (minusImage === '-') {
        minusImage = minusButton
        w = 18
        h = 18
        size = 0.9
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
            this.EDITABLE = true
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
            const groupId =
                this.groupId_ ||
                (this.sourceBlock_.dynamicArgGroups_ &&
                    this.sourceBlock_.dynamicArgGroups_[0].groupId)
            const group = this.sourceBlock_.dynamicArgGroups_.find(
                g => g.groupId === groupId
            )
            if (!group) return

            const menuOptions = group.dynamicArgTypes.map(i => {
                let displayText = translate(
                    ScratchBlocks,
                    INPUT_TYPES_OPTIONS_LABEL[i]
                )
                if (group.menuText) {
                    if (typeof group.menuText === 'string') {
                        displayText = group.menuText
                    } else if (typeof group.menuText === 'function') {
                        displayText = group.menuText(i)
                    } else if (typeof group.menuText === 'object') {
                        displayText =
                            group.menuText[i] ||
                            group.menuText.default ||
                            displayText
                    }
                }

                return Object.freeze({
                    text: displayText,
                    enabled: true,
                    callback: () => this.sourceBlock_.addDynamicArg(i, groupId)
                })
            })

            const protectedMenuOptions = [...menuOptions]
            protectedMenuOptions.splice = () => []
            protectedMenuOptions.push = function () {
                return this.length
            }

            ScratchBlocks.ContextMenu.show(e, protectedMenuOptions, false)
        }
    }

    class PlusButton extends FieldButton {
        constructor() {
            super(plusImage, false, undefined, undefined, 4)
        }
        onClick(e) {
            if (e && e.button !== 0) return
            const groupId =
                this.groupId_ ||
                (this.sourceBlock_.dynamicArgGroups_ &&
                    this.sourceBlock_.dynamicArgGroups_[0].groupId)
            const group = this.sourceBlock_.dynamicArgGroups_.find(
                g => g.groupId === groupId
            )
            if (
                !group ||
                !group.dynamicArgTypes ||
                group.dynamicArgTypes.length === 0
            )
                return

            const type = group.dynamicArgTypes[0]
            this.sourceBlock_.addDynamicArg(type, groupId)
        }
    }

    class MinusButton extends FieldButton {
        constructor() {
            super(minusImage, false, undefined, undefined, 4)
            this.groupId_ = null
        }

        onClick(e) {
            if (e && e.button !== 0) return
            const groupId =
                this.groupId_ ||
                (this.sourceBlock_.dynamicArgGroups_ &&
                    this.sourceBlock_.dynamicArgGroups_[0].groupId)
            const group = this.sourceBlock_.dynamicArgGroups_.find(
                g => g.groupId === groupId
            )
            if (!group) return

            const groupArgIds = this.sourceBlock_.dynamicArgumentIds_.filter(
                id => id.startsWith(`${groupId}_DYNAMIC_ARGS`)
            )
            if (groupArgIds.length > 0) {
                const lastArgId = groupArgIds[groupArgIds.length - 1]
                this.sourceBlock_.removeDynamicArg(lastArgId)
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

function initExpandableBlock(
    runtime,
    blockDefinition,
    dynamicArgInfo,
    ScratchBlocks
) {
    const dynamicArgGroups = Array.isArray(dynamicArgInfo)
        ? dynamicArgInfo
        : [{ groupId: 'ARGS', ...dynamicArgInfo }]

    dynamicArgGroups.forEach(group => {
        if (!group.groupId) group.groupId = 'ARGS'
    })

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
        const orderedNames = []
        const placed = new Set()

        const pushGroup = groupId => {
            if (placed.has(groupId)) return
            placed.add(groupId)

            const localDeps = []

            const argIds = this.dynamicArgumentIds_
                .filter(id => id.startsWith(`${groupId}_DYNAMIC_ARGS`))
                .sort((a, b) => {
                    const numA = parseInt(a.match(/(\d+)$/)[0], 10)
                    const numB = parseInt(b.match(/(\d+)$/)[0], 10)
                    return numA - numB
                })

            argIds.forEach(id => {
                if (this.getInput(id)) {
                    orderedNames.push(id)
                    placed.add(id)
                    localDeps.push(id)
                }
            })

            const endName = `${groupId}_ENDTEXT`
            if (this.getInput(endName)) {
                orderedNames.push(endName)
                placed.add(endName)
                localDeps.push(endName)
            }

            const minusName = `${groupId}_MINUS`
            if (this.getInput(minusName)) {
                orderedNames.push(minusName)
                placed.add(minusName)
                localDeps.push(minusName)
            }

            const plusName = `${groupId}_PLUS`
            if (this.getInput(plusName)) {
                orderedNames.push(plusName)
                placed.add(plusName)
                localDeps.push(plusName)
            }

            localDeps.forEach(depName => {
                this.dynamicArgGroups_.forEach(g => {
                    if (g.afterArg === depName) {
                        pushGroup(g.groupId)
                    }
                })
            })
        }

        this.inputList.forEach(input => {
            const name = input.name
            let isGroupElement = false
            this.dynamicArgGroups_.forEach(group => {
                const prefix = `${group.groupId}_`
                if (
                    name.startsWith(`${prefix}DYNAMIC_ARGS`) ||
                    name === `${prefix}ENDTEXT` ||
                    name === `${prefix}MINUS` ||
                    name === `${prefix}PLUS`
                ) {
                    isGroupElement = true
                }
            })

            if (!isGroupElement) {
                if (!placed.has(name)) {
                    orderedNames.push(name)
                    placed.add(name)
                }
                this.dynamicArgGroups_.forEach(g => {
                    if (g.afterArg === name) {
                        pushGroup(g.groupId)
                    }
                })
            }
        })

        this.dynamicArgGroups_.forEach(group => {
            if (!placed.has(group.groupId)) {
                pushGroup(group.groupId)
            }
        })

        for (let i = orderedNames.length - 1; i >= 0; i--) {
            const name = orderedNames[i]
            if (this.getInput(name)) {
                let nextName = null
                if (i + 1 < orderedNames.length) {
                    let j = i + 1
                    while (
                        j < orderedNames.length &&
                        !this.getInput(orderedNames[j])
                    ) {
                        j++
                    }
                    nextName = j < orderedNames.length ? orderedNames[j] : null
                }
                if (!nextName || this.getInput(nextName)) {
                    this.moveInputBefore(name, nextName)
                }
            }
        }
    }

    const updateButton = function () {
        this.dynamicArgGroups_.forEach(group => {
            const plusInputName = `${group.groupId}_PLUS`
            const minusInputName = `${group.groupId}_MINUS`
            const currentGroupArgs = this.dynamicArgumentTypes_.filter(
                (_, idx) => this.dynamicArgumentGroups_[idx] === group.groupId
            )

            const plusVisible =
                getNextParamInc.call(this, group) > 0 &&
                (!group.max || currentGroupArgs.length < group.max)
            if (this.getInput(plusInputName)) {
                this.getInput(plusInputName).setVisible(plusVisible)
            }

            const minusVisible = currentGroupArgs.length > (group.min || 0)
            if (minusVisible) {
                if (!this.getInput(minusInputName)) {
                    const minusBtn = new MinusButton()
                    minusBtn.groupId_ = group.groupId
                    this.appendDummyInput(minusInputName).appendField(minusBtn)
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

        this.dynamicArgumentIds_ = []
        this.dynamicArgumentTypes_ = []
        this.dynamicArgumentGroups_ = []
        this.dynamicArgInfo_ = dynamicArgGroups[0]
        this.dynamicArgGroups_ = dynamicArgGroups

        // [优化] 合并多重遍历，提升可读性
        this.dynamicArgGroups_.forEach(group => {
            const btn =
                group.dynamicArgTypes.length > 1
                    ? new PlusSelectButton()
                    : new PlusButton()
            btn.groupId_ = group.groupId
            this[`${group.groupId}_plusButton_`] = btn
        })

        if (!this.getInput) return

        this.dynamicArgGroups_.forEach(group => {
            const endTxt = getValue(group.endText, 0, '')
            if (endTxt !== '') {
                this.appendDummyInput(`${group.groupId}_ENDTEXT`).appendField(
                    endTxt,
                    `${group.groupId}_ENDTEXT`
                )
            }

            this.appendDummyInput(`${group.groupId}_PLUS`).appendField(
                this[`${group.groupId}_plusButton_`]
            )

            updatePreText(this, 0, group)
        })

        reorderInputs.call(this)
    }

    blockDefinition.customContextMenu = /** @this {any} */ function (
        contextMenu
    ) {
        if (this.isInFlyout) return
        let separator_ = true

        this.dynamicArgGroups_.forEach(group => {
            group.dynamicArgTypes.forEach(i => {
                const _text = document.createElement('div')
                _text.classList.add('keyboard-shortcuts-item')

                const ltext = document.createElement('span')
                let displayText = translate(
                    ScratchBlocks,
                    INPUT_TYPES_OPTIONS_LABEL[i]
                )
                if (group.menuText) {
                    if (typeof group.menuText === 'string') {
                        displayText = group.menuText
                    } else if (typeof group.menuText === 'function') {
                        displayText = group.menuText(i)
                    } else if (typeof group.menuText === 'object') {
                        displayText =
                            group.menuText[i] ||
                            group.menuText.default ||
                            displayText
                    }
                }
                ltext.textContent = displayText

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
        })

        separator_ = true

        this.dynamicArgGroups_.forEach(group => {
            const groupArgIds = this.dynamicArgumentIds_.filter(id =>
                id.startsWith(`${group.groupId}_DYNAMIC_ARGS`)
            )
            const len = groupArgIds.length
            let sum = 0,
                i = 0,
                inc = 0
            const args = []
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
                const groupName = group.name || group.groupId
                ltext.textContent = `${translate(ScratchBlocks, 'DELETE_DYNAMIC_PARAMETER')} ${groupName} ${idx + 1}`

                const rtext = document.createElement('span')
                rtext.classList.add('keyboard-shortcuts')
                rtext.textContent = '-'

                element.appendChild(ltext)
                element.appendChild(rtext)

                const match = id.match(/^(.*?)(\d+)$/)
                if (!match) return
                const name = match[1]
                const j = Number(match[2])
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

                        if (!pathElement) return

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
        })
    }

    blockDefinition.attachShadow_ = /** @this {any} */ function (
        input,
        argumentType,
        defaultValue = ''
    ) {
        const def = SHADOW_TYPE_DEFS[argumentType] || SHADOW_TYPE_DEFS.s
        if (!def.shadowType) return

        const shadowDom = document.createElement('shadow')
        shadowDom.setAttribute('type', def.shadowType)

        if (def.shadowField) {
            let valueToSet = defaultValue
            if (argumentType === 'color') {
                if (!valueToSet || !/^#[0-9A-F]{6}$/i.test(valueToSet)) {
                    valueToSet = def.shadowDefault
                }
            } else if (argumentType === 'n' || argumentType === 'angle') {
                if (
                    valueToSet === '' ||
                    valueToSet === null ||
                    isNaN(Number(valueToSet))
                ) {
                    valueToSet = def.shadowDefault
                }
            }

            const fieldDom = document.createElement('field')
            fieldDom.setAttribute('name', def.shadowField)
            fieldDom.textContent = String(valueToSet)
            shadowDom.appendChild(fieldDom)
        }

        ScratchBlocks.Events.disable()
        let newBlock
        try {
            newBlock = ScratchBlocks.Xml.domToBlockHeadless_(
                shadowDom,
                this.workspace
            )
            newBlock.setShadow(true)

            if (newBlock.outputConnection) {
                newBlock.outputConnection.connect(input.connection)
            } else if (newBlock.previousConnection) {
                newBlock.previousConnection.connect(input.connection)
            }

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
        if (!groupId) groupId = this.dynamicArgGroups_[0].groupId

        const group = this.dynamicArgGroups_.find(g => g.groupId === groupId)
        if (!group) return

        const currentGroupArgs = this.dynamicArgumentTypes_.filter(
            (_, idx) => this.dynamicArgumentGroups_[idx] === groupId
        )
        if (group.max && currentGroupArgs.length >= group.max) return

        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        ScratchBlocks.Events.setGroup(true)

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
        // [修复] 支持复杂的含下划线 groupId 截取
        const match = id.match(/^(.*?)_DYNAMIC_ARGS/)
        if (!match) return
        const groupId = match[1]
        const group = this.dynamicArgGroups_.find(g => g.groupId === groupId)
        if (!group) return

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

            setTimeout(() => {
                const target = runtime.getEditingTarget()
                if (target) {
                    cleanInputs(
                        runtime,
                        target,
                        this.id,
                        this.dynamicArgumentIds_
                    )
                }
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
                    /^(.*?)_DYNAMIC_ARGS\d+$/.test(input.name) // [修复] 支持任意 groupId 匹配正则
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

    // [致命Bug修复] 防止直接 dispose 引起的原生 inputList 塌陷及幽灵元素无法清除
    blockDefinition.removeAllDynamicArgInputs_ =
        /** @this {any} */ function () {
            if (!this.inputList) return
            // 正确做法：必须倒序遍历删除，并调用 Blockly 标准的 removeInput
            for (let i = this.inputList.length - 1; i >= 0; i--) {
                const input = this.inputList[i]
                if (input && /^(.*?)_DYNAMIC_ARGS\d+$/.test(input.name)) {
                    this.removeInput(input.name, true)
                }
            }
        }

    function updatePreText(block, num, group) {
        const { preText, afterArg } = group
        if (!preText) return

        const txt = getValue(preText, num, '')
        let input

        if (afterArg) {
            input = block.inputList.find(i => i.name === afterArg)
        } else {
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
        this.dynamicArgGroups_.forEach(group => {
            const { endText, joinCh, afterArg } = group
            updatePreText(this, num, group)
            let groupArgIndex = 0

            let needJoinBeforeFirstArg = false
            if (afterArg && joinCh && groupArgIndex === 0) {
                const afterInput = this.getInput(afterArg)
                if (afterInput) {
                    needJoinBeforeFirstArg = true
                }
            }

            for (let i = 0; i < num; i++) {
                if (this.dynamicArgumentGroups_[i] !== group.groupId) continue
                const argumentType = this.dynamicArgumentTypes_[i]
                const id = this.dynamicArgumentIds_[i]
                let input

                if (argumentType === 'c') {
                    input = this.appendStatementInput(id)
                } else {
                    input = this.appendValueInput(id)
                    // 不设置 setCheck，允许任意积木连接（包括 RTW 扩展积木）
                    // if (argumentType === 'b') input.setCheck('Boolean')
                    // else if (argumentType === 'n') input.setCheck('Number')
                    // else if (argumentType === 'color') input.setCheck('Colour')
                    // else if (argumentType === 'angle')
                    //     input.setCheck(['Number', 'Angle'])
                    // else input.setCheck('String')
                }

                if (joinCh && groupArgIndex > 0 && argumentType !== 'c') {
                    input.appendField(getValue(joinCh, i, ''))
                } else if (
                    needJoinBeforeFirstArg &&
                    groupArgIndex === 0 &&
                    argumentType !== 'c'
                ) {
                    input.appendField(getValue(joinCh, i, ''))
                    needJoinBeforeFirstArg = false
                }

                this.populateArgument_(
                    argumentType,
                    connectionMap,
                    id,
                    input,
                    i,
                    group
                )
                groupArgIndex++
            }

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

        const def = SHADOW_TYPE_DEFS[type] || SHADOW_TYPE_DEFS.s

        const getDefaultValue = (id, idx, argType) => {
            // 【保留新特性】带有 argType
            const { defaultValues } = group
            if (typeof defaultValues === 'function')
                return defaultValues(idx, id, argType)
            if (Array.isArray(defaultValues)) {
                const len = defaultValues.length
                if (idx < len) return defaultValues[idx]
                const lastVal = defaultValues[len - 1]
                if (typeof lastVal === 'boolean') return lastVal
                const strVal = String(lastVal)
                const match = strVal.match(/^(.*?)(\d+)$/)
                if (match) {
                    const prefix = match[1]
                    const num = parseInt(match[2], 10)
                    return `${prefix}${num + (idx - len + 1)}`
                }
                return `${strVal}${idx - len + 2}`
            }
            return defaultValues
        }

        if (connectionMap && oldBlock) {
            connectionMap[input.name] = null
            if (type === 'c') {
                if (oldBlock.previousConnection)
                    oldBlock.previousConnection.connect(input.connection)
            } else {
                if (oldBlock.outputConnection)
                    oldBlock.outputConnection.connect(input.connection)
            }
            if (def.shadowType) {
                const shadowDom =
                    oldShadow || this.buildShadowDom_(type, group, i, id)
                if (shadowDom) input.connection.setShadowDom(shadowDom)
            }
        } else {
            if (def.shadowType) {
                this.attachShadow_(input, type, getDefaultValue(id, i, type))
            }
        }
    }

    // [防御性修复] 防止由于扩展积木环境差异而导致 ProcedureUtils 内部属性找不到报错
    blockDefinition.deleteShadows_ =
        ScratchBlocks?.ScratchBlocks?.ProcedureUtils?.deleteShadows_ ||
        function () {}

    blockDefinition.buildShadowDom_ = /** @this {any} */ function (
        type,
        group,
        idx,
        id
    ) {
        const def = SHADOW_TYPE_DEFS[type] || SHADOW_TYPE_DEFS.s
        if (!def.shadowType) return null

        const shadowDom = document.createElement('shadow')
        shadowDom.setAttribute('type', def.shadowType)

        if (def.shadowField) {
            const fieldDom = document.createElement('field')
            fieldDom.setAttribute('name', def.shadowField)

            const getDefaultValue = (id, i, argType) => {
                // 【保留新特性】带有 argType
                const { defaultValues } = group
                if (typeof defaultValues === 'function')
                    return defaultValues(i, id, argType)
                if (Array.isArray(defaultValues)) {
                    const len = defaultValues.length
                    if (i < len) return defaultValues[i]
                    const lastVal = defaultValues[len - 1]
                    if (typeof lastVal === 'boolean') return lastVal
                    const strVal = String(lastVal)
                    const match = strVal.match(/^(.*?)(\d+)$/)
                    if (match) {
                        const prefix = match[1]
                        const num = parseInt(match[2], 10)
                        return `${prefix}${num + (i - len + 1)}`
                    }
                    return `${strVal}${i - len + 2}`
                }
                return defaultValues
            }

            let defaultValue = getDefaultValue(id, idx, type)
            if (defaultValue === undefined || defaultValue === null) {
                defaultValue = def.shadowDefault
            }

            if (type === 'color') {
                if (!defaultValue || !/^#[0-9A-F]{6}$/i.test(defaultValue)) {
                    defaultValue = def.shadowDefault
                }
            } else if (type === 'n' || type === 'angle') {
                if (
                    defaultValue === '' ||
                    defaultValue === null ||
                    isNaN(Number(defaultValue))
                ) {
                    defaultValue = def.shadowDefault
                }
            }

            fieldDom.textContent = String(defaultValue)
            shadowDom.appendChild(fieldDom)
        }

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
                const dynamicArgsInfo = Array.isArray(i.dynamicArgsInfo)
                    ? i.dynamicArgsInfo
                    : [i.dynamicArgsInfo]

                dynamicArgsInfo.forEach(group => {
                    if (!group.groupId) group.groupId = 'ARGS'
                    group.dynamicArgTypes = group.dynamicArgTypes ||
                        group.types || ['s']
                    group.extInfo = extInfo[id]
                })

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
 */
function getDynamicArgs(args, groupId) {
    if (!groupId) {
        return Object.keys(args)
            .filter(key => /^(.*?)_DYNAMIC_ARGS\d+$/.test(key)) // [修复] 支持带有特殊名称组参数捕获
            .sort((a, b) => {
                const numA = parseInt(a.match(/(\d+)$/)[0], 10)
                const numB = parseInt(b.match(/(\d+)$/)[0], 10)
                return numA - numB
            })
            .map(key => args[key])
    }

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
