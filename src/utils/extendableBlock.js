// 基于Nights/FurryR/zxq的可扩展积木
// xiaochen004hao对其进行了一些更改优化
// 兼容并收 test3.js (Arkos) 的 beforeArg / specifiedArgTypes / @PRE_ARG@ / argument_reporter_string_number 等特性
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */
/**
 * Label options for different input types.
 * @type {{s: string, n: string, b: string, argument_reporter_string_number: string}}
 */
const INPUT_TYPES_OPTIONS_LABEL = {
    s: 'ADD_TEXT_PARAMETER',
    n: 'ADD_NUM_PARAMETER',
    b: 'ADD_BOOL_PARAMETER',
    r: 'ADD_REGEN_PARAMETER',
    argument_reporter_string_number: 'ADD_PARAMETER'
}

const leftArrow =
    'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNi4zMzU2MSIgaGVpZ2h0PSI0Ni42NjgzOSIgdmlld0JveD0iMCwwLDI2LjMzNTYxLDQ2LjY2ODM5Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzA2LjgzMjIsLTE1Ni42NjU4KSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsPSIjZmZmZmZmIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2UtbGluZWNhcD0iYnV0dCIgc3Ryb2tlLWxpbmVqb2luPSJtaXRlciIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtZGFzaGFycmF5PSIiIHN0cm9rZS1kYXNob2Zmc2V0PSIwIiBzdHlsZT0ibWl4LWJsZW5kLW1vZGU6IG5vcm1hbCI+PHBhdGggZD0iTTMyOC4wNDY4LDIwMi40NTcyNWwtMjAuMzM1NSwtMjAuMzM3Yy0wLjU2Mjg3LC0wLjU2MjY0IC0wLjg3OTExLC0xLjMyNTg5IC0wLjg3OTExLC0yLjEyMTc1YzAsLTAuNzk1ODYgMC4zMTYyNCwtMS41NTkxMSAwLjg3OTExLC0yLjEyMTc1bDIwLjMzNTUsLTIwLjMzMjVjMC44NTc5OCwtMC44NTc3MiAyLjE0ODExLC0xLjExNDI3IDMuMjY4OTYsLTAuNjUwMDNjMS4xMjA4NSwwLjQ2NDIzIDEuODUxNzgsMS41NTc4NSAxLjg1MjA0LDIuNzcxMDN2NDAuNjY5NWMtMC4wMDAyNiwxLjIxMzE5IC0wLjczMTE4LDIuMzA2OCAtMS44NTIwNCwyLjc3MTAzYy0xLjEyMDg1LDAuNDY0MjMgLTIuNDEwOTgsMC4yMDc2OSAtMy4yNjg5NiwtMC42NTAwM3oiLz48L2c+PC9nPjwvc3ZnPg=='

const rightArrow =
    'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNi4zMzU2MSIgaGVpZ2h0PSI0Ni42NjgzOSIgdmlld0JveD0iMCwwLDI2LjMzNTYxLDQ2LjY2ODM5Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMzA2LjgzMjE5LC0xNTYuNjY1ODEpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGw9IiNmZmZmZmYiIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMzExLjk1MzE5LDIwMi40NTU3NWMtMC44NTc5OCwwLjg1NzcyIC0yLjE0ODExLDEuMTE0MjYgLTMuMjY4OTYsMC42NTAwM2MtMS4xMjA4NiwtMC40NjQyMyAtMS44NTE3OCwtMS41NTc4NCAtMS44NTIwNCwtMi43NzEwM3YtNDAuNjY5NWMwLjAwMDI2LC0xLjIxMzE4IDAuNzMxMTksLTIuMzA2OCAxLjg1MjA0LC0yLjc3MTAzYzEuMTIwODUsLTAuNDY0MjQgMi40MTA5OCwtMC4yMDc2OSAzLjI2ODk2LDAuNjUwMDNsMjAuMzM1NSwyMC4zMzI1YzAuNTYyODcsMC41NjI2NCAwLjg3OTExLDEuMzI1ODkgMC44NzkxMSwyLjEyMTc1YzAsMC43OTU4NiAtMC4zMTYyNCwxLjU1OTExIC0wLjg3OTExLDIuMTIxNzVsLTIwLjMzNTUsMjAuMzM3eiIgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aW5kZXgmcXVvdDs6bnVsbH0iLz48L2c+PC9nPjwvc3ZnPg=='

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

/**
 * 共享全局状态（与 test3.js / Arkos 方案一致）
 * 使用 window.__ArkosExtendableInfo 避免多实例时数据被覆盖
 * @type {Object}
 */
if (!window.__ArkosExtendableInfo) {
    window.__ArkosExtendableInfo = {
        enabledDynamicArgBlocksInfo: {},
        extInfo: {}
    }
}
const { enabledDynamicArgBlocksInfo, extInfo } = window.__ArkosExtendableInfo

let proxingBlocklyBlocks = false

/**
 * Sets localization messages for Blockly.
 * @param {ScratchBlocks} ScratchBlocks - The Blockly object.
 */
function setLocales(ScratchBlocks) {
    Object.assign(ScratchBlocks.ScratchMsgs.locales.en, {
        ADD_TEXT_PARAMETER: 'Add Text Parameter',
        ADD_NUM_PARAMETER: 'Add Num Parameter',
        ADD_BOOL_PARAMETER: 'Add Booln Parameter',
        ADD_REGEN_PARAMETER: 'Add Regen Parameter',
        ADD_PARAMETER: 'Add Parameter',
        DELETE_DYNAMIC_PARAMETER: 'Delete Dynamic Parameter'
    })

    Object.assign(ScratchBlocks.ScratchMsgs.locales['zh-cn'], {
        ADD_TEXT_PARAMETER: '添加文本参数',
        ADD_NUM_PARAMETER: '添加数字参数',
        ADD_BOOL_PARAMETER: '添加布尔值参数',
        ADD_REGEN_PARAMETER: '添加再生参数',
        ADD_PARAMETER: '添加参数',
        DELETE_DYNAMIC_PARAMETER: '删除动态参数'
    })
}

/**
 * Translates a key using Blockly's translation messages.
 * @param {ScratchBlocks} ScratchBlocks - The Blockly object.
 * @param {string} key - The key to translate.
 * @returns {string} The translated string.
 */
function translate(ScratchBlocks, key) {
    return ScratchBlocks.ScratchMsgs.translate(key)
}

/**
 * Creates custom buttons for Blockly blocks.
 * @param {ScratchBlocks} ScratchBlocks - The Blockly object.
 * @returns {Object} An object containing custom button classes.
 */
function createButtons(
    ScratchBlocks,
    plusImage = rightArrow,
    minusImage = leftArrow,
    plusSelectImage = defaultPlusSelectImage
) {
    let w = 25
    let h = 47
    let size = 0.35
    if (plusImage === '+') {
        plusImage = plusButton
        w = 18
        h = 18
        size = 0.7
    }
    if (plusSelectImage === '+ ▾') {
        plusSelectImage = defaultPlusSelectImage
        w = 18 * 3
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
            height = h * size
        ) {
            // 这里的比例根据你的图片宽度定义（写这个注释防止我自己忘了）
            if (isSelectButton)
                ((width = (width / 35) * 91), (height = (height / 35) * 91))
            super(src, width, height, undefined, false)
            this.initialized = false
        }

        init() {
            super.init()

            if (!this.initialized) {
                // this.getSvgRoot().style.cursor = 'pointer';
                for (let _img of this.getSvgRoot().getElementsByTagName(
                    'image'
                ))
                    _img.classList.add('RTW-blockbutton')
                ScratchBlocks.bindEventWithChecks_(
                    this.getSvgRoot(),
                    'mousedown',
                    this,
                    e => {
                        // Prevent event bubbling, otherwise clicking the button will execute the block (clicking the button).
                        e.stopPropagation()
                    }
                )
                ScratchBlocks.bindEventWithChecks_(
                    this.getSvgRoot(),
                    'mouseup',
                    this,
                    this.handleClick.bind(this)
                )
            }
            this.initialized = true
        }

        handleClick(e) {
            if (!this.sourceBlock_ || !this.sourceBlock_.workspace) return
            if (this.sourceBlock_.workspace.isDragging()) return
            if (this.sourceBlock_.isInFlyout) return
            this.onClick(e)
        }

        onClick() {
            // Implemented by subclass
        }
    }
    // (+ ▽) Optional button for adding new types
    class PlusSelectButton extends FieldButton {
        constructor() {
            super(plusSelectImage, true)
        }

        onClick(e) {
            if (e.button != 0) return
            const menuOptions = this.sourceBlock_.dynamicArgOptionalTypes_.map(
                i => ({
                    text: translate(
                        ScratchBlocks,
                        INPUT_TYPES_OPTIONS_LABEL[i]
                    ),
                    enabled: true,
                    callback: () => {
                        this.sourceBlock_.addDynamicArg(i)
                    }
                })
            )
            ScratchBlocks.ContextMenu.show(e, menuOptions, false)
        }
    }
    // + button
    class PlusButton extends FieldButton {
        constructor() {
            super(plusImage)
        }

        onClick(e) {
            if (e.button != 0) return
            this.sourceBlock_.addDynamicArg(
                this.sourceBlock_.dynamicArgOptionalTypes_[0]
            )
        }
    }
    // - button
    class MinusButton extends FieldButton {
        constructor() {
            super(minusImage)
        }

        onClick(e) {
            if (e.button != 0) return
            const { dynamicArgumentIds_ } = this.sourceBlock_
            this.sourceBlock_.removeDynamicArg(
                dynamicArgumentIds_[dynamicArgumentIds_.length - 1]
            )
        }
    }
    return {
        PlusSelectButton,
        PlusButton,
        MinusButton
    }
}

/**
 * Proxies the Blockly Blocks object to enable dynamic argument blocks.
 * @param {Runtime} runtime - The runtime object.
 */
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
 * Initializes an expandable block with dynamic arguments.
 * @param {Runtime} runtime - The runtime object.
 * @param {Object} blockDefinition - The block definition.
 * @param {string[]} dynamicArgInfo - The dynamic argument types.
 */
function initExpandableBlock(
    runtime,
    blockDefinition,
    dynamicArgInfo,
    ScratchBlocks
) {
    const { PlusSelectButton, PlusButton, MinusButton } = dynamicArgInfo.extInfo
    /**
     * Get value of function/array or the value itself.
     * @param {*} value - value/function/array
     * @param {*} i - The index to pass to the function/array
     * @param {*} defaultValue - (optional) The default value. (if value is undefined)
     * @param {*} valueWhenOutOfRange - (optional) The value when the index is out of range.
     * @returns {*} The result.
     */
    function getValue(value, i, defaultValue, valueWhenOutOfRange) {
        if (value === undefined) return defaultValue
        if (Array.isArray(value)) {
            if (i < value.length) return value[i]
            if (valueWhenOutOfRange !== undefined) return valueWhenOutOfRange
            return value[value.length - 1]
        }
        return typeof value === 'function' ? value(i) : value
    }

    /**
     * 第 i 次（从0开始）点击 + 按钮增加的参数数量，默认 1。越界时返回 0
     * @param {number} i
     * @returns
     */
    function getParamsIncPerClick(i) {
        return getValue(this.dynamicArgInfo_.paramsIncrement, i, 1, 0)
    }

    /**
     * 根据参数数量，计算点了几次 + 按钮的次数
     * @param {number} num 参数数量
     */
    function getAddClickCount(num) {
        let sum = 0
        let i = 0
        while (sum < num) {
            const inc = getParamsIncPerClick.call(this, i)
            if (inc === 0) throw new Error(`Unreachable param num`) // 无法到达的参数数量
            sum += inc
            i++
        }
        return i
    }

    /**
     * 计算某个编号的参数所属组的索引数组
     * @param {number} num 参数编号
     * @returns {Array<number>}
     */
    function getParamsGroupindexes(num) {
        let sum = 0
        let i = 0
        let inc = 0
        while (sum < num) {
            inc = getParamsIncPerClick.call(this, i)
            if (inc === 0) throw new Error(`Unreachable param num`) // 无法到达的参数数量
            sum += inc
            i++
        }
        sum -= inc
        return Array.from({ length: inc }, (_, j) => sum + j + 1)
    }

    /**
     * 计算下一次点击 + 按钮增加的参数数量
     * @returns
     */
    function getNextParamInc() {
        return getParamsIncPerClick.call(
            this,
            getAddClickCount.call(this, this.dynamicArgumentTypes_.length)
        )
    }

    const moveButtonToTheRightPlace = function () {
        const showPlus = getNextParamInc.call(this) > 0 // 是否显示 +
        if (showPlus) {
            this.getInput('PLUS').setVisible(true)
            // 调整 + 按钮位置
            const { afterArg, beforeArg } = this.dynamicArgInfo_
            if (afterArg) {
                this.moveInputBefore('PLUS', afterArg)
                this.moveInputBefore(afterArg, 'PLUS')
            } else if (beforeArg) {
                this.moveInputBefore('PLUS', beforeArg)
            } else {
                this.moveInputBefore('PLUS', null)
            }
        } else {
            // 删除 + 按钮
            this.getInput('PLUS').setVisible(false)
        }
        if (this.getInput('ENDTEXT'))
            this.moveInputBefore('ENDTEXT', 'PLUS')
        const cnt = this.dynamicArgumentTypes_.length
        if (cnt === 0) {
            // 删除 - 按钮
            this.removeInput('MINUS')
        } else {
            if (!this.getInput('MINUS'))
                this.appendDummyInput('MINUS').appendField(
                    new MinusButton()
                )
            // 调整 - 按钮位置
            this.moveInputBefore('MINUS', 'PLUS')
        }
    }

    const orgInit = blockDefinition.init
    blockDefinition.init = function () {
        orgInit.call(this)

        this.dynamicArgumentIds_ = []
        this.dynamicArgumentTypes_ = []
        this.dynamicArgInfo_ = dynamicArgInfo
        this.dynamicArgOptionalTypes_ = dynamicArgInfo.dynamicArgTypes
        // 详细指定每个参数的类型（数组），与 test3.js 一致
        this.specifiedArgTypes = dynamicArgInfo.argType
        this.plusButton_ =
            dynamicArgInfo.dynamicArgTypes.length > 1
                ? new PlusSelectButton()
                : new PlusButton()
        this.minusButton_ = new MinusButton()

        const { afterArg, endText, beforeArg, preText } = dynamicArgInfo
        if (!this.getInput) return // 避免协作报错
        const endTxt = getValue(endText, 0, '')
        const preTxt = getValue(preText, 0, '')
        const n = this.dynamicArgumentIds_.length
        // 与 test3.js 一致：n===0 且 beforeArg 时，preText + endText 合并显示
        if (n === 0 && preTxt + endTxt !== '') {
            if (beforeArg)
                this.appendDummyInput('ENDTEXT').appendField(
                    preTxt + endTxt,
                    'ENDTEXT'
                )
            else if (endTxt !== '')
                this.appendDummyInput('ENDTEXT').appendField(
                    endTxt,
                    'ENDTEXT'
                )
        } else if (endTxt !== '') {
            this.appendDummyInput('ENDTEXT').appendField(endTxt, 'ENDTEXT')
        }
        updatePreText(this, 0)
        this.appendDummyInput('PLUS').appendField(this.plusButton_)
        // 将 + 按钮移到 afterArg 后面或 beforeArg 前面
        if (afterArg || beforeArg) {
            const plusInput = this.getInput('PLUS')
            const endTxtInput = this.getInput('ENDTEXT')
            const plusIndex = this.inputList.indexOf(plusInput)

            const argInput = this.getInput(afterArg ?? beforeArg)
            let argIdx = this.inputList.indexOf(argInput)
            if (plusIndex > -1 && argIdx > -1) {
                // 删除 PLUS 输入
                this.inputList.splice(plusIndex, 1)
                argIdx = this.inputList.indexOf(argInput)
                if (afterArg) {
                    // 插入 PLUS 输入到 afterArg 后面
                    this.inputList.splice(argIdx + 1, 0, plusInput)
                    const endTxtIndex = this.inputList.indexOf(endTxtInput)
                    if (endTxtIndex > -1) {
                        this.inputList.splice(endTxtIndex, 1)
                        argIdx = this.inputList.indexOf(argInput)
                        this.inputList.splice(argIdx + 1, 0, endTxtInput)
                    }
                    updatePreText(this, 0)
                } else if (beforeArg) {
                    // 插入 PLUS 输入到 beforeArg 前面
                    this.inputList.splice(argIdx, 0, plusInput)
                    const endTxtIndex = this.inputList.indexOf(endTxtInput)
                    if (endTxtIndex > -1) {
                        this.inputList.splice(endTxtIndex, 1)
                        argIdx = this.inputList.indexOf(plusInput)
                        this.inputList.splice(argIdx, 0, endTxtInput)
                    }
                }
            }
        }
    }

    // Supports deleting specified parameters with right-click
    blockDefinition.customContextMenu = function (contextMenu) {
        if (this.isInFlyout) return // 不对toolbax中的积木提供右键菜单支持
        let separator_ = true
        this.dynamicArgOptionalTypes_.forEach(i => {
            const _text = document.createElement('div')
            _text.classList.add('keyboard-shortcuts-item')
            const ltext = document.createElement('span')
            ltext.textContent = translate(
                ScratchBlocks,
                INPUT_TYPES_OPTIONS_LABEL[i]
            )
            const rtext = document.createElement('span')
            rtext.classList.add('keyboard-shortcuts')
            rtext.textContent = '+'
            _text.appendChild(ltext)
            _text.appendChild(rtext)
            contextMenu.splice(-1, 0, {
                text: _text,
                enabled: true,
                callback: () => {
                    this.addDynamicArg(i)
                },
                separator: separator_
            })
            separator_ = false
        })

        separator_ = true
        const len = this.dynamicArgumentIds_.length
        let sum = 0
        let i = 0
        let inc = 0
        const args = []
        while (sum < len) {
            inc = getParamsIncPerClick.call(this, i)
            sum += inc
            if (sum <= len) args.push(this.dynamicArgumentIds_[sum - 1])
            i++
        }

        args.forEach((id, idx) => {
            const element = document.createElement('div')
            element.classList.add('keyboard-shortcuts-item')
            const ltext = document.createElement('span')
            ltext.textContent = `${ScratchBlocks.ScratchMsgs.translate('DELETE_DYNAMIC_PARAMETER')} ${idx + 1}`
            const rtext = document.createElement('span')
            rtext.classList.add('keyboard-shortcuts')
            rtext.textContent = '-'
            element.appendChild(ltext)
            element.appendChild(rtext)

            const matches = id.match(/^([^\d]+)(\d+)$/)
            const name = matches[1]
            const i = Number(matches[2])
            const ids = getParamsGroupindexes
                .call(this, i)
                .map(it => `${name}${it}`)
            const elems = []
            this.inputList
                .filter(it => ids.includes(it.name))
                .forEach(input => {
                    const pathElement = input.connection.targetConnection
                        ? input.connection.targetConnection.sourceBlock_
                              .svgPath_
                        : input.outlinePath
                    element.addEventListener('mouseenter', () => {
                        const replacementGlowFilterId =
                            this.workspace.options.replacementGlowFilterId ||
                            'blocklyReplacementGlowFilter'
                        pathElement.setAttribute(
                            'filter',
                            `url(#${replacementGlowFilterId})`
                        )
                    })
                    element.addEventListener('mouseleave', () => {
                        pathElement.removeAttribute('filter')
                    })
                    elems.push(pathElement)
                })
            if (separator_) {
                let _i1 = 0
                _i1 = setTimeout(() => {
                    if (element.parentElement?.parentElement) {
                        element.parentElement.parentElement.style.borderStyle =
                            'dashed'
                        clearTimeout(_i1)
                    }
                }, 0)
            }
            contextMenu.splice(-1, 0, {
                text: element,
                enabled: true,
                callback: () => {
                    elems.forEach(it => it.removeAttribute('filter'))
                    this.removeDynamicArg(id)
                },
                separator: separator_
            })
            separator_ = false
        })
    }

    blockDefinition.attachShadow_ = function (
        input,
        argumentType,
        defaultValue = ''
    ) {
        // 与 test3.js 一致：跳过布尔类型，支持自定义类型（如 argument_reporter_string_number）
        if (argumentType === 'b') return
        let blockType
        switch (argumentType) {
            case 'n':
                blockType = 'math_number'
                break
            case 's':
                blockType = 'text'
                break
            default:
                blockType = argumentType
                break
        }
        ScratchBlocks.Events.disable()
        const newBlock = this.workspace.newBlock(blockType)
        try {
            if (argumentType === 'n') {
                newBlock.setFieldValue(defaultValue, 'NUM')
            } else if (argumentType === 's') {
                newBlock.setFieldValue(defaultValue, 'TEXT')
            } else if (argumentType === 'argument_reporter_string_number') {
                newBlock.setFieldValue(defaultValue, 'VALUE')
            }
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
        newBlock.outputConnection.connect(input.connection)
    }

    blockDefinition.mutationToDom = function () {
        const container = document.createElement('mutation')
        container.setAttribute(
            'dynamicargids',
            JSON.stringify(this.dynamicArgumentIds_)
        )
        container.setAttribute(
            'dynamicargtypes',
            JSON.stringify(this.dynamicArgumentTypes_)
        )
        return container
    }

    blockDefinition.domToMutation = function (xmlElement) {
        this.dynamicArgumentIds_ =
            JSON.parse(xmlElement.getAttribute('dynamicargids')) || []
        this.dynamicArgumentTypes_ =
            JSON.parse(xmlElement.getAttribute('dynamicargtypes')) || []
        this.updateDisplay_()
    }

    blockDefinition.addDynamicArg = function (type) {
        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        ScratchBlocks.Events.setGroup(true)

        let index = 0
        const lastArgName = this.dynamicArgumentIds_.slice(-1)[0]
        if (lastArgName) {
            // 获取最后一个参数的索引
            ;[index] = lastArgName.match(/\d+/g)
        }
        index = Number(index)

        // 计算本次点击增加的参数数量
        const cnt = getNextParamInc.call(this)
        for (let i = 0; i < cnt; i++) {
            this.dynamicArgumentIds_.push(`DYNAMIC_ARGS${index + i + 1}`)
            // 与 test3.js 一致：支持 specifiedArgTypes 按位置指定类型
            const specifiedType = this.specifiedArgTypes?.[index + i]
            if (specifiedType) {
                this.dynamicArgumentTypes_.push(specifiedType)
            } else {
                this.dynamicArgumentTypes_.push(type)
            }
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

    /**
     * 根据id删除动态积木（支持成组删除）
     *
     * 修复中间删除 bug（前移策略）：
     *   不直接删除中间的参数 id（会导致 DYNAMIC_ARGS 序号断开，
     *   getDynamicArgs 无法获取后续参数），而是将后续参数的
     *   连接内容前移覆盖被删除位置，然后删除末尾的参数 id。
     *
     *   示例：删除 D3（5个参数）
     *     前：[D1, D2, D3, D4, D5]
     *     前移：D3 内容 = D4 内容, D4 内容 = D5 内容
     *     后：[D1, D2, D3, D4]  （D5 被删除）
     *
     * @param {string} id 参数id
     */
    blockDefinition.removeDynamicArg = function (id) {
        ScratchBlocks.Events.setGroup(true)

        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        const matches = id.match(/^([^\d]+)(\d+)$/)
        const name = matches[1]
        // 当前动态参数序号
        const i = Number(matches[2])
        // 查找要移除的参数组
        const paramsToRemove = getParamsGroupindexes.call(this, i)
        const removeCount = paramsToRemove.length
        const startNum = paramsToRemove[0]

        // —— 前移策略：在 connectionMap 中将后续参数内容前移 ——
        const wasRendered = this.rendered
        this.rendered = false

        // 1. 断开所有动态参数连接，保存到 connectionMap
        const connectionMap = this.disconnectDynamicArgBlocks_()
        this.removeAllDynamicArgInputs_()

        // 2. 前移 connectionMap：将 startNum+removeCount 之后的连接移到 startNum
        //    这样中间被删除的位置会被后面的内容覆盖，末尾多余的自然消失
        for (let j = startNum; ; j++) {
            const srcKey = `${name}${j + removeCount}`
            const dstKey = `${name}${j}`
            if (srcKey in connectionMap) {
                connectionMap[dstKey] = connectionMap[srcKey]
                if (srcKey !== dstKey) delete connectionMap[srcKey]
            } else {
                // 没有更多后续参数，清除被删除位置的内容
                delete connectionMap[dstKey]
                break
            }
        }

        // 3. 前移 dynamicArgumentTypes_ 并删除末尾
        const startIdx = this.dynamicArgumentIds_.indexOf(
            `${name}${startNum}`
        )
        if (startIdx !== -1) {
            const len = this.dynamicArgumentTypes_.length
            for (let j = startIdx; j + removeCount < len; j++) {
                this.dynamicArgumentTypes_[j] =
                    this.dynamicArgumentTypes_[j + removeCount]
            }
            this.dynamicArgumentTypes_.splice(len - removeCount, removeCount)
            // 从 dynamicArgumentIds_ 末尾删除 removeCount 个
            this.dynamicArgumentIds_.splice(
                this.dynamicArgumentIds_.length - removeCount,
                removeCount
            )
        }

        // 4. 用前移后的 connectionMap 重建输入
        this.createAllDynamicArgInputs_(connectionMap)
        this.deleteShadows_(connectionMap)

        this.rendered = wasRendered
        if (wasRendered && !this.isInsertionMarker()) {
            this.initSvg()
            this.render()
        }

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
            // VM 同步：清理不再存在的动态参数 inputs
            // 注意：updateDisplay_ 中的 connect 已通过 BlockMove 事件
            // 自动将后续参数的 block 前移到正确位置（如 D3 的 C 移到 D2）。
            // 这里只需删除 dynamicArgumentIds_ 中不存在的残留 inputs（如 D3），
            // 不能前移 block.inputs，否则会覆盖 connect 已设置的正确值。
            setTimeout(() => {
                try {
                    const target = runtime.getEditingTarget()
                    const block = target.blocks._blocks[this.id]
                    if (!block || !block.inputs) return
                    const validIds = new Set(this.dynamicArgumentIds_)
                    for (const inputName of Object.keys(block.inputs)) {
                        if (
                            /^DYNAMIC_ARGS\d+$/.test(inputName) &&
                            !validIds.has(inputName)
                        ) {
                            const inputDef = block.inputs[inputName]
                            if (inputDef?.shadow) {
                                target.blocks.deleteBlock(inputDef.shadow, {
                                    source: 'default',
                                    targetId: target.id
                                })
                            }
                            delete block.inputs[inputName]
                            if (runtime.emitTargetBlocksChanged) {
                                runtime.emitTargetBlocksChanged(target.id, [
                                    'deleteInput',
                                    { id: block.id, inputName }
                                ])
                            }
                        }
                    }
                } catch {
                    /* VM 同步失败忽略 */
                }
            }, 0)
        }

        ScratchBlocks.Events.setGroup(false)
    }

    blockDefinition.updateDisplay_ = function () {
        const wasRendered = this.rendered
        this.rendered = false

        const connectionMap = this.disconnectDynamicArgBlocks_()
        this.removeAllDynamicArgInputs_()

        this.createAllDynamicArgInputs_(connectionMap) // <--问题处在这里
        this.deleteShadows_(connectionMap)

        this.rendered = wasRendered
        if (wasRendered && !this.isInsertionMarker()) {
            this.initSvg()
            this.render()
        }
    }

    blockDefinition.disconnectDynamicArgBlocks_ = function () {
        // Remove old stuff
        const connectionMap = {}
        for (let i = 0; this.inputList[i]; i++) {
            const input = this.inputList[i]
            if (input.connection && /^DYNAMIC_ARGS\d+$/.test(input.name)) {
                const target = input.connection.targetBlock()
                const saveInfo = {
                    shadow: input.connection.getShadowDom(),
                    block: target
                }
                connectionMap[input.name] = saveInfo

                // Remove the shadow DOM, then disconnect the block.  Otherwise a shadow
                // block will respawn instantly, and we'd have to remove it when we remove
                // the input.
                input.connection.setShadowDom(null)
                if (target) {
                    input.connection.disconnect()
                }
            }
        }
        return connectionMap
    }

    blockDefinition.removeAllDynamicArgInputs_ = function () {
        // Delete inputs directly instead of with block.removeInput to avoid splicing
        // out of the input list at every index.
        const inputList = []
        for (let i = 0; this.inputList[i]; i++) {
            const input = this.inputList[i]
            if (/^DYNAMIC_ARGS\d+$/.test(input.name)) {
                input.dispose()
            } else {
                inputList.push(input)
            }
        }
        this.inputList = inputList
    }

    function updatePreText(block, num) {
        const { preText, afterArg, beforeArg } = block.dynamicArgInfo_
        if (preText) {
            // beforeArg 模式下 preText 在 createAllDynamicArgInputs_ 中通过 joinCh 处理
            if (beforeArg) return
            // 动态参数前的文本修改为 preText
            const txt = getValue(preText, num, '')
            let input
            if (afterArg) {
                input = block.inputList.find(i => i.name === afterArg) // 改afterArg前面的文本
            } else {
                input = block.inputList.findLast(
                    it =>
                        it.name !== 'PLUS' &&
                        it.name !== 'MINUS' &&
                        it.name !== 'ENDTEXT'
                ) // 改第一个参数前的文本
            }

            // 查找afterArg对应的参数前面的文本（ScratchBlocks.FieldLabel）
            if (input)
                input.fieldRow
                    .findLast(it => it instanceof ScratchBlocks.FieldLabel)
                    ?.setText(txt)
        }
    }

    blockDefinition.createAllDynamicArgInputs_ = function (connectionMap) {
        // Create arguments and labels as appropriate.
        const num = this.dynamicArgumentTypes_.length
        const { endText, joinCh, afterArg, beforeArg, preText } =
            this.dynamicArgInfo_
        updatePreText(this, num)
        for (let i = 0; i < num; i++) {
            const argumentType = this.dynamicArgumentTypes_[i]
            // 与 test3.js 一致：允许自定义类型（如 argument_reporter_string_number）
            if (
                !(
                    argumentType === 'n' ||
                    argumentType === 'b' ||
                    argumentType === 's' ||
                    argumentType === 'l' ||
                    argumentType === 'r' ||
                    argumentType === 'argument_reporter_string_number'
                )
            ) {
                throw new Error(
                    `Found an dynamic argument with an invalid type: ${argumentType}`
                )
            }

            const id = this.dynamicArgumentIds_[i]
            const input = this.appendValueInput(id)
            // 增加参数间的分隔符
            // Add a separator character before the argument, eg. ","
            if (joinCh && (i !== 0 || afterArg)) {
                input.appendField(getValue(joinCh, i, ''))
            }
            // beforeArg 模式下，第一个参数前用 preText 作为分隔符
            if (beforeArg && i === 0) {
                input.appendField(getValue(joinCh, i, preText))
            }
            if (argumentType === 'b') {
                input.setCheck('Boolean')
            }
            this.populateArgument_(argumentType, connectionMap, id, input, i)
        }
        // 动态参数后的文本
        let txt = getValue(endText, num, '')
        // beforeArg 模式下，无参数时 preText + endText 合并
        if (beforeArg && num === 0) txt = getValue(preText, num, '') + txt
        if (txt === '') {
            this.removeInput('ENDTEXT', true) // 删除ENDTEXT输入
        } else {
            const field = this.getField('ENDTEXT')
            if (field) field.setValue(txt)
            else this.appendDummyInput('ENDTEXT').appendField(txt, 'ENDTEXT')
        }
        // 将动态参数移到特定位置，并调整按钮位置
        if (afterArg) {
            moveButtonToTheRightPlace.call(this)
            const cnt = this.dynamicArgumentTypes_.length
            for (let i = cnt - 1; i >= 0; i--) {
                const id = this.dynamicArgumentIds_[i]
                this.moveInputBefore(id, afterArg)
                this.moveInputBefore(afterArg, id)
            }
        } else if (beforeArg) {
            // beforeArg 模式：动态参数移到 beforeArg 前面
            const cnt = this.dynamicArgumentTypes_.length
            for (let i = 0; i < cnt; i++) {
                const id = this.dynamicArgumentIds_[i]
                this.moveInputBefore(id, beforeArg)
            }
            moveButtonToTheRightPlace.call(this)
        } else {
            moveButtonToTheRightPlace.call(this)
        }
    }

    blockDefinition.populateArgument_ = function (
        type,
        connectionMap,
        id,
        input,
        i
    ) {
        let oldBlock = null
        let oldShadow = null
        if (connectionMap && id in connectionMap) {
            const saveInfo = connectionMap[id]
            oldBlock = saveInfo.block
            oldShadow = saveInfo.shadow
        }

        const getDefaultValue = (id, i) => {
            const { defaultValues, afterArg } = this.dynamicArgInfo_
            const type = typeof defaultValues
            // 默认值是函数，则调用函数获取默认值
            if (type === 'function') return defaultValues(i, id)
            // 默认值是列表
            if (Array.isArray(defaultValues)) {
                const len = defaultValues.length
                // 与 test3.js 一致：i <= len - 1 时直接取 defaultValues[i]
                if (i <= len - 1) return defaultValues[i]
                // 超出列表长度，则取最后一项+递增编号
                return `${defaultValues[len - 1]}${i - len + 2}`
            }
            // 使用前一个参数的值（与 test3.js 的 @PRE_ARG@ 策略一致）
            if (defaultValues === '@PRE_ARG@') {
                let previousArgName = null
                let previousArgValue = ''

                if (i > 0) {
                    // DYNAMIC_ARGS 使用 1-based 命名，第 i 个参数（0-based）的前一个是 DYNAMIC_ARGS${i}
                    previousArgName = `DYNAMIC_ARGS${i}`
                } else if (afterArg) {
                    // afterArg 模式下，第一个动态参数的前一个是 afterArg 静态参数
                    previousArgName = afterArg
                }
                if (previousArgName) {
                    const previousArgInput = this.getInput(previousArgName)
                    if (previousArgInput && previousArgInput.connection) {
                        const targetBlock =
                            previousArgInput.connection.targetBlock()
                        if (targetBlock && targetBlock.getFieldValue) {
                            previousArgValue =
                                targetBlock.getFieldValue('TEXT') ||
                                targetBlock.getFieldValue('NUM') ||
                                ''
                        }
                    }
                }
                return previousArgValue
            }
            // 默认值是数字或字符串，直接返回
            return defaultValues
        }

        if (connectionMap && oldBlock) {
            // Reattach the old block and shadow DOM.
            connectionMap[input.name] = null
            oldBlock.outputConnection.connect(input.connection)
            if (type !== 'b') {
                const shadowDom = oldShadow || this.buildShadowDom_(type)
                input.connection.setShadowDom(shadowDom)
            }
        } else {
            this.attachShadow_(input, type, getDefaultValue(id, i))
        }
    }

    blockDefinition.deleteShadows_ =
        ScratchBlocks.ScratchBlocks.ProcedureUtils.deleteShadows_

    blockDefinition.buildShadowDom_ =
        ScratchBlocks.ScratchBlocks.ProcedureUtils.buildShadowDom_
}

const patchSymbol = Symbol('patch')

/**
 * Initializes expandable blocks for a given extension.
 * @param {Object} extension - The extension object.
 * @param {string} plusImage - The image data for the plus button.
 * @param {string} minusImage - The image data for the minus button.
 */
function initExpandableBlocks(
    extension,
    plusImage = rightArrow,
    minusImage = leftArrow,
    rightSelectButton = defaultPlusSelectImage
) {
    const { runtime, ScratchBlocks } = extension
    // 详情页（播放器）不需要设置可扩展积木（与 test3.js 一致）
    if (runtime.isPlayerOnly) return
    // 创建按钮
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
    // patch getInfo，每次调用时同时刷新最新的可扩展参数信息
    extension.getInfo = function () {
        const info = origGetInfo.call(this)
        const { id, blocks: blocksInfo } = info
        // 注册扩展信息
        extInfo[id] = { id, PlusSelectButton, PlusButton, MinusButton }
        blocksInfo.forEach(i => {
            // 如果积木定义了可扩展参数
            const { dynamicArgsInfo } = i
            if (dynamicArgsInfo) {
                dynamicArgsInfo.dynamicArgTypes =
                    dynamicArgsInfo.dynamicArgTypes || ['s']
                dynamicArgsInfo.extInfo = extInfo[id]
                enabledDynamicArgBlocksInfo[`${id}_${i.opcode}`] =
                    dynamicArgsInfo
            }
        })
        return info
    }
}

/**
 * get values of dynamic args from args
 * @param {object} args - arguments objects
 * @returns {Array} values of dynamic args
 */
function getDynamicArgs(args) {
    // 依赖 Object.keys 确定自定义参数顺序可能有bug
    // return Object.keys(args)
    //   .filter((key) => key.startsWith('DYNAMIC_ARGS'))
    //   .map((key) => args[key]);

    // 尝试通过按序号顺序读取
    const res = []
    for (let i = 1; ; i++) {
        const v = args[`DYNAMIC_ARGS${i}`]
        if (v === undefined) return res
        res.push(v)
    }
}

export { getDynamicArgs, initExpandableBlocks }
