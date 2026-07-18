/**
 * 基于 Nights / FurryR / zxq 的可扩展积木 (动态参数)
 * 历经深度 AI 优化：极简、丝滑、防跳动、防截断、完美类型兼容
 */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
/* eslint-disable max-classes-per-file */

const INPUT_TYPES_OPTIONS_LABEL = {
    s: 'ADD_TEXT_PARAMETER',
    n: 'ADD_NUM_PARAMETER',
    b: 'ADD_BOOL_PARAMETER'
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
        DELETE_DYNAMIC_PARAMETER: 'Delete Parameter'
    })
    Object.assign(ScratchBlocks.ScratchMsgs.locales['zh-cn'], {
        ADD_TEXT_PARAMETER: '添加文本参数',
        ADD_NUM_PARAMETER: '添加数字参数',
        ADD_BOOL_PARAMETER: '添加布尔值参数',
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

function initExpandableBlock(
    runtime,
    blockDefinition,
    dynamicArgInfo,
    ScratchBlocks
) {
    const { PlusSelectButton, PlusButton, MinusButton } = dynamicArgInfo.extInfo

    function getValue(value, i, defaultValue, valueWhenOutOfRange) {
        if (value === undefined) return defaultValue
        if (Array.isArray(value)) {
            if (i < value.length) return value[i]
            if (valueWhenOutOfRange !== undefined) return valueWhenOutOfRange
            return value[value.length - 1]
        }
        return typeof value === 'function' ? value(i) : value
    }

    function getParamsIncPerClick(i) {
        return getValue(this.dynamicArgInfo_.paramsIncrement, i, 1, 0)
    }

    function getParamsGroupindexes(num) {
        let sum = 0,
            i = 0,
            inc = 0
        while (sum < num) {
            inc = getParamsIncPerClick.call(this, i)
            if (inc === 0) break
            sum += inc
            i++
        }
        sum -= inc
        return Array.from({ length: inc }, (_, j) => sum + j + 1)
    }

    function getNextParamInc() {
        let sum = 0,
            i = 0
        while (sum < this.dynamicArgumentTypes_.length) {
            const inc = getParamsIncPerClick.call(this, i)
            if (inc === 0) break
            sum += inc
            i++
        }
        return getParamsIncPerClick.call(this, i)
    }

    const reorderInputs = function () {
        const { afterArg } = this.dynamicArgInfo_
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
                        !name.startsWith('DYNAMIC_ARGS') &&
                        !['ENDTEXT', 'MINUS', 'PLUS'].includes(name)
                    ) {
                        insertBeforeName = name
                        break
                    }
                }
            }
        }

        this.dynamicArgumentIds_.forEach(id => {
            if (this.getInput(id)) this.moveInputBefore(id, insertBeforeName)
        })
        if (this.getInput('ENDTEXT'))
            this.moveInputBefore('ENDTEXT', insertBeforeName)
        if (this.getInput('MINUS'))
            this.moveInputBefore('MINUS', insertBeforeName)
        if (this.getInput('PLUS'))
            this.moveInputBefore('PLUS', insertBeforeName)
    }

    const updateButton = function () {
        this.getInput('PLUS').setVisible(getNextParamInc.call(this) > 0)

        if (this.dynamicArgumentTypes_.length === 0) {
            this.removeInput('MINUS', true)
        } else if (!this.getInput('MINUS')) {
            this.appendDummyInput('MINUS').appendField(new MinusButton())
        }
        reorderInputs.call(this)
    }

    const orgInit = blockDefinition.init
    blockDefinition.init = function () {
        orgInit.call(this)

        this.dynamicArgumentIds_ = []
        this.dynamicArgumentTypes_ = []
        this.dynamicArgInfo_ = dynamicArgInfo
        this.dynamicArgOptionalTypes_ = dynamicArgInfo.dynamicArgTypes

        this.plusButton_ =
            dynamicArgInfo.dynamicArgTypes.length > 1
                ? new PlusSelectButton()
                : new PlusButton()

        if (!this.getInput) return
        updatePreText(this, 0)

        const { endText } = dynamicArgInfo
        const endTxt = getValue(endText, 0, '')
        if (endTxt !== '')
            this.appendDummyInput('ENDTEXT').appendField(endTxt, 'ENDTEXT')
        this.appendDummyInput('PLUS').appendField(this.plusButton_)

        reorderInputs.call(this)
    }

    blockDefinition.customContextMenu = function (contextMenu) {
        if (this.isInFlyout) return
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
                separator: separator_,
                callback: () => this.addDynamicArg(i)
            })
            separator_ = false
        })

        separator_ = true
        const len = this.dynamicArgumentIds_.length
        let sum = 0,
            i = 0,
            inc = 0
        const args = []

        while (sum < len) {
            inc = getParamsIncPerClick.call(this, i)
            if (inc === 0) break
            sum += inc
            if (sum <= len) args.push(this.dynamicArgumentIds_[sum - 1])
            i++
        }

        args.forEach((id, idx) => {
            const element = document.createElement('div')
            element.classList.add('keyboard-shortcuts-item')

            const ltext = document.createElement('span')
            ltext.textContent = `${translate(ScratchBlocks, 'DELETE_DYNAMIC_PARAMETER')} ${idx + 1}`

            const rtext = document.createElement('span')
            rtext.classList.add('keyboard-shortcuts')
            rtext.textContent = '-'

            element.appendChild(ltext)
            element.appendChild(rtext)

            const match = id.match(/^([^\d]+)(\d+)$/)
            if (!match) return
            const name = match[1]
            const j = Number(match[2])
            const ids = getParamsGroupindexes
                .call(this, j)
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
    }

    blockDefinition.attachShadow_ = function (
        input,
        argumentType,
        defaultValue = ''
    ) {
        const typeMap = {
            n: 'math_number',
            b: 'logic_boolean',
            s: 'text',
            l: 'text'
        }
        const blockType = typeMap[argumentType] || 'text'

        ScratchBlocks.Events.disable()
        const newBlock = this.workspace.newBlock(blockType)

        try {
            if (argumentType === 'n')
                newBlock.setFieldValue(defaultValue, 'NUM')
            else if (argumentType === 's' || argumentType === 'l')
                newBlock.setFieldValue(defaultValue, 'TEXT')

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

        // 强健的 ID 防碰撞逻辑：找寻最大的后缀数字
        let maxIndex = 0
        this.dynamicArgumentIds_.forEach(id => {
            const match = id.match(/\d+/)
            if (match) maxIndex = Math.max(maxIndex, parseInt(match[0], 10))
        })

        const cnt = getNextParamInc.call(this)
        for (let i = 0; i < cnt; i++) {
            this.dynamicArgumentIds_.push(`DYNAMIC_ARGS${maxIndex + i + 1}`)
            this.dynamicArgumentTypes_.push(type)
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

    blockDefinition.removeDynamicArg = function (id) {
        ScratchBlocks.Events.setGroup(true)

        const oldMutationDom = this.mutationToDom()
        const oldMutation =
            oldMutationDom && ScratchBlocks.Xml.domToText(oldMutationDom)

        const match = id.match(/^([^\d]+)(\d+)$/)
        if (!match) {
            ScratchBlocks.Events.setGroup(false)
            return
        }

        const name = match[1]
        const indexToRem = Number(match[2])
        const paramsToRemove = getParamsGroupindexes.call(this, indexToRem)

        paramsToRemove.forEach(it => {
            const curId = `${name}${it}`
            const idx = this.dynamicArgumentIds_.indexOf(curId)
            if (idx !== -1) {
                this.dynamicArgumentIds_.splice(idx, 1)
                this.dynamicArgumentTypes_.splice(idx, 1)
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

    blockDefinition.updateDisplay_ = function () {
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

    blockDefinition.disconnectDynamicArgBlocks_ = function () {
        const connectionMap = {}
        for (let i = 0; i < this.inputList.length; i++) {
            const input = this.inputList[i]
            if (input.connection && /^DYNAMIC_ARGS\d+$/.test(input.name)) {
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

    blockDefinition.removeAllDynamicArgInputs_ = function () {
        const inputList = []
        for (let i = 0; i < this.inputList.length; i++) {
            const input = this.inputList[i]
            if (/^DYNAMIC_ARGS\d+$/.test(input.name)) input.dispose()
            else inputList.push(input)
        }
        this.inputList = inputList
    }

    function updatePreText(block, num) {
        const { preText, afterArg } = block.dynamicArgInfo_
        if (!preText) return

        const txt = getValue(preText, num, '')
        let input

        if (afterArg) {
            input = block.inputList.find(i => i.name === afterArg)
        } else {
            // 零内存分配的高效安全查找
            for (let i = block.inputList.length - 1; i >= 0; i--) {
                const it = block.inputList[i]
                if (!['PLUS', 'MINUS', 'ENDTEXT'].includes(it.name)) {
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

    blockDefinition.createAllDynamicArgInputs_ = function (connectionMap) {
        const num = this.dynamicArgumentTypes_.length
        const { endText, joinCh, afterArg } = this.dynamicArgInfo_
        updatePreText(this, num)

        for (let i = 0; i < num; i++) {
            const argumentType = this.dynamicArgumentTypes_[i]
            const id = this.dynamicArgumentIds_[i]
            const input = this.appendValueInput(id)

            if (joinCh && (i !== 0 || afterArg)) {
                input.appendField(getValue(joinCh, i, ''))
            }

            // 严谨兼容的类型限制
            if (argumentType === 'b') input.setCheck('Boolean')
            else if (argumentType === 'n') input.setCheck('Number')
            // 's' 和 'l' 文本输入在 Scratch 中允许任意类型的块塞入，因此不设 Check

            this.populateArgument_(argumentType, connectionMap, id, input, i)
        }

        const txt = getValue(endText, num, '')
        if (txt === '') {
            this.removeInput('ENDTEXT', true)
        } else {
            const field = this.getField('ENDTEXT')
            if (field) field.setValue(txt)
            else this.appendDummyInput('ENDTEXT').appendField(txt, 'ENDTEXT')
        }

        updateButton.call(this)
    }

    blockDefinition.populateArgument_ = function (
        type,
        connectionMap,
        id,
        input,
        i
    ) {
        let oldBlock = null,
            oldShadow = null
        if (connectionMap && id in connectionMap) {
            const saveInfo = connectionMap[id]
            oldBlock = saveInfo.block
            oldShadow = saveInfo.shadow
        }

        const getDefaultValue = (id, idx) => {
            const { defaultValues } = this.dynamicArgInfo_
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
                i.dynamicArgsInfo.dynamicArgTypes = i.dynamicArgsInfo
                    .dynamicArgTypes || ['s']
                i.dynamicArgsInfo.extInfo = extInfo[id]
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
 */
function getDynamicArgs(args) {
    return Object.keys(args)
        .filter(key => /^DYNAMIC_ARGS\d+$/.test(key))
        .sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0], 10)
            const numB = parseInt(b.match(/\d+/)[0], 10)
            return numA - numB
        })
        .map(key => args[key])
}

export { getDynamicArgs, initExpandableBlocks, isMutableBlock, cleanInputs }
